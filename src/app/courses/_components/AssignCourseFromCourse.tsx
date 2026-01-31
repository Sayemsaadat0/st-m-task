"use client";

import React, { useState, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAssignStudentsToCourse, useGetCourse } from "../../_components/hooks/courses.hooks";
import { useGetStudents } from "../../_components/hooks/students.hooks";
import { UserPlus } from "lucide-react";
import type { CourseType } from "../../_components/hooks/courses.hooks";

interface AssignCourseFromCourseProps {
  course: CourseType;
}

const AssignCourseFromCourse: React.FC<AssignCourseFromCourseProps> = ({ course }) => {
  const [open, setOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const assignStudents = useAssignStudentsToCourse(course._id);
  const { data: studentsData } = useGetStudents(1, 100, "");
  const { data: courseData } = useGetCourse(course._id);

  // Prepare student options for MultiSelect with status
  const studentOptions =
    studentsData?.results?.map((student) => {
      // Check if student has status for this course
      let statusLabel = "";
      if (courseData?.result) {
        const assignee = courseData.result.assignee || [];
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

  // Set initial selected students from course assignee
  useEffect(() => {
    if (course?.assignee && open) {
      const assigneeIds = course.assignee.map((student: any) =>
        typeof student === "string" ? student : student._id || student
      );
      setSelectedStudents(assigneeIds);
    } else if (open) {
      setSelectedStudents([]);
    }
  }, [course, open]);

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      const result = await assignStudents.mutateAsync(selectedStudents);
      if (result.success) {
        toast.success(result.message || "Students assigned successfully");
        setOpen(false);
      } else {
        toast.error(result.message || "Failed to assign students");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1 hover:bg-t-green/20 transition-colors"
          title="Assign Students"
        >
          <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-t-gray/70" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Assign Students to Course
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className="space-y-2 mt-2">
          <div className="mb-3">
            <p className="text-sm text-white/70">
              Course: <span className="text-white font-medium">{course.course_name}</span>
            </p>
          </div>

          <Label htmlFor="students" className="text-sm text-white/60">
            Select Students
          </Label>
          <MultiSelect
            options={studentOptions}
            value={selectedStudents}
            onChange={setSelectedStudents}
            placeholder="Select students..."
          />

          <div className="mt-3">
            <Button
              onClick={handleSubmit}
              disabled={assignStudents.isPending}
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

export default AssignCourseFromCourse;
