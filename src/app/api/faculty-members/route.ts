import { NextResponse } from "next/server"
import "@/DB/db"
import { FacultyMember } from "@/models/facultyMember"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// ======================
// GET /api/faculty-members
// - Get all faculty members with pagination and search
// Query params: current_page, per_page, search
// ======================
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
      filter.name = searchRegex
    }

    const skip = (currentPage - 1) * perPage
    const count = await FacultyMember.countDocuments(filter)

    const facultyMembers = await FacultyMember.find(filter)
      .populate("faculty_id", "name _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean()

    // Add course count for each faculty member
    const { Course } = await import("@/models/course")
    const facultyMembersWithCourseCount = await Promise.all(
      facultyMembers.map(async (member: any) => {
        const courseCount = await Course.countDocuments({
          faculty_members: member._id,
        })
        return {
          ...member,
          courses_count: courseCount,
        }
      })
    )

    const totalPages = Math.ceil(count / perPage)

    return NextResponse.json(
      {
        success: true,
        message: "Faculty members retrieved",
        results: facultyMembersWithCourseCount,
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
    console.error("Error fetching faculty members", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch faculty members" },
      { status: 500 }
    )
  }
}

// ======================
// POST /api/faculty-members
// - Create a new faculty member
// ======================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, faculty_id } = body ?? {}

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!faculty_id || !Types.ObjectId.isValid(faculty_id)) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required and must be a valid ObjectId" },
        { status: 400 }
      )
    }

    // Verify faculty exists
    const { Faculty } = await import("@/models/faculty")
    const facultyExists = await Faculty.findById(faculty_id)
    if (!facultyExists) {
      return NextResponse.json(
        { success: false, message: "Faculty not found" },
        { status: 404 }
      )
    }

    const facultyMember = await FacultyMember.create({
      name: name.trim(),
      faculty_id: new Types.ObjectId(faculty_id),
    })

    const populatedMember = await FacultyMember.findById(facultyMember._id)
      .populate("faculty_id", "name _id")
      .lean()

    return NextResponse.json(
      { success: true, message: "Faculty member created", result: populatedMember },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating faculty member", error)
    return NextResponse.json(
      { success: false, message: "Failed to create faculty member" },
      { status: 500 }
    )
  }
}
