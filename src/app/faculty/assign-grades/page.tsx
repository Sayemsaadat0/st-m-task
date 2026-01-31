"use client";

import React, { useState } from "react";
import { useGetCourses, useGetBulkCgpaStudents, useBulkAssignCgpa, type BulkCgpaStudent } from "../../_components/hooks/courses.hooks";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/shared/TextInput";
import { toast } from "sonner";

export default function AssignGrades() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [studentGrades, setStudentGrades] = useState<Record<string, number>>({});
  const { data: coursesData } = useGetCourses(1, 100, "");
  const { data: bulkCgpaData, isLoading: isLoadingStudents } = useGetBulkCgpaStudents(selectedCourse);
  const bulkAssignCgpa = useBulkAssignCgpa(selectedCourse);

  const course = bulkCgpaData?.result?.course;
  
  // Students already have status from the API
  const studentsWithStatus = bulkCgpaData?.result?.students || [];

  // Initialize student grades when students data loads
  React.useEffect(() => {
    const students = bulkCgpaData?.result?.students || [];
    if (students.length > 0) {
      const initialGrades: Record<string, number> = {};
      students.forEach((student) => {
        // If student already has a grade, we'll need to fetch it from their grades array
        // For now, we'll leave it empty and let user enter
        initialGrades[student._id] = 0;
      });
      setStudentGrades(initialGrades);
    }
  }, [bulkCgpaData?.result?.students]);

  const handleCgpaChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 4.0) {
      setStudentGrades((prev) => ({
        ...prev,
        [studentId]: numValue,
      }));
    } else if (value === "" || value === ".") {
      setStudentGrades((prev) => ({
        ...prev,
        [studentId]: 0,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    // Filter out students with 0 CGPA (not entered)
    const studentsToSubmit = Object.entries(studentGrades)
      .filter(([, cgpa]) => cgpa > 0)
      .map(([student_id, cgpa]) => ({
        student_id,
        cgpa,
      }));

    if (studentsToSubmit.length === 0) {
      toast.error("Please enter at least one CGPA");
      return;
    }

    try {
      const result = await bulkAssignCgpa.mutateAsync(studentsToSubmit);
      if (result.success) {
        toast.success(result.message || "Grades assigned successfully");
        setStudentGrades({});
      } else {
        toast.error(result.message || "Failed to assign grades");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-t-gray/70">
          Assign Grades
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-white/70 mt-1 sm:mt-2">
          Assign CGPA grades to students for a course
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="course-select" className="block text-sm text-white/60 mb-2">
          Select Course
        </label>
        <select
          id="course-select"
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setStudentGrades({});
          }}
          className="w-full sm:w-96 px-3 py-2 border border-t-gray/30 bg-t-black text-white outline-none h-11 placeholder-white/50 focus:border-t-green transition-colors"
        >
          <option value="">Select Course</option>
          {coursesData?.results?.map((course) => (
            <option key={course._id} value={course._id}>
              {course.course_name} {course.course_code ? `(${course.course_code})` : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          {isLoadingStudents ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-white/50">Loading students...</p>
            </div>
          ) : studentsWithStatus.length > 0 ? (
            <>
              {course && (
                <div className="mb-4 p-3 bg-t-gray/10 border border-t-gray/30">
                  <p className="text-sm text-white/70">
                    Course: <span className="text-white font-medium">{course.course_name}</span>
                    {course.course_code && (
                      <span className="text-white/50 ml-2">({course.course_code})</span>
                    )}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {studentsWithStatus.length} student{studentsWithStatus.length !== 1 ? "s" : ""} enrolled
                  </p>
                </div>
              )}

              <div className="mb-4 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-t-gray/30">
                      <th className="text-left py-2 px-3 text-xs sm:text-sm text-white/70 font-medium">
                        Student Name
                      </th>
                      <th className="text-left py-2 px-3 text-xs sm:text-sm text-white/70 font-medium">
                        Email
                      </th>
                      <th className="text-left py-2 px-3 text-xs sm:text-sm text-white/70 font-medium">
                        Current CGPA
                      </th>
                      <th className="text-left py-2 px-3 text-xs sm:text-sm text-white/70 font-medium">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 text-xs sm:text-sm text-white/70 font-medium">
                        Course CGPA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsWithStatus.map((student: BulkCgpaStudent & { status?: string }) => (
                      <tr
                        key={student._id}
                        className="border-b border-t-gray/30 hover:bg-t-gray/5 transition-colors"
                      >
                        <td className="py-2 px-3">
                          <span className="text-xs sm:text-sm text-white">
                            {student.first_name} {student.last_name}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-xs sm:text-sm text-white/70">{student.email}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-xs sm:text-sm text-t-green font-semibold">
                            {student.cgpa_point.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`text-xs px-2 py-1 uppercase ${
                              student.status === "passed"
                                ? "bg-t-green/20 text-t-green"
                                : "bg-orange-400/20 text-orange-400"
                            }`}
                          >
                            {student.status === "passed" ? "Passed" : "Ongoing"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="w-24">
                            <TextInput
                              type="number"
                              value={studentGrades[student._id] || ""}
                              onChange={(e) => handleCgpaChange(student._id, e.target.value)}
                              placeholder="0.00"
                              min="0"
                              max="4.0"
                              step="0.01"
                              className="h-9 text-xs sm:text-sm"
                              disabled={student.status === "passed"}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={bulkAssignCgpa.isPending || Object.values(studentGrades).every((cgpa) => cgpa === 0)}
                  className="min-w-[150px]"
                >
                  {bulkAssignCgpa.isPending ? "Assigning..." : "Assign Grades"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-white/50">No students enrolled in this course</p>
            </div>
          )}
        </>
      )}

      {!selectedCourse && (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-white/50">Select a course to assign grades</p>
        </div>
      )}
    </div>
  );
}
