"use client";

import React, { useState, useMemo } from "react";
import { CSVLink } from "react-csv";
import DashboardTable, { type DashboardTableColumn } from "@/components/shared/DashboardTable";
import { useGetCourses, useDeleteCourse, type CourseType } from "../_components/hooks/courses.hooks";
import { toast } from "sonner";
import DeleteAction from "@/components/shared/DeleteAction";
import CourseForm from "./_components/CourseForm";
import AssignCourseFromCourse from "./_components/AssignCourseFromCourse";
import CourseViewDialog from "./_components/CourseViewDialog";
import { Button } from "@/components/ui/button";

export default function Courses() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetCourses(currentPage, perPage, search);
  const deleteCourse = useDeleteCourse();

  const csvData = useMemo(() => {
    if (!data?.results) return [];
    return data.results.map((course: CourseType) => ({
      "Course Name": course.course_name || "",
      "Course Code": course.course_code || "-",
      "Credits": course.credits || 0,
      "Faculty Members": Array.isArray(course.faculty_members) ? course.faculty_members.length : 0,
      "Enrolled Students": Array.isArray(course.assignee) ? course.assignee.length : 0,
      "Created At": course.createdAt
        ? new Date(course.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "-",
    }));
  }, [data?.results]);

  const columns: DashboardTableColumn[] = [
    {
      title: "Course Name",
      dataKey: "course_name",
      row: (data: CourseType) => <span className="text-xs sm:text-sm md:text-base">{data.course_name}</span>,
    },
    {
      title: "Course Code",
      dataKey: "course_code",
      row: (data: CourseType) => <span className="text-xs sm:text-sm md:text-base">{data.course_code || "-"}</span>,
    },
    {
      title: "Credits",
      dataKey: "credits",
      row: (data: CourseType) => <span className="text-xs sm:text-sm md:text-base">{data.credits}</span>,
    },
    {
      title: "Faculty Members",
      dataKey: "faculty_members",
      row: (data: CourseType) => (
        <span className="text-xs sm:text-sm md:text-base">{Array.isArray(data.faculty_members) ? data.faculty_members.length : 0}</span>
      ),
    },
    {
      title: "Enrolled Students",
      dataKey: "assignee",
      row: (data: CourseType) => (
        <span className="text-xs sm:text-sm md:text-base">{Array.isArray(data.assignee) ? data.assignee.length : 0}</span>
      ),
    },
    {
      title: "Created At",
      dataKey: "createdAt",
      row: (data: CourseType) => (
        <span className="text-xs sm:text-sm md:text-base text-white/70">
          {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-"}
        </span>
      ),
    },
    {
      title: "Actions",
      dataKey: "actions",
      row: (data: CourseType) => (
        <div className="flex items-center gap-2 justify-end">
          <CourseViewDialog course={data} />
          <AssignCourseFromCourse course={data} />
          <CourseForm instance={data} iconOnly={true} />
          <DeleteAction
            handleDeleteSubmit={async () => {
              try {
                await deleteCourse.mutateAsync(data._id);
                toast.success("Course deleted successfully");
              } catch {
                toast.error("Failed to delete course");
              }
            }}
            isLoading={deleteCourse.isPending}
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
            Courses
            {data?.pagination?.count ? ` (${data.pagination.count})` : ""}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-white/70 mt-1 sm:mt-2">Manage your courses</p>
        </div>
        <CourseForm instance={null} iconOnly={false} />
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
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
        <CSVLink
          data={csvData}
          filename={`courses-${new Date().toISOString().split("T")[0]}.csv`}
          className="text-xs sm:text-sm"
        >
          <Button variant="outline" className="text-t-gray">
            Download CSV
          </Button>
        </CSVLink>
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
