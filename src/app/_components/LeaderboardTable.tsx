"use client";

import React from "react";
import DashboardTable, { type DashboardTableColumn } from "@/components/shared/DashboardTable";

interface Student {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    cgpa_point: number;
}

interface LeaderboardTableProps {
    students: Student[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ students }) => {
    const columns: DashboardTableColumn[] = [
        {
            title: "Rank",
            dataKey: "rank",
            row: (data: Student, rowIndex: number) => (
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-t-green/20 text-t-green font-semibold text-xs sm:text-sm md:text-base">
                    {rowIndex + 1}
                </span>
            ),
        },
        {
            title: "Name",
            dataKey: "name",
            row: (data: Student) => (
                <span className="text-xs sm:text-sm md:text-base">
                    {data.first_name} {data.last_name}
                </span>
            ),
        },
        {
            title: "Email",
            dataKey: "email",
            row: (data: Student) => (
                <span className="text-xs sm:text-sm md:text-base">{data.email}</span>
            ),
        },
        {
            title: "CGPA",
            dataKey: "cgpa_point",
            row: (data: Student) => (
                <span className="text-xs sm:text-sm md:text-base text-t-green font-semibold">
                    {data.cgpa_point.toFixed(2)}
                </span>
            ),
        },
    ];

    return (
        <div className="w-full bg-t-black p-4 sm:p-5 md:p-6 border border-t-gray/30">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-t-gray/70 mb-3 sm:mb-4">Top Students Leaderboard</h2>
            <DashboardTable
                columns={columns}
                data={students}
                isLoading={false}
            />
        </div>
    );
};

export default LeaderboardTable;
