import { NextResponse } from "next/server"
import "@/DB/db"
import { Student } from "@/models/student"
import { Course } from "@/models/course"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

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
// GET /api/students
// ======================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const currentPage = parseInt(searchParams.get("current_page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "10", 10)
    const searchQuery = searchParams.get("search") || ""
    const statusFilter = searchParams.get("status") || "" // "ongoing" or "passed"

    if (currentPage < 1) {
      return NextResponse.json(
        { success: false, message: "current_page must be greater than 0" },
        { status: 400 }
      )
    }

    if (perPage < 1 || perPage > 100) {
      return NextResponse.json(
        { success: false, message: "per_page must be between 1 and 100" },
        { status: 400 }
      )
    }

    // Validate status filter
    if (statusFilter && statusFilter !== "ongoing" && statusFilter !== "passed") {
      return NextResponse.json(
        { success: false, message: "status must be either 'ongoing' or 'passed'" },
        { status: 400 }
      )
    }

    const filter: Record<string, unknown> = {}
    
    if (searchQuery.trim()) {
      const searchRegex = { $regex: searchQuery.trim(), $options: "i" }
      filter.$or = [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { address: searchRegex },
      ]
    }

    // Fetch all students first (for status filtering)
    let allStudents = await Student.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    // Filter by status if provided
    if (statusFilter) {
      allStudents = allStudents.filter((student: any) => {
        const grades = student.grades || []
        const courses = student.courses || []
        
        if (statusFilter === "passed") {
          // Student has at least one grade (passed course)
          return grades.length > 0
        } else if (statusFilter === "ongoing") {
          // Student has courses but no grades, or has fewer grades than courses
          return courses.length > 0 && (grades.length === 0 || grades.length < courses.length)
        }
        return true
      })
    }

    // Calculate count after status filtering
    const count = allStudents.length

    // Apply pagination
    const skip = (currentPage - 1) * perPage
    const students = allStudents.slice(skip, skip + perPage)

    const totalPages = Math.ceil(count / perPage)

    // Populate course details for each student
    const studentsData = await Promise.all(
      students.map(async (student: any) => {
        // Populate course details
        if (student.courses && Array.isArray(student.courses) && student.courses.length > 0) {
          const courseIds = student.courses
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
            const studentGrades = student.grades || []
            student.courses = await Promise.all(
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
                const hasGrade = studentGrades.some((grade: any) => {
                  const gradeCourseId = typeof grade === "string"
                    ? grade
                    : grade.course_id || grade.course || grade.courseId
                  return gradeCourseId && gradeCourseId.toString() === course._id.toString()
                })
                
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
            student.courses = []
          }
        } else {
          student.courses = []
        }
        
        // Determine overall status (if student has any passed courses)
        const hasAnyPassedCourse = (student.grades || []).length > 0
        const overallStatus = hasAnyPassedCourse ? "passed" : "ongoing"
        
        return {
          ...student,
          attributes: student.attributes || [],
          progressSummary: student.progressSummary || {
            completedCourses: 0,
            ongoingCourses: 0,
            completedCredits: 0,
          },
          status: overallStatus,
        }
      })
    )

    return NextResponse.json(
      {
        success: true,
        message: "Students retrieved",
        results: studentsData,
        pagination: {
          current_page: currentPage,
          per_page: perPage,
          count: count,
          total_pages: totalPages,
          has_next_page: currentPage < totalPages,
          has_prev_page: currentPage > 1,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching students", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

// ======================
// POST /api/students
// ======================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { first_name, last_name, email, phone, address, cgpa_point, attributes } = body ?? {}

    // Validation
    if (!first_name || typeof first_name !== "string" || !first_name.trim()) {
      return NextResponse.json(
        { success: false, message: "First name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!last_name || typeof last_name !== "string" || !last_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Last name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: "Phone is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      return NextResponse.json(
        { success: false, message: "Address is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (typeof cgpa_point !== "number" || cgpa_point < 0 || cgpa_point > 4.0) {
      return NextResponse.json(
        { success: false, message: "CGPA point is required and must be a number between 0 and 4.0" },
        { status: 400 }
      )
    }

    // Validate and process attributes
    let validatedAttributes: Array<{ key: string; value: string }> = []
    if (attributes !== undefined && attributes !== null) {
      if (!Array.isArray(attributes)) {
        return NextResponse.json(
          { success: false, message: "Attributes must be an array" },
          { status: 400 }
        )
      }

      for (const attr of attributes) {
        if (!attr || typeof attr !== "object" || Array.isArray(attr)) {
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
        if (attr.value === undefined || attr.value === null || typeof attr.value !== "string" || !attr.value.trim()) {
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
    }

    // Calculate progressSummary
    const progressSummary = await calculateProgressSummary([], [])

    // Create student with all fields including attributes
    const student = new Student({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      cgpa_point: cgpa_point,
      courses: [],
      grades: [],
      attributes: validatedAttributes,
      progressSummary,
    })

    // Save the student
    await student.save()

    // Convert to plain object for response
    const studentData = student.toObject()

    return NextResponse.json(
      { 
        success: true, 
        message: "Student created", 
        result: {
          ...studentData,
          attributes: studentData.attributes || validatedAttributes,
          progressSummary: studentData.progressSummary || progressSummary,
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to create student" 
      },
      { status: 500 }
    )
  }
}
