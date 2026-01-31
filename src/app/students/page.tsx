"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardTable, { type DashboardTableColumn } from "@/components/shared/DashboardTable";
import { useGetStudents, useDeleteStudent, type StudentType } from "../_components/hooks/students.hooks";
import { useGetCourses } from "../_components/hooks/courses.hooks";
import { SquareArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import DeleteAction from "@/components/shared/DeleteAction";
import StudentForm from "./_components/StudentForm";

export default function Students() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const { data, isLoading } = useGetStudents(currentPage, perPage, search, undefined, courseFilter, yearFilter);
  const { data: coursesData } = useGetCourses(1, 100, ""); // Get all courses for dropdown
  const deleteStudent = useDeleteStudent();

  const handleNavigateToProfile = (id: string) => {
    router.push(`/students/${id}`);
  };

  const columns: DashboardTableColumn[] = [
    {
      title: "Name",
      dataKey: "name",
      row: (data: StudentType) => (
        <button
          onClick={() => handleNavigateToProfile(data._id)}
          className="text-xs sm:text-sm md:text-base text-t-green hover:text-t-orange transition-colors cursor-pointer"
        >
          {data.first_name} {data.last_name}
        </button>
      ),
    },
    {
      title: "Email",
      dataKey: "email",
      row: (data: StudentType) => <span className="text-xs sm:text-sm md:text-base">{data.email}</span>,
    },
    {
      title: "Phone",
      dataKey: "phone",
      row: (data: StudentType) => <span className="text-xs sm:text-sm md:text-base">{data.phone}</span>,
    },
    {
      title: "Address",
      dataKey: "address",
      row: (data: StudentType) => (
        <span className="text-xs sm:text-sm md:text-base text-white/70 max-w-xs truncate" title={data.address}>
          {data.address}
        </span>
      ),
    },
    {
      title: "CGPA",
      dataKey: "cgpa_point",
      row: (data: StudentType) => (
        <span className="text-xs sm:text-sm md:text-base text-t-green font-semibold">{data.cgpa_point.toFixed(2)}</span>
      ),
    },
    {
      title: "Status",
      dataKey: "status",
      row: (data: StudentType) => (
        <span className={`text-xs sm:text-sm md:text-base uppercase ${data.status === "passed" ? "text-t-green" : "text-orange-400"}`}>
          {data.status || "ongoing"}
        </span>
      ),
    },
    {
      title: "Actions",
      dataKey: "actions",
      row: (data: StudentType) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleNavigateToProfile(data._id)}
            className="p-1 hover:bg-t-green/20 transition-colors"
            title="View Profile"
          >
            <SquareArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-t-gray/70" />
          </button>
          <StudentForm instance={data} iconOnly={true} />
          <DeleteAction
            handleDeleteSubmit={async () => {
              try {
                await deleteStudent.mutateAsync(data._id);
                toast.success("Student deleted successfully");
              } catch {
                toast.error("Failed to delete student");
              }
            }}
            isLoading={deleteStudent.isPending}
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
            Students
            {data?.pagination?.count ? ` (${data.pagination.count})` : ""}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-white/70 mt-1 sm:mt-2">Manage your students</p>
        </div>
        <StudentForm instance={null} iconOnly={false} />
      </div>

      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2 bg-t-black border border-t-gray/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-t-green flex-1"
        />
        <select
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2 bg-t-black border border-t-gray/30 rounded-lg text-white focus:outline-none focus:border-t-green min-w-[150px]"
        >
          <option value="">All Courses</option>
          {coursesData?.results?.map((course) => (
            <option key={course._id} value={course._id}>
              {course.course_name} {course.course_code ? `(${course.course_code})` : ""}
            </option>
          ))}
        </select>
        <select
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2 bg-t-black border border-t-gray/30 rounded-lg text-white focus:outline-none focus:border-t-green w-full sm:w-32"
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
