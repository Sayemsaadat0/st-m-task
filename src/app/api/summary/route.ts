import { NextResponse } from "next/server"
import "@/DB/db"
import { Student } from "@/models/student"
import { Course } from "@/models/course"
import { Faculty } from "@/models/faculty"
import { FacultyMember } from "@/models/facultyMember"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// ======================
// GET /api/summary
// - Get summary statistics
// ======================
export async function GET(request: Request) {
  try {
    // Get all students
    const students = await Student.find({})
      .select("cgpa_point grades courses")
      .lean()

    // Calculate passed and ongoing students
    let passedCount = 0
    let ongoingCount = 0

    students.forEach((student: any) => {
      const grades = student.grades || []
      const courses = student.courses || []
      
      if (grades.length > 0) {
        passedCount++
      } else if (courses.length > 0) {
        ongoingCount++
      } else {
        // Students with no courses are considered ongoing
        ongoingCount++
      }
    })

    // Get total counts
    const totalStudents = await Student.countDocuments({})
    const totalCourses = await Course.countDocuments({})
    const totalFaculty = await Faculty.countDocuments({})
    const totalFacultyMembers = await FacultyMember.countDocuments({})

    // Get top-ranking students (sorted by CGPA, descending)
    const topStudents = await Student.find({})
      .select("first_name last_name email cgpa_point _id")
      .sort({ cgpa_point: -1 })
      .limit(10)
      .lean()

    // Get all courses with assignee count
    const courses = await Course.find({})
      .select("course_name course_code assignee _id credits")
      .lean()

    // Calculate enrollment count for each course and sort
    const coursesWithEnrollment = courses.map((course: any) => ({
      _id: course._id,
      course_name: course.course_name,
      course_code: course.course_code,
      credits: course.credits,
      enrollment_count: Array.isArray(course.assignee) ? course.assignee.length : 0,
    }))

    // Sort by enrollment count (descending) and get top 10
    const mostPopularCourses = coursesWithEnrollment
      .sort((a, b) => b.enrollment_count - a.enrollment_count)
      .slice(0, 10)

    return NextResponse.json(
      {
        success: true,
        message: "Summary retrieved successfully",
        result: {
          student_status: {
            passed: passedCount,
            ongoing: ongoingCount,
          },
          totals: {
            students: totalStudents,
            courses: totalCourses,
            faculty: totalFaculty,
            faculty_members: totalFacultyMembers,
          },
          top_students: topStudents.map((student: any) => ({
            _id: student._id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            cgpa_point: student.cgpa_point,
          })),
          most_popular_courses: mostPopularCourses,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching summary", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch summary" },
      { status: 500 }
    )
  }
}
