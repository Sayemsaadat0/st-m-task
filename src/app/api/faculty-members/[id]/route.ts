import { NextResponse } from "next/server"
import "@/DB/db"
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
// GET /api/faculty-members/[id]
// - Get a single faculty member by ID
// ======================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const memberObjectId = resolveObjectId(id)
    if (!memberObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid faculty member identifier" },
        { status: 400 }
      )
    }

    const facultyMember = await FacultyMember.findOne({
      _id: memberObjectId,
    })
      .populate("faculty_id", "name _id")
      .lean()

    if (!facultyMember) {
      return NextResponse.json(
        { success: false, message: "Faculty member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Faculty member retrieved", result: facultyMember },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching faculty member", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch faculty member" },
      { status: 500 }
    )
  }
}

// ======================
// PATCH /api/faculty-members/[id]
// - Update a faculty member
// ======================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    const { name, faculty_id } = body ?? {}

    const memberObjectId = resolveObjectId(id)
    if (!memberObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid faculty member identifier" },
        { status: 400 }
      )
    }

    const existingMember = await FacultyMember.findOne({
      _id: memberObjectId,
    })

    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: "Faculty member not found" },
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

    if (typeof faculty_id !== "undefined") {
      if (!faculty_id || !Types.ObjectId.isValid(faculty_id)) {
        return NextResponse.json(
          { success: false, message: "Faculty ID must be a valid ObjectId" },
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
      updatePayload.faculty_id = new Types.ObjectId(faculty_id)
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      )
    }

    const updatedMember = await FacultyMember.findOneAndUpdate(
      { _id: memberObjectId },
      { $set: updatePayload },
      { new: true }
    )
      .populate("faculty_id", "name _id")
      .lean()

    if (!updatedMember) {
      return NextResponse.json(
        { success: false, message: "Faculty member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Faculty member updated", result: updatedMember },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating faculty member", error)
    return NextResponse.json(
      { success: false, message: "Failed to update faculty member" },
      { status: 500 }
    )
  }
}

// ======================
// DELETE /api/faculty-members/[id]
// - Delete a faculty member
// ======================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const memberObjectId = resolveObjectId(id)
    if (!memberObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid faculty member identifier" },
        { status: 400 }
      )
    }

    const deletedMember = await FacultyMember.findOneAndDelete({
      _id: memberObjectId,
    })

    if (!deletedMember) {
      return NextResponse.json(
        { success: false, message: "Faculty member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Faculty member deleted", 
        result: { 
          _id: deletedMember._id, 
          name: deletedMember.name 
        } 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting faculty member", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete faculty member" },
      { status: 500 }
    )
  }
}
