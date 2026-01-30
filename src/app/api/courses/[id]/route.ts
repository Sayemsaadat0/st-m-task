import { NextResponse } from "next/server"
import "@/DB/db"
import { Course } from "@/models/course"
import { FacultyMember } from "@/models/facultyMember"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const resolveObjectId = (value: string) => {
  if (!value || !Types.ObjectId.isValid(value)) return null
  return new Types.ObjectId(value)
}

// ======================
// GET /api/courses/[id]
// - Get a single course by ID with faculty details
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

    let course
    try {
      course = await Course.findOne({
        _id: courseObjectId,
      })
        .populate("faculty_members", "name faculty_id _id")
        .populate("assignee", "first_name last_name email _id")
    } catch (populateError: any) {
      // If assignee populate fails, just populate faculty_members
      if (populateError.message?.includes("assignee")) {
        course = await Course.findOne({
          _id: courseObjectId,
        })
          .populate("faculty_members", "name faculty_id _id")
      } else {
        throw populateError
      }
    }
    
    // Populate faculty details and add status to assignees
    const { Student } = await import("@/models/student")
    if (course) {
      const courseObj = course.toObject ? course.toObject() : course
      
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
        course = courseObj
      }
    }

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Course retrieved", result: course },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching course", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 }
    )
  }
}

// ======================
// PATCH /api/courses/[id]
// - Update a course
// ======================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    const { course_name, course_code, credits, faculty_members } = body ?? {}

    const courseObjectId = resolveObjectId(id)
    if (!courseObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid course identifier" },
        { status: 400 }
      )
    }

    // Check if course exists
    const existingCourse = await Course.findOne({
      _id: courseObjectId,
    })

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    const updatePayload: Record<string, unknown> = {}

    if (typeof course_name !== "undefined") {
      if (!course_name || typeof course_name !== "string" || !course_name.trim()) {
        return NextResponse.json(
          { success: false, message: "Course name must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.course_name = course_name.trim()
    }

    if (typeof course_code !== "undefined") {
      if (course_code === null || course_code === "") {
        updatePayload.course_code = undefined
      } else if (typeof course_code === "string") {
        updatePayload.course_code = course_code.trim()
      } else {
        return NextResponse.json(
          { success: false, message: "Course code must be a string" },
          { status: 400 }
        )
      }
    }

    if (typeof credits !== "undefined") {
      if (typeof credits !== "number" || credits < 0) {
        return NextResponse.json(
          { success: false, message: "Credits must be a number greater than or equal to 0" },
          { status: 400 }
        )
      }
      updatePayload.credits = credits
    }

    if (typeof faculty_members !== "undefined") {
      if (!Array.isArray(faculty_members)) {
        return NextResponse.json(
          { success: false, message: "Faculty members must be an array" },
          { status: 400 }
        )
      }

      // Allow empty array to remove all faculty members
      if (faculty_members.length === 0) {
        updatePayload.faculty_members = []
      } else {
        // Validate all faculty member IDs
        const facultyMemberObjectIds: Types.ObjectId[] = []
        for (const memberId of faculty_members) {
          if (!memberId || typeof memberId !== "string") {
            return NextResponse.json(
              { success: false, message: "All faculty member IDs must be valid strings" },
              { status: 400 }
            )
          }
          const objectId = Types.ObjectId.isValid(memberId) ? new Types.ObjectId(memberId) : null
          if (!objectId) {
            return NextResponse.json(
              { success: false, message: `Invalid faculty member ID: ${memberId}` },
              { status: 400 }
            )
          }
          facultyMemberObjectIds.push(objectId)
        }

        // Verify all faculty members exist
        const members = await FacultyMember.find({
          _id: { $in: facultyMemberObjectIds },
        })

        if (members.length !== facultyMemberObjectIds.length) {
          return NextResponse.json(
            { success: false, message: "One or more faculty members not found" },
            { status: 404 }
          )
        }
        
        updatePayload.faculty_members = facultyMemberObjectIds
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      )
    }

    let updatedCourse
    try {
      updatedCourse = await Course.findOneAndUpdate(
        { _id: courseObjectId },
        { $set: updatePayload },
        { new: true }
      )
        .populate("faculty_members", "name faculty_id _id")
        .populate("assignee", "first_name last_name email _id")
    } catch (populateError: any) {
      // If assignee populate fails, just populate faculty_members
      if (populateError.message?.includes("assignee")) {
        updatedCourse = await Course.findOneAndUpdate(
          { _id: courseObjectId },
          { $set: updatePayload },
          { new: true }
        )
          .populate("faculty_members", "name faculty_id _id")
      } else {
        throw populateError
      }
    }
    
    // Populate faculty details for each faculty_member
    if (updatedCourse) {
      const courseObj = updatedCourse.toObject ? updatedCourse.toObject() : updatedCourse
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

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Course updated", result: updatedCourse },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating course", error)
    return NextResponse.json(
      { success: false, message: "Failed to update course" },
      { status: 500 }
    )
  }
}

// ======================
// DELETE /api/courses/[id]
// - Delete a course
// ======================
export async function DELETE(
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

    const deletedCourse = await Course.findOneAndDelete({
      _id: courseObjectId,
    })

    if (!deletedCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Course deleted", 
        result: { 
          _id: deletedCourse._id, 
          course_name: deletedCourse.course_name 
        } 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting course", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 }
    )
  }
}
