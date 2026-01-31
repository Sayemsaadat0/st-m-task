"use client";

import React from "react";
import { Users, BookOpen, GraduationCap, UserCheck, Building2, UserCog } from "lucide-react";

interface SummaryCardsProps {
    totals: {
        students: number;
        courses: number;
        faculty: number;
        faculty_members: number;
    };
    student_status: {
        passed: number;
        ongoing: number;
    };
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totals, student_status }) => {
    const cards = [
        {
            title: "Total Students",
            value: totals.students,
            icon: Users,
            color: "text-blue-400",
            bgColor: "bg-blue-400/20",
        },
        {
            title: "Total Courses",
            value: totals.courses,
            icon: BookOpen,
            color: "text-purple-400",
            bgColor: "bg-purple-400/20",
        },
        {
            title: "Total Faculty",
            value: totals.faculty,
            icon: Building2,
            color: "text-cyan-400",
            bgColor: "bg-cyan-400/20",
        },
        {
            title: "Faculty Members",
            value: totals.faculty_members,
            icon: UserCog,
            color: "text-indigo-400",
            bgColor: "bg-indigo-400/20",
        },
        {
            title: "Passed Students",
            value: student_status.passed,
            icon: GraduationCap,
            color: "text-t-green",
            bgColor: "bg-t-green/20",
        },
        {
            title: "Ongoing Students",
            value: student_status.ongoing,
            icon: UserCheck,
            color: "text-orange-400",
            bgColor: "bg-orange-400/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="bg-t-black p-4 sm:p-5 md:p-6 border border-t-gray/30 hover:border-t-green/40 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/60 text-xs sm:text-sm mb-1">{card.title}</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{card.value}</p>
                            </div>
                            <div className={`${card.bgColor} p-2 sm:p-3`}>
                                <Icon className={`${card.color} w-5 h-5 sm:w-6 sm:h-6`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
