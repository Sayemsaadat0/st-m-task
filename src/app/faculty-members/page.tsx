"use client";

import React, { useState } from "react";
import DashboardTable, { type DashboardTableColumn } from "@/components/shared/DashboardTable";
import { useGetFacultyMembers, useDeleteFacultyMember, type FacultyMemberType } from "../_components/hooks/facultyMembers.hooks";
import { toast } from "sonner";
import DeleteAction from "@/components/shared/DeleteAction";
import FacultyMemberForm from "./_components/FacultyMemberForm";

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
      title: "Courses",
      dataKey: "courses_count",
      row: (data: FacultyMemberType) => (
        <span className="text-xs sm:text-sm md:text-base text-t-green font-semibold">
          {data.courses_count || 0}
        </span>
      ),
    },
    {
      title: "Created At",
      dataKey: "createdAt",
      row: (data: FacultyMemberType) => (
        <span className="text-xs sm:text-sm md:text-base text-white/70">
          {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-"}
        </span>
      ),
    },
    {
      title: "Actions",
      dataKey: "actions",
      row: (data: FacultyMemberType) => (
        <div className="flex items-center gap-2 justify-end">
          <FacultyMemberForm instance={data} iconOnly={true} />
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
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-t-gray/70">
            Faculty Members
            {data?.pagination?.count ? ` (${data.pagination.count})` : ""}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-white/70 mt-1 sm:mt-2">Manage your faculty members</p>
        </div>
        <FacultyMemberForm instance={null} iconOnly={false} />
      </div>

      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="text-xs sm:text-sm px-2 py-1 bg-t-black border border-t-gray/30 text-white placeholder-white/50 focus:outline-none focus:border-t-green w-full sm:w-48"
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
