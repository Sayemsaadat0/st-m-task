import { NextResponse } from "next/server"
import "@/DB/db"
import { Faculty } from "@/models/faculty"
import { FacultyMember } from "@/models/facultyMember"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// ======================
// GET /api/faculty
// - Get all faculty with pagination and search
// Query params: current_page, per_page, search
// ======================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const currentPage = parseInt(searchParams.get("current_page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "10", 10)
    const searchQuery = searchParams.get("search") || ""

    // Validate pagination parameters
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

    // Build search filter
    const filter: Record<string, unknown> = {}
    
    if (searchQuery.trim()) {
      const searchRegex = { $regex: searchQuery.trim(), $options: "i" }
      filter.name = searchRegex
    }

    // Calculate pagination
    const skip = (currentPage - 1) * perPage

    // Get total count (for pagination metadata)
    const count = await Faculty.countDocuments(filter)

    // Fetch paginated faculty
    const faculty = await Faculty.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean()

    // Add faculty_members count and details to each faculty
    const facultyWithMembers = await Promise.all(
      faculty.map(async (fac: any) => {
        const members = await FacultyMember.find({ faculty_id: fac._id })
          .select("name _id")
          .lean()
        
        return {
          ...fac,
          faculty_members: members,
          faculty_members_count: members.length,
        }
      })
    )

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / perPage)

    return NextResponse.json(
      {
        success: true,
        message: "Faculty retrieved",
        results: facultyWithMembers,
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
    console.error("Error fetching faculty", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch faculty" },
      { status: 500 }
    )
  }
}

// ======================
// POST /api/faculty
// - Create a new faculty
// ======================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body ?? {}

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    const faculty = await Faculty.create({
      name: name.trim(),
      courses: [],
    })

    // Add faculty_members count and details to response
    const members = await FacultyMember.find({ faculty_id: faculty._id })
      .select("name _id")
      .lean()

    const facultyWithMembers = {
      ...faculty.toObject(),
      faculty_members: members,
      faculty_members_count: members.length,
    }

    return NextResponse.json(
      { success: true, message: "Faculty created", result: facultyWithMembers },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating faculty", error)
    return NextResponse.json(
      { success: false, message: "Failed to create faculty" },
      { status: 500 }
    )
  }
}
