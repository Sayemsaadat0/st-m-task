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

// Helper function to calculate progressSummary
const calculateProgressSummary = async (courses: any[], grades: any[]) => {
  const completedCourses = grades.length
  const ongoingCourses = Math.max(0, courses.length - completedCourses)
  
  let completedCredits = 0
  if (grades.length > 0) {
    const courseIds = grades
      .map((grade) => {
        if (typeof grade === "string") return grade
        return grade.course_id || grade.course || grade.courseId
      })
      .filter((id) => id && Types.ObjectId.isValid(id))
    
    if (courseIds.length > 0) {
      const validCourseIds = courseIds.map((id) => new Types.ObjectId(id))
      const completedCourseDetails = await Course.find({
        _id: { $in: validCourseIds },
      })
      completedCredits = completedCourseDetails.reduce(
        (sum, course) => sum + (course.credits || 0),
        0
      )
    }
  }

  return {
    completedCourses,
    ongoingCourses,
    completedCredits,
  }
}

// ======================
// GET /api/courses/[id]/bulk-cgpa
// - Get list of students assigned to the course
// ======================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const courseObjectId = resolveObjectId(id)
    if (!courseObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid course identifier" },
        { status: 400 }
      )
    }

    // Find the course
    const course = await Course.findById(courseObjectId)
      .select("course_name course_code assignee _id")
      .lean()

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    // Get assigned students
    let students: any[] = []
    if (course.assignee && Array.isArray(course.assignee) && course.assignee.length > 0) {
      const studentIds = course.assignee
        .map((id: any) => {
          if (typeof id === "string") return id
          return id._id || id.toString()
        })
        .filter((id: any) => id && Types.ObjectId.isValid(id))

      if (studentIds.length > 0) {
        const validStudentIds = studentIds.map((id: any) => new Types.ObjectId(id))
        students = await Student.find({
          _id: { $in: validStudentIds },
        })
          .select("first_name last_name email _id cgpa_point grades")
          .lean()
      }
    }

    // Map students with status (passed/ongoing) based on grades
    const studentsWithStatus = students.map((student: any) => {
      const hasGrade = student.grades?.some((grade: any) => {
        const gradeCourseId = typeof grade === "string" 
          ? grade 
          : grade.course_id || grade.course || grade.courseId
        return gradeCourseId && gradeCourseId.toString() === course._id.toString()
      }) || false

      return {
        _id: student._id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        cgpa_point: student.cgpa_point,
        status: hasGrade ? "passed" : "ongoing",
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Assigned students retrieved",
        result: {
          course: {
            _id: course._id,
            course_name: course.course_name,
            course_code: course.course_code,
          },
          students: studentsWithStatus,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching assigned students", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch assigned students" },
      { status: 500 }
    )
  }
}

// ======================
// POST /api/courses/[id]/bulk-cgpa
// - Add CGPA/grades for multiple students in a course
// Body: { students: [{ student_id: string, cgpa: number }] }
// ======================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    const { students: studentsGrades } = body ?? {}

    const courseObjectId = resolveObjectId(id)
    if (!courseObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid course identifier" },
        { status: 400 }
      )
    }

    // Verify course exists
    const course = await Course.findById(courseObjectId)
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    // Validate request body
    if (!studentsGrades || !Array.isArray(studentsGrades) || studentsGrades.length === 0) {
      return NextResponse.json(
        { success: false, message: "Students array is required and must not be empty" },
        { status: 400 }
      )
    }

    // Validate each student grade entry
    const validatedEntries: Array<{ student_id: Types.ObjectId; cgpa: number }> = []
    for (const entry of studentsGrades) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return NextResponse.json(
          { success: false, message: "Each entry must be an object with student_id and cgpa" },
          { status: 400 }
        )
      }

      const { student_id, cgpa } = entry

      if (!student_id || typeof student_id !== "string") {
        return NextResponse.json(
          { success: false, message: "Each entry must have a valid student_id (string)" },
          { status: 400 }
        )
      }

      const studentObjectId = resolveObjectId(student_id)
      if (!studentObjectId) {
        return NextResponse.json(
          { success: false, message: `Invalid student_id: ${student_id}` },
          { status: 400 }
        )
      }

      // Verify student is assigned to this course
      if (!course.assignee || !Array.isArray(course.assignee)) {
        return NextResponse.json(
          { success: false, message: `Student ${student_id} is not assigned to this course` },
          { status: 400 }
        )
      }

      const isAssigned = course.assignee.some((assignedId: any) => {
        const assignedIdStr = assignedId.toString()
        return assignedIdStr === studentObjectId.toString()
      })

      if (!isAssigned) {
        return NextResponse.json(
          { success: false, message: `Student ${student_id} is not assigned to this course` },
          { status: 400 }
        )
      }

      if (typeof cgpa !== "number" || cgpa < 0 || cgpa > 4.0) {
        return NextResponse.json(
          { success: false, message: `CGPA must be a number between 0 and 4.0 for student ${student_id}` },
          { status: 400 }
        )
      }

      validatedEntries.push({
        student_id: studentObjectId,
        cgpa: cgpa,
      })
    }

    // Update each student's grades and recalculate progressSummary
    const updatedStudents = []
    for (const entry of validatedEntries) {
      const student = await Student.findById(entry.student_id)
      if (!student) {
        return NextResponse.json(
          { success: false, message: `Student ${entry.student_id} not found` },
          { status: 404 }
        )
      }

      // Get current grades array
      const currentGrades = Array.isArray(student.grades) ? [...student.grades] : []

      // Remove existing grade for this course if it exists
      const filteredGrades = currentGrades.filter((grade: any) => {
        const gradeCourseId = typeof grade === "string"
          ? grade
          : grade.course_id || grade.course || grade.courseId
        return gradeCourseId && gradeCourseId.toString() !== courseObjectId.toString()
      })

      // Add new grade entry for this course
      filteredGrades.push({
        course_id: courseObjectId,
        cgpa: entry.cgpa,
      })

      // Update student's grades
      student.grades = filteredGrades

      // Recalculate progressSummary
      const courses = Array.isArray(student.courses) ? student.courses : []
      const progressSummary = await calculateProgressSummary(courses, filteredGrades)
      student.progressSummary = progressSummary

      // Optionally update overall CGPA (average of all course CGPA)
      if (filteredGrades.length > 0) {
        const totalCgpa = filteredGrades.reduce((sum: number, grade: any) => {
          const gradeValue = typeof grade === "object" && grade.cgpa ? grade.cgpa : 0
          return sum + gradeValue
        }, 0)
        student.cgpa_point = totalCgpa / filteredGrades.length
      }

      await student.save()

      updatedStudents.push({
        _id: student._id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        cgpa_point: student.cgpa_point,
        course_cgpa: entry.cgpa,
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: "CGPA added for students successfully",
        result: {
          course: {
            _id: course._id,
            course_name: course.course_name,
            course_code: course.course_code,
          },
          updated_students: updatedStudents,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error adding bulk CGPA", error)
    return NextResponse.json(
      { success: false, message: "Failed to add bulk CGPA" },
      { status: 500 }
    )
  }
}
