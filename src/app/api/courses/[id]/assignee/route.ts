import { NextResponse } from "next/server"
import "@/DB/db"
import { Course } from "@/models/course"
import { Student } from "@/models/student"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const resolveObjectId = (value: string) => {
  if (!value || !Types.ObjectId.isValid(value)) return null
  return new Types.ObjectId(value)
}

// ======================
// POST /api/courses/[id]/assignee
// - Assign students to a course
// Payload: { assignee: ["student_id1", "student_id2", ...] }
// ======================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    const { assignee } = body ?? {}

    // Validate course ID
    const courseObjectId = resolveObjectId(id)
    if (!courseObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid course identifier" },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await Course.findById(courseObjectId)
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    // Validate assignee array
    if (!assignee || !Array.isArray(assignee)) {
      return NextResponse.json(
        { success: false, message: "Assignee must be an array of student IDs" },
        { status: 400 }
      )
    }

    if (assignee.length === 0) {
      return NextResponse.json(
        { success: false, message: "Assignee array cannot be empty" },
        { status: 400 }
      )
    }

    // Validate all student IDs
    const studentObjectIds: Types.ObjectId[] = []
    for (const studentId of assignee) {
      if (!studentId || typeof studentId !== "string") {
        return NextResponse.json(
          { success: false, message: "All assignee items must be valid student ID strings" },
          { status: 400 }
        )
      }
      const objectId = resolveObjectId(studentId)
      if (!objectId) {
        return NextResponse.json(
          { success: false, message: `Invalid student ID: ${studentId}` },
          { status: 400 }
        )
      }
      studentObjectIds.push(objectId)
    }

    // Verify all students exist
    const students = await Student.find({
      _id: { $in: studentObjectIds },
    })

    if (students.length !== studentObjectIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more students not found" },
        { status: 404 }
      )
    }

    // Get current assignees to handle updates
    const currentAssignees = course.assignee || []
    const currentAssigneeIds = currentAssignees.map((id: any) => id.toString())

    // Update course assignee
    course.assignee = studentObjectIds
    await course.save()

    // Update students' courses array
    // Remove course from students who are no longer assigned
    const removedStudentIds = currentAssigneeIds.filter(
      (id) => !studentObjectIds.some((newId) => newId.toString() === id)
    )

    if (removedStudentIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: removedStudentIds } },
        {
          $pull: { courses: courseObjectId },
        }
      )
    }

    // Add course to newly assigned students
    const newStudentIds = studentObjectIds.filter(
      (id) => !currentAssigneeIds.includes(id.toString())
    )

    if (newStudentIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: newStudentIds } },
        {
          $addToSet: { courses: courseObjectId },
        }
      )
    }

    // Recalculate progressSummary for all affected students
    const allAffectedStudentIds = [...studentObjectIds, ...removedStudentIds.map(id => new Types.ObjectId(id))]
    
    for (const studentId of allAffectedStudentIds) {
      const student = await Student.findById(studentId)
      if (student) {
        const studentCourses = student.courses || []
        const studentGrades = student.grades || []
        
        const completedCourses = studentGrades.length
        const ongoingCourses = Math.max(0, studentCourses.length - completedCourses)
        
        let completedCredits = 0
        if (studentGrades.length > 0) {
          const courseIds = studentGrades
            .map((grade: any) => {
              if (typeof grade === "string") return grade
              return grade.course_id || grade.course || grade.courseId
            })
            .filter((id: any) => id && Types.ObjectId.isValid(id))
          
          if (courseIds.length > 0) {
            const validCourseIds = courseIds.map((id: any) => new Types.ObjectId(id))
            const completedCourseDetails = await Course.find({
              _id: { $in: validCourseIds },
            })
            completedCredits = completedCourseDetails.reduce(
              (sum: number, course: any) => sum + (course.credits || 0),
              0
            )
          }
        }

        student.progressSummary = {
          completedCourses,
          ongoingCourses,
          completedCredits,
        }
        await student.save()
      }
    }

    // Fetch updated course with populated assignee and faculty_members
    let updatedCourse
    try {
      updatedCourse = await Course.findById(courseObjectId)
        .populate("faculty_members", "name faculty_id _id")
        .populate("assignee", "first_name last_name email _id")
    } catch (populateError: any) {
      if (populateError.message?.includes("assignee")) {
        updatedCourse = await Course.findById(courseObjectId)
          .populate("faculty_members", "name faculty_id _id")
      } else {
        throw populateError
      }
    }
    
    // Populate faculty details and add status to assignees
    if (updatedCourse) {
      const courseObj = updatedCourse.toObject ? updatedCourse.toObject() : updatedCourse
      
      // Add status to each assignee
      if (courseObj.assignee && Array.isArray(courseObj.assignee)) {
        courseObj.assignee = await Promise.all(
          courseObj.assignee.map(async (student: any) => {
            if (student && student._id) {
              const studentDoc = await Student.findById(student._id)
                .select("grades")
                .lean()
              
              // Check if student has a grade for this course
              const hasGrade = studentDoc?.grades?.some((grade: any) => {
                const gradeCourseId = typeof grade === "string"
                  ? grade
                  : grade.course_id || grade.course || grade.courseId
                return gradeCourseId && gradeCourseId.toString() === courseObj._id.toString()
              }) || false
              
              return {
                ...student,
                status: hasGrade ? "passed" : "ongoing",
              }
            }
            return {
              ...student,
              status: "ongoing",
            }
          })
        )
      }
      
      if (courseObj.faculty_members && Array.isArray(courseObj.faculty_members)) {
        courseObj.faculty_members = await Promise.all(
          courseObj.faculty_members.map(async (member: any) => {
            if (member && member.faculty_id) {
              const { Faculty } = await import("@/models/faculty")
              const faculty = await Faculty.findById(member.faculty_id)
                .select("-courses")
                .lean()
              return {
                ...member,
                faculty: faculty || null,
              }
            }
            return member
          })
        )
        updatedCourse = courseObj
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Students assigned to course successfully",
        result: updatedCourse,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error assigning students to course", error)
    return NextResponse.json(
      { success: false, message: "Failed to assign students to course" },
      { status: 500 }
    )
  }
}
