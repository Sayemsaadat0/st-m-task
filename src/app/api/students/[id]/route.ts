import { NextResponse } from "next/server"
import "@/DB/db"
import { Student } from "@/models/student"
import { Course } from "@/models/course"
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
  // Count completed courses (courses that have grades)
  const completedCourses = grades.length
  
  // Count ongoing courses (courses without grades)
  const ongoingCourses = Math.max(0, courses.length - completedCourses)
  
  // Calculate completed credits from grades
  let completedCredits = 0
  if (grades.length > 0) {
    // Extract course IDs from grades
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
// GET /api/students/[id]
// - Get a single student by ID
// ======================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const studentObjectId = resolveObjectId(id)
    if (!studentObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid student identifier" },
        { status: 400 }
      )
    }

    const student = await Student.findOne({
      _id: studentObjectId,
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      )
    }

    // Convert Mongoose document to plain object and populate course details
    const studentData = student.toObject ? student.toObject() : student
    
    // Populate course details
    if (studentData.courses && Array.isArray(studentData.courses) && studentData.courses.length > 0) {
      const courseIds = studentData.courses
        .map((courseId: any) => {
          if (typeof courseId === "string") return courseId
          return courseId._id || courseId.toString()
        })
        .filter((id: any) => id && Types.ObjectId.isValid(id))
      
      if (courseIds.length > 0) {
        const validCourseIds = courseIds.map((id: any) => new Types.ObjectId(id))
        const courseDetails = await Course.find({
          _id: { $in: validCourseIds },
        })
          .select("course_name course_code faculty_members _id")
          .populate("faculty_members", "name faculty_id _id")
          .lean()
        
        // Populate faculty details for each faculty_member and format the response
        studentData.courses = await Promise.all(
          courseDetails.map(async (course: any) => {
            let facultyMembers = []
            if (course.faculty_members && Array.isArray(course.faculty_members)) {
              facultyMembers = await Promise.all(
                course.faculty_members.map(async (member: any) => {
                    if (member && member.faculty_id) {
                      const { Faculty } = await import("@/models/faculty")
                      const faculty = await Faculty.findById(member.faculty_id)
                        .select("-courses")
                        .lean()
                      return {
                        _id: member._id,
                        name: member.name,
                        faculty: faculty || null,
                      }
                    }
                  return {
                    _id: member._id,
                    name: member.name,
                  }
                })
              )
            }
            
            // Check if student has a grade for this course
            const hasGrade = studentData.grades?.some((grade: any) => {
              const gradeCourseId = typeof grade === "string"
                ? grade
                : grade.course_id || grade.course || grade.courseId
              return gradeCourseId && gradeCourseId.toString() === course._id.toString()
            }) || false
            
            return {
              _id: course._id,
              course_name: course.course_name,
              course_code: course.course_code,
              faculty_members: facultyMembers,
              status: hasGrade ? "passed" : "ongoing",
            }
          })
        )
      } else {
        studentData.courses = []
      }
    } else {
      studentData.courses = []
    }
    
    // Ensure attributes and progressSummary are always present
    if (!studentData.attributes) {
      studentData.attributes = []
    }
    if (!studentData.progressSummary) {
      studentData.progressSummary = {
        completedCourses: 0,
        ongoingCourses: 0,
        completedCredits: 0,
      }
    }
    
    // Add overall status
    const hasAnyPassedCourse = (studentData.grades || []).length > 0
    studentData.status = hasAnyPassedCourse ? "passed" : "ongoing"

    return NextResponse.json(
      { success: true, message: "Student retrieved", result: studentData },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching student", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

// ======================
// PATCH /api/students/[id]
// - Update a student
// ======================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    const { first_name, last_name, email, phone, address, cgpa_point, attributes, courses, grades } = body ?? {}

    const studentObjectId = resolveObjectId(id)
    if (!studentObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid student identifier" },
        { status: 400 }
      )
    }

    // Check if student exists
    const existingStudent = await Student.findOne({
      _id: studentObjectId,
    })

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      )
    }

    const updatePayload: Record<string, unknown> = {}

    if (typeof first_name !== "undefined") {
      if (!first_name || typeof first_name !== "string" || !first_name.trim()) {
        return NextResponse.json(
          { success: false, message: "First name must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.first_name = first_name.trim()
    }

    if (typeof last_name !== "undefined") {
      if (!last_name || typeof last_name !== "string" || !last_name.trim()) {
        return NextResponse.json(
          { success: false, message: "Last name must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.last_name = last_name.trim()
    }

    if (typeof email !== "undefined") {
      if (!email || typeof email !== "string" || !email.trim()) {
        return NextResponse.json(
          { success: false, message: "Email must be a non-empty string" },
          { status: 400 }
        )
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { success: false, message: "Invalid email format" },
          { status: 400 }
        )
      }
      updatePayload.email = email.trim().toLowerCase()
    }

    if (typeof phone !== "undefined") {
      if (!phone || typeof phone !== "string" || !phone.trim()) {
        return NextResponse.json(
          { success: false, message: "Phone must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.phone = phone.trim()
    }

    if (typeof address !== "undefined") {
      if (!address || typeof address !== "string" || !address.trim()) {
        return NextResponse.json(
          { success: false, message: "Address must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.address = address.trim()
    }

    if (typeof cgpa_point !== "undefined") {
      if (typeof cgpa_point !== "number" || cgpa_point < 0 || cgpa_point > 4.0) {
        return NextResponse.json(
          { success: false, message: "CGPA point must be a number between 0 and 4.0" },
          { status: 400 }
        )
      }
      updatePayload.cgpa_point = cgpa_point
    }

    // Handle attributes update
    if (typeof attributes !== "undefined") {
      if (!Array.isArray(attributes)) {
        return NextResponse.json(
          { success: false, message: "Attributes must be an array" },
          { status: 400 }
        )
      }

      const validatedAttributes: Array<{ key: string; value: string }> = []
      for (const attr of attributes) {
        if (!attr || typeof attr !== "object") {
          return NextResponse.json(
            { success: false, message: "Each attribute must be an object with key and value" },
            { status: 400 }
          )
        }
        if (!attr.key || typeof attr.key !== "string" || !attr.key.trim()) {
          return NextResponse.json(
            { success: false, message: "Each attribute must have a non-empty key" },
            { status: 400 }
          )
        }
        if (!attr.value || typeof attr.value !== "string" || !attr.value.trim()) {
          return NextResponse.json(
            { success: false, message: "Each attribute must have a non-empty value" },
            { status: 400 }
          )
        }
        validatedAttributes.push({
          key: attr.key.trim(),
          value: attr.value.trim(),
        })
      }
      updatePayload.attributes = validatedAttributes
    }

    // Handle courses and grades update (to recalculate progressSummary)
    if (typeof courses !== "undefined" || typeof grades !== "undefined") {
      const finalCourses = courses !== undefined ? courses : existingStudent.courses
      const finalGrades = grades !== undefined ? grades : existingStudent.grades
      
      if (courses !== undefined) {
        if (!Array.isArray(courses)) {
          return NextResponse.json(
            { success: false, message: "Courses must be an array" },
            { status: 400 }
          )
        }
        updatePayload.courses = courses
      }
      
      if (grades !== undefined) {
        if (!Array.isArray(grades)) {
          return NextResponse.json(
            { success: false, message: "Grades must be an array" },
            { status: 400 }
          )
        }
        updatePayload.grades = grades
      }

      // Recalculate progressSummary when courses or grades change
      const progressSummary = await calculateProgressSummary(finalCourses, finalGrades)
      updatePayload.progressSummary = progressSummary
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      )
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { _id: studentObjectId },
      { $set: updatePayload },
      { new: true }
    )

    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      )
    }

    // Convert Mongoose document to plain object
    const studentData = updatedStudent.toObject ? updatedStudent.toObject() : updatedStudent

    return NextResponse.json(
      { success: true, message: "Student updated", result: studentData },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating student", error)
    return NextResponse.json(
      { success: false, message: "Failed to update student" },
      { status: 500 }
    )
  }
}

// ======================
// DELETE /api/students/[id]
// - Delete a student
// ======================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const studentObjectId = resolveObjectId(id)
    if (!studentObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid student identifier" },
        { status: 400 }
      )
    }

    const deletedStudent = await Student.findOneAndDelete({
      _id: studentObjectId,
    })

    if (!deletedStudent) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Student deleted", 
        result: { 
          _id: deletedStudent._id, 
          first_name: deletedStudent.first_name,
          last_name: deletedStudent.last_name 
        } 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting student", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete student" },
      { status: 500 }
    )
  }
}
