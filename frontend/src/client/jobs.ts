import api from "./index"
import type { JobCreate, JobList, JobRecord, JobUpdate } from "../types"

export const listJobs = (params?: { status?: string; source?: string }) =>
  api.get<JobList>("/jobs", { params }).then((r) => r.data)

export const getJob = (id: string) =>
  api.get<JobRecord>(`/jobs/${id}`).then((r) => r.data)

export const createJob = (data: JobCreate) =>
  api.post<JobRecord>("/jobs", data).then((r) => r.data)

export const updateJob = (id: string, data: JobUpdate) =>
  api.patch<JobRecord>(`/jobs/${id}`, data).then((r) => r.data)

export const deleteJob = (id: string) =>
  api.delete(`/jobs/${id}`)
