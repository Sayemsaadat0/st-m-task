"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CourseType {
    _id: string;
    course_name: string;
    course_code?: string;
    credits: number;
    faculty_members: any[];
    assignee: any[];
    createdAt: string;
    updatedAt: string;
}

export interface CoursesResponse {
    success: boolean;
    message: string;
    results: CourseType[];
    pagination: {
        current_page: number;
        per_page: number;
        count: number;
        total_pages: number;
        has_next_page: boolean;
        has_prev_page: boolean;
    };
}

export interface CourseResponse {
    success: boolean;
    message: string;
    result: CourseType;
}

export const useGetCourses = (currentPage: number = 1, perPage: number = 10, search: string = "") => {
    return useQuery<CoursesResponse>({
        queryKey: ["courses", currentPage, perPage, search],
        queryFn: () => {
            const params = new URLSearchParams({
                current_page: currentPage.toString(),
                per_page: perPage.toString(),
            });
            if (search) params.append("search", search);
            
            return axiousResuest({
                url: `api/courses?${params.toString()}`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
    });
};

export const useGetCourse = (id: string) => {
    return useQuery<CourseResponse>({
        queryKey: ["course", id],
        queryFn: () =>
            axiousResuest({
                url: `api/courses/${id}`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        enabled: !!id,
    });
};

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: Partial<CourseType>) =>
            axiousResuest({
                url: `api/courses`,
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                },
                data,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
    });
};

export const useUpdateCourse = (id: string) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: Partial<CourseType>) =>
            axiousResuest({
                url: `api/courses/${id}`,
                method: "patch",
                headers: {
                    'Content-Type': 'application/json',
                },
                data,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["course", id] });
        },
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) =>
            axiousResuest({
                url: `api/courses/${id}`,
                method: "delete",
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
    });
};
