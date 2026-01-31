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
import type { CourseType } from "../../_components/hooks/courses.hooks";

interface CourseViewDialogProps {
  course: CourseType;
}

const CourseViewDialog: React.FC<CourseViewDialogProps> = ({ course }) => {
  const assignee = course.assignee || [];
  const facultyMembers = course.faculty_members || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="p-1 hover:bg-t-green/20 transition-colors"
          title="View Details"
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-t-gray/70" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Course Details
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        
        <div className="space-y-4 mt-2">
          {/* Course Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-t-green border-b border-t-gray/30 pb-2">
              Course Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-1">
                  Course Name
                </p>
                <p className="text-sm text-white font-medium">{course.course_name}</p>
              </div>
              
              {course.course_code && (
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-1">
                    Course Code
                  </p>
                  <p className="text-sm text-white font-medium">{course.course_code}</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-1">
                  Credits
                </p>
                <p className="text-sm text-white font-medium">{course.credits}</p>
              </div>
              
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-1">
                  Faculty Members
                </p>
                <p className="text-sm text-white font-medium">{facultyMembers.length}</p>
              </div>
              
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-1">
                  Enrolled Students
                </p>
                <p className="text-sm text-white font-medium">{assignee.length}</p>
              </div>
            </div>
          </div>

          {/* Faculty Members */}
          {facultyMembers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-t-green border-b border-t-gray/30 pb-2">
                Faculty Members ({facultyMembers.length})
              </h3>
              <div className="space-y-2">
                {facultyMembers.map((member: any, index: number) => (
                  <div
                    key={member._id || index}
                    className="p-2 bg-t-gray/10 border-l-2 border-t-green"
                  >
                    <p className="text-sm text-white font-medium">
                      {member.name || "Unknown"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Students */}
          {assignee.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-t-green border-b border-t-gray/30 pb-2">
                Enrolled Students ({assignee.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {assignee.map((student: any, index: number) => {
                  const studentName = student.first_name && student.last_name
                    ? `${student.first_name} ${student.last_name}`
                    : student.name || "Unknown Student";
                  const studentEmail = student.email || "-";
                  const studentStatus = student.status || "ongoing";
                  
                  return (
                    <div
                      key={student._id || index}
                      className="p-3 bg-t-gray/10 border-l-2 border-t-green"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{studentName}</p>
                          <p className="text-xs text-white/50 mt-1">{studentEmail}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded uppercase ${
                            studentStatus === "passed"
                              ? "bg-t-green/20 text-t-green"
                              : "bg-orange-400/20 text-orange-400"
                          }`}
                        >
                          {studentStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-t-green border-b border-t-gray/30 pb-2">
                Enrolled Students
              </h3>
              <p className="text-sm text-white/50">No students enrolled in this course</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseViewDialog;
