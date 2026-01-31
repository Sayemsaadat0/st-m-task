import { NextResponse } from "next/server"
import "@/DB/db"
import { Student } from "@/models/student"
import { Course } from "@/models/course"
import { Faculty } from "@/models/faculty"
import { FacultyMember } from "@/models/facultyMember"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(request: Request) {
  try {
    const students = await Student.find({})
      .select("cgpa_point grades courses")
      .lean()

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
        ongoingCount++
      }
    })

    const totalStudents = await Student.countDocuments({})
    const totalCourses = await Course.countDocuments({})
    const totalFaculty = await Faculty.countDocuments({})
    const totalFacultyMembers = await FacultyMember.countDocuments({})

    const topStudents = await Student.find({})
      .select("first_name last_name email cgpa_point _id")
      .sort({ cgpa_point: -1 })
      .limit(10)
      .lean()

    const courses = await Course.find({})
      .select("course_name course_code assignee _id credits updatedAt createdAt")
      .lean()

    const coursesWithEnrollment = courses.map((course: any) => ({
      _id: course._id,
      course_name: course.course_name,
      course_code: course.course_code,
      credits: course.credits,
      enrollment_count: Array.isArray(course.assignee) ? course.assignee.length : 0,
    }))

    const mostPopularCourses = coursesWithEnrollment
      .sort((a, b) => b.enrollment_count - a.enrollment_count)
      .slice(0, 10)

    const enrollmentOverTime: { [key: string]: number } = {}
    
    courses.forEach((course: any) => {
      const assigneeCount = Array.isArray(course.assignee) ? course.assignee.length : 0
      if (assigneeCount > 0 && course.createdAt) {
        const date = new Date(course.createdAt)
        const dayKey = date.toISOString().split('T')[0]
        
        if (!enrollmentOverTime[dayKey]) {
          enrollmentOverTime[dayKey] = 0
        }
        enrollmentOverTime[dayKey] += assigneeCount
      }
    })

    const enrollmentOverTimeArray = Object.entries(enrollmentOverTime)
      .map(([date, count]) => ({
        date,
        enrollment_count: count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    const finalEnrollmentData = enrollmentOverTimeArray.length > 30 
      ? enrollmentOverTimeArray.slice(-30)
      : enrollmentOverTimeArray

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
          enrollment_over_time: finalEnrollmentData,
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
