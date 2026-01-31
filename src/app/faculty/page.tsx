"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardTable, { type DashboardTableColumn } from "@/components/shared/DashboardTable";
import { useGetFaculty, useDeleteFaculty, type FacultyType } from "../_components/hooks/faculty.hooks";
import { toast } from "sonner";
import DeleteAction from "@/components/shared/DeleteAction";
import FacultyForm from "./_components/FacultyForm";
import { Button } from "@/components/ui/button";

export default function Faculty() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const { data, isLoading } = useGetFaculty(currentPage, perPage, search, yearFilter);
  const deleteFaculty = useDeleteFaculty();

  const columns: DashboardTableColumn[] = [
    {
      title: "Name",
      dataKey: "name",
      row: (data: FacultyType) => (
        <span className="text-xs sm:text-sm md:text-base text-t-green hover:text-t-orange transition-colors cursor-pointer">
          {data.name}
        </span>
      ),
    },
    {
      title: "Faculty Members",
      dataKey: "faculty_members_count",
      row: (data: FacultyType) => (
        <span className="text-xs sm:text-sm md:text-base">{data.faculty_members_count || (Array.isArray(data.faculty_members) ? data.faculty_members.length : 0)}</span>
      ),
    },
    {
      title: "Created At",
      dataKey: "createdAt",
      row: (data: FacultyType) => (
        <span className="text-xs sm:text-sm md:text-base text-white/70">
          {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-"}
        </span>
      ),
    },
    {
      title: "Actions",
      dataKey: "actions",
      row: (data: FacultyType) => (
        <div className="flex items-center gap-2 justify-end">
          <FacultyForm instance={data} iconOnly={true} />
          <DeleteAction
            handleDeleteSubmit={async () => {
              try {
                await deleteFaculty.mutateAsync(data._id);
                toast.success("Faculty deleted successfully");
              } catch {
                toast.error("Failed to delete faculty");
              }
            }}
            isLoading={deleteFaculty.isPending}
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
            Faculty
            {data?.pagination?.count ? ` (${data.pagination.count})` : ""}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-white/70 mt-1 sm:mt-2">Manage your faculty</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/faculty/assign-course")}
            className="text-t-gray"
          >
            Assign Course
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/faculty/assign-grades")}
            className="text-t-gray"
          >
            Assign Grades
          </Button>
          <FacultyForm instance={null} iconOnly={false} />
        </div>
      </div>

      <div className="mb-2 flex flex-col sm:flex-row gap-2">
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
        <select
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="text-xs sm:text-sm px-2 py-1 bg-t-black border border-t-gray/30 text-white focus:outline-none focus:border-t-green w-full sm:w-24"
        >
          <option value="">All Years</option>
          {Array.from({ length: 7 }, (_, i) => {
            const year = new Date().getFullYear() - 3 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
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

