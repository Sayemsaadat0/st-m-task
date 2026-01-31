"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface FacultyType {
    _id: string;
    name: string;
    courses: any[];
    faculty_members?: any[];
    faculty_members_count?: number;
    createdAt: string;
    updatedAt: string;
}

export interface FacultyResponse {
    success: boolean;
    message: string;
    results: FacultyType[];
    pagination: {
        current_page: number;
        per_page: number;
        count: number;
        total_pages: number;
        has_next_page: boolean;
        has_prev_page: boolean;
    };
}

export interface SingleFacultyResponse {
    success: boolean;
    message: string;
    result: FacultyType;
}

export const useGetFaculty = (currentPage: number = 1, perPage: number = 10, search: string = "", year?: string) => {
    return useQuery<FacultyResponse>({
        queryKey: ["faculty", currentPage, perPage, search, year],
        queryFn: () => {
            const params = new URLSearchParams({
                current_page: currentPage.toString(),
                per_page: perPage.toString(),
            });
            if (search) params.append("search", search);
            if (year) params.append("year", year);
            
            return axiousResuest({
                url: `api/faculty?${params.toString()}`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
    });
};

export const useGetSingleFaculty = (id: string) => {
    return useQuery<SingleFacultyResponse>({
        queryKey: ["faculty", id],
        queryFn: () =>
            axiousResuest({
                url: `api/faculty/${id}`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        enabled: !!id,
    });
};

export const useCreateFaculty = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: Partial<FacultyType>) =>
            axiousResuest({
                url: `api/faculty`,
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                },
                data,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faculty"] });
        },
    });
};

export const useUpdateFaculty = (id: string) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: Partial<FacultyType>) =>
            axiousResuest({
                url: `api/faculty/${id}`,
                method: "patch",
                headers: {
                    'Content-Type': 'application/json',
                },
                data,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faculty"] });
            queryClient.invalidateQueries({ queryKey: ["faculty", id] });
        },
    });
};

export const useDeleteFaculty = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) =>
            axiousResuest({
                url: `api/faculty/${id}`,
                method: "delete",
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faculty"] });
        },
    });
};
