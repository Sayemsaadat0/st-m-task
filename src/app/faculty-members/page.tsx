"use client";

import React, { useState } from "react";
import DashboardTable, { type DashboardTableColumn } from "@/components/shared/DashboardTable";
import { useGetFacultyMembers, useDeleteFacultyMember, type FacultyMemberType } from "../_components/hooks/facultyMembers.hooks";
import { Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import DeleteAction from "@/components/shared/DeleteAction";

export default function FacultyMembers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetFacultyMembers(currentPage, perPage, search);
  const deleteFacultyMember = useDeleteFacultyMember();

  const columns: DashboardTableColumn[] = [
    {
      title: "Name",
      dataKey: "name",
      row: (data: FacultyMemberType) => <span className="text-xs sm:text-sm md:text-base">{data.name}</span>,
    },
    {
      title: "Faculty",
      dataKey: "faculty_id",
      row: (data: FacultyMemberType) => {
        const faculty = typeof data.faculty_id === "object" ? data.faculty_id : null;
        return <span className="text-xs sm:text-sm md:text-base">{faculty?.name || "-"}</span>;
      },
    },
    {
      title: "Actions",
      dataKey: "actions",
      row: (data: FacultyMemberType) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => {
              toast.info("View functionality coming soon");
            }}
            className="p-1 hover:bg-t-green/20 rounded transition-colors"
            title="View"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-t-gray/70" />
          </button>
          <button
            onClick={() => {
              toast.info("Edit functionality coming soon");
            }}
            className="p-1 hover:bg-t-green/20 rounded transition-colors"
            title="Edit"
          >
            <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-t-gray/70" />
          </button>
          <DeleteAction
            handleDeleteSubmit={async () => {
              try {
                await deleteFacultyMember.mutateAsync(data._id);
                toast.success("Faculty member deleted successfully");
              } catch {
                toast.error("Failed to delete faculty member");
              }
            }}
            isLoading={deleteFacultyMember.isPending}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-t-gray/70">
          Faculty Members
          {data?.pagination?.count ? ` (${data.pagination.count})` : ""}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-white/70 mt-1 sm:mt-2">Manage your faculty members</p>
      </div>

      <div className="mb-3 sm:mb-4 flex gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search faculty members..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2 bg-t-black border border-t-gray/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-t-green w-full"
        />
      </div>

      <DashboardTable
        columns={columns}
        data={data?.results || []}
        isLoading={isLoading}
      />

      {data?.pagination && (
        <div className="mt-3 sm:mt-4 flex flex-row items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={!data.pagination.has_prev_page}
            className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2 bg-t-black border border-t-gray/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-t-green transition-colors"
          >
            Previous
          </button>
          <span className="text-xs sm:text-sm md:text-base text-white/70">
            Page {data.pagination.current_page} of {data.pagination.total_pages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!data.pagination.has_next_page}
            className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2 bg-t-black border border-t-gray/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-t-green transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
