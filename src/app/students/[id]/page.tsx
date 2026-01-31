"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetStudent } from "../../_components/hooks/students.hooks";
import { ArrowLeft, Mail, Phone, MapPin, GraduationCap, BookOpen, Award, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentForm from "../_components/StudentForm";
import Image from "next/image";

export default function StudentProfile() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading, error } = useGetStudent(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
      <Image
        className="w-auto h-12 animate-pulse"
        src="/assets/logo22.png"
        alt="logo"
        width={600}
        height={600}
        priority
        unoptimized
      />
    </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white/70">Student not found</div>
        </div>
      </div>
    );
  }

  const student = data.result;

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-2">
              {student.first_name} {student.last_name}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <span
                className={`text-xs sm:text-sm uppercase px-3 py-1 ${
                  student.status === "passed"
                    ? "bg-t-green/20 text-t-green border border-t-green/30"
                    : "bg-orange-400/20 text-orange-400 border border-orange-400/30"
                }`}
              >
                {student.status || "ongoing"}
              </span>
              <span className="text-sm text-white/70">
                CGPA: <span className="text-t-green font-semibold">{student.cgpa_point.toFixed(2)}</span>
              </span>
            </div>
          </div>
          <StudentForm instance={student} iconOnly={false} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Contact Information */}
        <div className="bg-t-black border border-t-gray/30 p-4">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-t-green" />
            Contact Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-white/50 mt-1" />
              <div>
                <p className="text-xs text-white/50">Email</p>
                <p className="text-sm text-white">{student.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-white/50 mt-1" />
              <div>
                <p className="text-xs text-white/50">Phone</p>
                <p className="text-sm text-white">{student.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-white/50 mt-1" />
              <div>
                <p className="text-xs text-white/50">Address</p>
                <p className="text-sm text-white">{student.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-t-black border border-t-gray/30 p-4">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-t-green" />
            Progress Summary
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Completed Courses</span>
              <span className="text-lg font-semibold text-t-green">
                {student.progressSummary?.completedCourses || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Ongoing Courses</span>
              <span className="text-lg font-semibold text-orange-400">
                {student.progressSummary?.ongoingCourses || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Completed Credits</span>
              <span className="text-lg font-semibold text-white">
                {student.progressSummary?.completedCredits || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses */}
      {student.courses && student.courses.length > 0 ? (
        <div className="bg-t-black border border-t-gray/30 p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-t-green" />
            Courses ({student.courses.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {student.courses.map((course: any, index: number) => (
              <div
                key={course._id || index}
                className="border border-t-gray/30 p-3 hover:border-t-green/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{course.course_name}</h3>
                  <span
                    className={`text-xs px-2 py-1 ${
                      course.status === "passed"
                        ? "bg-t-green/20 text-t-green"
                        : "bg-orange-400/20 text-orange-400"
                    }`}
                  >
                    {course.status || "ongoing"}
                  </span>
                </div>
                {course.course_code && (
                  <p className="text-xs text-white/50 mb-2">Code: {course.course_code}</p>
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
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-t-black border border-t-gray/30 p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-t-green" />
            Courses
          </h2>
          <p className="text-sm text-white/50">No courses assigned yet</p>
        </div>
      )}

      {/* Grades */}
      {student.grades && student.grades.length > 0 && (
        <div className="bg-t-black border border-t-gray/30 p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-t-green" />
            Grades ({student.grades.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {student.grades.map((grade: any, index: number) => {
              // Extract course ID from grade (can be string or object)
              const courseId = typeof grade === "string" 
                ? grade 
                : grade.course_id || grade.course || grade.courseId;
              
              // Find the corresponding course
              const course = student.courses?.find((c: any) => 
                c._id && c._id.toString() === courseId?.toString()
              );

              // Get CGPA from grade object
              const gradeCgpa = typeof grade === "object" && grade.cgpa ? grade.cgpa : null;

              return (
                <div
                  key={index}
                  className="border border-t-gray/30 p-3 hover:border-t-green/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {course?.course_name || "Unknown Course"}
                      </h3>
                      {course?.course_code && (
                        <p className="text-xs text-white/50 mb-2">Code: {course.course_code}</p>
                      )}
                    </div>
                    {gradeCgpa !== null && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-t-green">
                          {gradeCgpa.toFixed(2)}
                        </span>
                        <p className="text-xs text-white/50">CGPA</p>
                      </div>
                    )}
                  </div>
                  {!course && (
                    <p className="text-xs text-orange-400/70">Course information not available</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attributes */}
      {student.attributes && student.attributes.length > 0 && (
        <div className="bg-t-black border border-t-gray/30 p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-t-green" />
            Additional Information
          </h2>
          <div className="space-y-2">
            {student.attributes.map((attr: any, index: number) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-3 border-l-2 border-t-green/30 hover:border-t-green/60 hover:bg-t-gray/5 transition-all"
              >
                <div className="min-w-[120px] sm:min-w-[150px]">
                  <p className="text-xs text-white/50 uppercase tracking-wide font-medium">
                    {attr.key}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium wrap-break-word">
                    {attr.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-t-black border border-t-gray/30 p-4">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-t-green" />
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-white/50 mb-1">Created At</p>
            <p className="text-sm text-white">
              {new Date(student.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50 mb-1">Last Updated</p>
            <p className="text-sm text-white">
              {new Date(student.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
