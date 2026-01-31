"use client";

import React from "react";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { StudentType } from "../../_components/hooks/students.hooks";

interface StudentCoursesDialogProps {
  student: StudentType;
}

const StudentCoursesDialog: React.FC<StudentCoursesDialogProps> = ({ student }) => {
  const courses = student.courses || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="p-1 hover:bg-t-green/20 transition-colors"
          title="View Courses"
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-t-gray/70" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Student Courses
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        
        <div className="space-y-4 mt-2">
          <div className="mb-3">
            <p className="text-sm text-white/70">
              Student: <span className="text-white font-medium">{student.first_name} {student.last_name}</span>
            </p>
            <p className="text-xs text-white/50 mt-1">
              {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
            </p>
          </div>

          {courses.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-t-green border-b border-t-gray/30 pb-2">
                Courses ({courses.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {courses.map((course: any, index: number) => (
                  <div
                    key={course._id || index}
                    className="p-3 bg-t-gray/10 border-l-2 border-t-green"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{course.course_name}</p>
                        {course.course_code && (
                          <p className="text-xs text-white/50 mt-1">Code: {course.course_code}</p>
                        )}
                        {course.credits && (
                          <p className="text-xs text-white/50 mt-1">Credits: {course.credits}</p>
                        )}
                        {course.faculty_members && course.faculty_members.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-white/50 mb-1">Faculty Members:</p>
                            <div className="flex flex-wrap gap-1">
                              {course.faculty_members.map((member: any, idx: number) => (
                                <span
                                  key={member._id || idx}
                                  className="text-xs text-white/70 bg-t-gray/20 px-2 py-1"
                                >
                                  {member.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 uppercase ${
                          course.status === "passed"
                            ? "bg-t-green/20 text-t-green"
                            : "bg-orange-400/20 text-orange-400"
                        }`}
                      >
                        {course.status || "ongoing"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-t-green border-b border-t-gray/30 pb-2">
                Courses
              </h3>
              <p className="text-sm text-white/50">No courses enrolled</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentCoursesDialog;
