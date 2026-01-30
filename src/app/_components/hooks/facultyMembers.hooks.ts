"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface FacultyMemberType {
    _id: string;
    name: string;
    faculty_id: string | {
        _id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface FacultyMembersResponse {
    success: boolean;
    message: string;
    results: FacultyMemberType[];
    pagination: {
        current_page: number;
        per_page: number;
        count: number;
        total_pages: number;
        has_next_page: boolean;
        has_prev_page: boolean;
    };
}

export interface FacultyMemberResponse {
    success: boolean;
    message: string;
    result: FacultyMemberType;
}

export const useGetFacultyMembers = (currentPage: number = 1, perPage: number = 10, search: string = "") => {
    return useQuery<FacultyMembersResponse>({
        queryKey: ["faculty-members", currentPage, perPage, search],
        queryFn: () => {
            const params = new URLSearchParams({
                current_page: currentPage.toString(),
                per_page: perPage.toString(),
            });
            if (search) params.append("search", search);
            
            return axiousResuest({
                url: `api/faculty-members?${params.toString()}`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
    });
};

export const useGetFacultyMember = (id: string) => {
    return useQuery<FacultyMemberResponse>({
        queryKey: ["faculty-member", id],
        queryFn: () =>
            axiousResuest({
                url: `api/faculty-members/${id}`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        enabled: !!id,
    });
};

export const useCreateFacultyMember = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: Partial<FacultyMemberType>) =>
            axiousResuest({
                url: `api/faculty-members`,
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                },
                data,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faculty-members"] });
        },
    });
};

export const useUpdateFacultyMember = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<FacultyMemberType> }) =>
            axiousResuest({
                url: `api/faculty-members/${id}`,
                method: "patch",
                headers: {
                    'Content-Type': 'application/json',
                },
                data,
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["faculty-members"] });
            queryClient.invalidateQueries({ queryKey: ["faculty-member", variables.id] });
        },
    });
};

export const useDeleteFacultyMember = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) =>
            axiousResuest({
                url: `api/faculty-members/${id}`,
                method: "delete",
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faculty-members"] });
        },
    });
};
