import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as resumeApi from "../client/resumes"
import type { ResumeCreate, ResumeUpdate } from "../types"

const KEY = ["resumes"]

export function useResumes() {
  return useQuery({ queryKey: KEY, queryFn: resumeApi.listResumes })
}

export function useCreateResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ResumeCreate) => resumeApi.createResume(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResumeUpdate }) =>
      resumeApi.updateResume(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteResume(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

