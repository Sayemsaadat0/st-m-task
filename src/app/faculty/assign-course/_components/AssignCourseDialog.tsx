"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/shared/MultiSelect";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAssignStudentsToCourse, useGetCourse } from "../../../_components/hooks/courses.hooks";
import { useGetStudents } from "../../../_components/hooks/students.hooks";
import { useGetCourses } from "../../../_components/hooks/courses.hooks";

interface AssignCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AssignCourseDialog: React.FC<AssignCourseDialogProps> = ({ open, onOpenChange }) => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { data: coursesData } = useGetCourses(1, 100, "");
  const { data: studentsData } = useGetStudents(1, 100, "");
  const { data: selectedCourseData } = useGetCourse(selectedCourse);
  const assignStudents = useAssignStudentsToCourse(selectedCourse);

  // Prepare student options for MultiSelect with status
  const studentOptions =
    studentsData?.results?.map((student) => {
      // Check if student has status for selected course
      let statusLabel = "";
      if (selectedCourse && selectedCourseData?.result) {
        const assignee = selectedCourseData.result.assignee || [];
        const studentInCourse = assignee.find((s: any) => 
          (typeof s === "string" ? s : s._id) === student._id
        );
        if (studentInCourse) {
          const status = typeof studentInCourse === "object" ? studentInCourse.status : "ongoing";
          statusLabel = status === "passed" ? " (Passed)" : " (Ongoing)";
        }
      }
      
      return {
        value: student._id,
        label: `${student.first_name} ${student.last_name}${statusLabel}`,
      };
    }) || [];

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      const result = await assignStudents.mutateAsync(selectedStudents);
      if (result.success) {
        toast.success(result.message || "Students assigned successfully");
        setSelectedCourse("");
        setSelectedStudents([]);
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to assign students");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    }
  };

  const handleClose = () => {
    setSelectedCourse("");
    setSelectedStudents([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-t-black text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Assign Students to Course
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className="space-y-2 mt-2">
          <Label htmlFor="course" className="text-sm text-white/60">
            Select Course
          </Label>
          <select
            id="course"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedStudents([]);
            }}
            className="w-full px-3 py-2 border border-t-gray/30 bg-t-black text-white outline-none h-11 placeholder-white/50 focus:border-t-green transition-colors"
          >
            <option value="">Select Course</option>
            {coursesData?.results?.map((course) => (
              <option key={course._id} value={course._id}>
                {course.course_name} {course.course_code ? `(${course.course_code})` : ""}
              </option>
            ))}
          </select>

          {selectedCourse && (
            <>
              <Label htmlFor="students" className="text-sm text-white/60">
                Select Students
              </Label>
              <MultiSelect
                options={studentOptions}
                value={selectedStudents}
                onChange={setSelectedStudents}
                placeholder="Select students..."
              />
            </>
          )}

          <div className="mt-3">
            <Button
              onClick={handleSubmit}
              disabled={assignStudents.isPending || !selectedCourse || selectedStudents.length === 0}
              className="w-full"
            >
              {assignStudents.isPending ? "Assigning..." : "Assign Students"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignCourseDialog;
