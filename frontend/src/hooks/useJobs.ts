import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as jobApi from "../client/jobs"
import type { JobCreate, JobUpdate } from "../types"

const KEY = ["jobs"]

export function useJobs(filters?: { status?: string; source?: string }) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => jobApi.listJobs(filters),
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: JobCreate) => jobApi.createJob(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobUpdate }) =>
      jobApi.updateJob(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => jobApi.deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
