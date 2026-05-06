import api from "./index"
import type { ParsedResume, ResumeCreate, ResumeList, ResumeRecord, ResumeUpdate } from "../types"

export const listResumes = () =>
  api.get<ResumeList>("/resumes").then((r) => r.data)

export const getResume = (id: string) =>
  api.get<ResumeRecord>(`/resumes/${id}`).then((r) => r.data)

export const createResume = (data: ResumeCreate) =>
  api.post<ResumeRecord>("/resumes", data).then((r) => r.data)

export const updateResume = (id: string, data: ResumeUpdate) =>
  api.patch<ResumeRecord>(`/resumes/${id}`, data).then((r) => r.data)

export const deleteResume = (id: string) =>
  api.delete(`/resumes/${id}`)

export const extractResumeText = (file: File) => {
  const fd = new FormData()
  fd.append("file", file)
  return api.post<ParsedResume>("/resumes/extract-text", fd).then((r) => r.data)
}
