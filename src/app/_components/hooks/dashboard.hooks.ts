"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useQuery } from "@tanstack/react-query";

export interface SummaryResultType {
    student_status: {
        passed: number;
        ongoing: number;
    };
    totals: {
        students: number;
        courses: number;
        faculty: number;
        faculty_members: number;
    };
    top_students: Array<{
        _id: string;
        first_name: string;
        last_name: string;
        email: string;
        cgpa_point: number;
    }>;
    most_popular_courses: Array<{
        _id: string;
        course_name: string;
        course_code: string;
        credits: number;
        enrollment_count: number;
    }>;
    enrollment_over_time: Array<{
        date: string;
        enrollment_count: number;
    }>;
}

export interface SummaryResponse {
    success: boolean;
    message: string;
    result: SummaryResultType;
}

export const useGetSummary = () => {
    return useQuery<SummaryResponse>({
        queryKey: ["summary"],
        queryFn: () =>
            axiousResuest({
                url: `api/summary`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
    });
};
