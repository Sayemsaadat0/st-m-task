import { NextResponse } from "next/server"
import "@/DB/db"
import { Faculty } from "@/models/faculty"
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
// GET /api/faculty/[id]
// - Get a single faculty by ID
// ======================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const facultyObjectId = resolveObjectId(id)
    if (!facultyObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid faculty identifier" },
        { status: 400 }
      )
    }

    const faculty = await Faculty.findOne({
      _id: facultyObjectId,
    })
      .lean()

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: "Faculty not found" },
        { status: 404 }
      )
    }

    // Add faculty_members count and details
    const members = await FacultyMember.find({ faculty_id: faculty._id })
      .select("name _id")
      .lean()

    const facultyWithMembers = {
      ...faculty,
      faculty_members: members,
      faculty_members_count: members.length,
    }

    return NextResponse.json(
      { success: true, message: "Faculty retrieved", result: facultyWithMembers },
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
// PATCH /api/faculty/[id]
// - Update a faculty
// ======================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    const { name } = body ?? {}

    const facultyObjectId = resolveObjectId(id)
    if (!facultyObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid faculty identifier" },
        { status: 400 }
      )
    }

    // Check if faculty exists
    const existingFaculty = await Faculty.findOne({
      _id: facultyObjectId,
    })

    if (!existingFaculty) {
      return NextResponse.json(
        { success: false, message: "Faculty not found" },
        { status: 404 }
      )
    }

    const updatePayload: Record<string, unknown> = {}

    if (typeof name !== "undefined") {
      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, message: "Name must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.name = name.trim()
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      )
    }

    const updatedFaculty = await Faculty.findOneAndUpdate(
      { _id: facultyObjectId },
      { $set: updatePayload },
      { new: true }
    )
      .lean()

    if (!updatedFaculty) {
      return NextResponse.json(
        { success: false, message: "Faculty not found" },
        { status: 404 }
      )
    }

    // Add faculty_members count and details
    const members = await FacultyMember.find({ faculty_id: updatedFaculty._id })
      .select("name _id")
      .lean()

    const facultyWithMembers = {
      ...updatedFaculty,
      faculty_members: members,
      faculty_members_count: members.length,
    }

    return NextResponse.json(
      { success: true, message: "Faculty updated", result: facultyWithMembers },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating faculty", error)
    return NextResponse.json(
      { success: false, message: "Failed to update faculty" },
      { status: 500 }
    )
  }
}

// ======================
// DELETE /api/faculty/[id]
// - Delete a faculty
// ======================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const facultyObjectId = resolveObjectId(id)
    if (!facultyObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid faculty identifier" },
        { status: 400 }
      )
    }

    const deletedFaculty = await Faculty.findOneAndDelete({
      _id: facultyObjectId,
    })

    if (!deletedFaculty) {
      return NextResponse.json(
        { success: false, message: "Faculty not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Faculty deleted", 
        result: { 
          _id: deletedFaculty._id, 
          name: deletedFaculty.name 
        } 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting faculty", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete faculty" },
      { status: 500 }
    )
  }
}
