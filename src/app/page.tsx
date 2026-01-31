"use client"
import React from 'react'
import SummaryCards from './_components/SummaryCards';
import DashboardChart from './_components/DashboardChart';
import EnrollmentOverTimeChart from './_components/EnrollmentOverTimeChart';
import LeaderboardTable from './_components/LeaderboardTable';
import { useGetSummary } from './_components/hooks/dashboard.hooks';
import Image from 'next/image';

const Dashboard = () => {
  const { data, isLoading, error } = useGetSummary();

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-400 text-sm sm:text-base md:text-lg">Failed to load dashboard data</div>
      </div>
    );
  }

  if (!data?.result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white/60 text-sm sm:text-base md:text-lg">No data available</div>
      </div>
    );
  }

  const { result } = data;

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen pb-20">
      <div className="">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-t-gray/70 mb-4 sm:mb-6">Dashboard</h1>

        <SummaryCards
          totals={result.totals}
          student_status={result.student_status}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardChart
            data={result.most_popular_courses.map(course => ({
              course_name: course.course_name,
              enrollment_count: course.enrollment_count,
            }))}
          />

          <LeaderboardTable students={result.top_students} />
        </div>

        <div className="mt-6">
          <EnrollmentOverTimeChart
            data={result.enrollment_over_time || []}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard