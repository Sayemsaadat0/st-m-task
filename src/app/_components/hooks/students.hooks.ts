"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface StudentType {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    cgpa_point: number;
    courses: any[];
    grades: any[];
    attributes: Array<{ key: string; value: string }>;
    progressSummary: {
        completedCourses: number;
        ongoingCourses: number;
        completedCredits: number;
    };
    status?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StudentsResponse {
    success: boolean;
    message: string;
    results: StudentType[];
    pagination: {
        current_page: number;
        per_page: number;
        count: number;
        total_pages: number;
        has_next_page: boolean;
        has_prev_page: boolean;
    };
}

export interface StudentResponse {
    success: boolean;
    message: string;
    result: StudentType;
}

export const useGetStudents = (currentPage: number = 1, perPage: number = 10, search: string = "", status?: string) => {
    return useQuery<StudentsResponse>({
        queryKey: ["students", currentPage, perPage, search, status],
        queryFn: () => {
            const params = new URLSearchParams({
                current_page: currentPage.toString(),
                per_page: perPage.toString(),
            });
            if (search) params.append("search", search);
            if (status) params.append("status", status);
            
            return axiousResuest({
                url: `api/students?${params.toString()}`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
    });
};

export const useGetStudent = (id: string) => {
    return useQuery<StudentResponse>({
        queryKey: ["student", id],
        queryFn: () =>
            axiousResuest({
                url: `api/students/${id}`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        enabled: !!id,
    });
};

export const useCreateStudent = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: Partial<StudentType>) =>
            axiousResuest({
                url: `api/students`,
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                },
                data,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
    });
};

export const useUpdateStudent = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<StudentType> }) =>
            axiousResuest({
                url: `api/students/${id}`,
                method: "patch",
                headers: {
                    'Content-Type': 'application/json',
                },
                data,
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            queryClient.invalidateQueries({ queryKey: ["student", variables.id] });
        },
    });
};

export const useDeleteStudent = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) =>
            axiousResuest({
                url: `api/students/${id}`,
                method: "delete",
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
    });
};
