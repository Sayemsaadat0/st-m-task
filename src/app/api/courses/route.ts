import { NextResponse } from "next/server"
import "@/DB/db"
import { Course } from "@/models/course"
import { FacultyMember } from "@/models/facultyMember"
import { Student } from "@/models/student"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const currentPage = parseInt(searchParams.get("current_page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "10", 10)
    const searchQuery = searchParams.get("search") || ""

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

    const filter: Record<string, unknown> = {}
    
    if (searchQuery.trim()) {
      const searchRegex = { $regex: searchQuery.trim(), $options: "i" }
      filter.$or = [
        { course_name: searchRegex },
        { course_code: searchRegex },
      ]
    }

    const skip = (currentPage - 1) * perPage

    const count = await Course.countDocuments(filter)

    let courses
    try {
      courses = await Course.find(filter)
        .populate("faculty_members", "name faculty_id _id")
        .populate("assignee", "first_name last_name email _id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
    } catch (populateError: any) {
      if (populateError.message?.includes("assignee")) {
        courses = await Course.find(filter)
          .populate("faculty_members", "name faculty_id _id")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(perPage)
      } else {
        throw populateError
      }
    }
    
    const coursesWithFaculty = await Promise.all(
      courses.map(async (course: any) => {
        const courseObj = course.toObject ? course.toObject() : course
        
        if (courseObj.assignee && Array.isArray(courseObj.assignee)) {
          courseObj.assignee = await Promise.all(
            courseObj.assignee.map(async (student: any) => {
              if (student && student._id) {
                const studentDoc = await Student.findById(student._id)
                  .select("grades")
                  .lean()
                
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
        }
        return courseObj
      })
    )

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / perPage)

    return NextResponse.json(
      {
        success: true,
        message: "Courses retrieved",
        results: coursesWithFaculty,
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
    console.error("Error fetching courses", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { course_name, course_code, credits, faculty_members } = body ?? {}

    if (!course_name || typeof course_name !== "string" || !course_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Course name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (typeof credits !== "number" || credits < 0) {
      return NextResponse.json(
        { success: false, message: "Credits is required and must be a number greater than or equal to 0" },
        { status: 400 }
      )
    }

    if (!faculty_members || !Array.isArray(faculty_members) || faculty_members.length === 0) {
      return NextResponse.json(
        { success: false, message: "Faculty members is required and must be a non-empty array" },
        { status: 400 }
      )
    }

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

    const members = await FacultyMember.find({
      _id: { $in: facultyMemberObjectIds },
    })

    if (members.length !== facultyMemberObjectIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more faculty members not found" },
        { status: 404 }
      )
    }

    const course = await Course.create({
      course_name: course_name.trim(),
      course_code: course_code ? course_code.trim() : undefined,
      credits: credits,
      faculty_members: facultyMemberObjectIds,
      assignee: [],
    })

    let populatedCourse
    try {
      populatedCourse = await Course.findById(course._id)
        .populate("faculty_members", "name faculty_id _id")
        .populate("assignee", "first_name last_name email _id")
    } catch (populateError: any) {
      if (populateError.message?.includes("assignee")) {
        populatedCourse = await Course.findById(course._id)
          .populate("faculty_members", "name faculty_id _id")
      } else {
        throw populateError
      }
    }
    
    if (!populatedCourse) {
      return NextResponse.json(
        { success: false, message: "Failed to retrieve created course" },
        { status: 500 }
      )
    }
    
    const { Student } = await import("@/models/student")
    const courseObj = populatedCourse.toObject ? populatedCourse.toObject() : populatedCourse
    
    if (courseObj.assignee && Array.isArray(courseObj.assignee)) {
      courseObj.assignee = await Promise.all(
        courseObj.assignee.map(async (student: any) => {
          if (student && student._id) {
            const studentDoc = await Student.findById(student._id)
              .select("grades")
              .lean()
            
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
    }

    return NextResponse.json(
      { success: true, message: "Course created", result: courseObj },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to create course",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
