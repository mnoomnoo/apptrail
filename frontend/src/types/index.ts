export type JobStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interviewing"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn"

export type JobSource =
  | "linkedin"
  | "ziprecruiter"
  | "indeed"
  | "glassdoor"
  | "company_site"
  | "referral"
  | "other"

export type ResumeStatus = "active" | "draft" | "archived"

export const RESUME_STATUS_LABELS: Record<ResumeStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
}

export const RESUME_STATUS_COLORS: Record<ResumeStatus, string> = {
  active: "green",
  draft: "yellow",
  archived: "gray",
}

export interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  linkedin_url?: string
  github_url?: string
  professional_statement?: string
  work_experiences?: WorkExperience[]
  skills?: string[]
  degree_type?: string
  degree_field?: string
  school?: string
  graduation_year?: number | null
}

export interface WorkExperience {
  company: string
  position: string
  years: string
  descriptions: string[]
}

export interface ResumeRecord {
  id: string
  name: string
  email: string | null
  phone: string | null
  linkedin_url: string | null
  github_url: string | null
  professional_statement: string | null
  work_experiences: WorkExperience[] | null
  skills: string[] | null
  status: ResumeStatus | null
  degree_type: string | null
  degree_field: string | null
  school: string | null
  graduation_year: number | null
  created_at: string
  updated_at: string
}

export interface ResumeList {
  data: ResumeRecord[]
  count: number
}

export interface ResumeCreate {
  name: string
  email?: string | null
  phone?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  professional_statement?: string | null
  work_experiences?: WorkExperience[] | null
  skills?: string[] | null
  status?: ResumeStatus | null
  degree_type?: string | null
  degree_field?: string | null
  school?: string | null
  graduation_year?: number | null
}

export interface ResumeUpdate {
  name?: string | null
  email?: string | null
  phone?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  professional_statement?: string | null
  work_experiences?: WorkExperience[] | null
  skills?: string[] | null
  status?: ResumeStatus | null
  degree_type?: string | null
  degree_field?: string | null
  school?: string | null
  graduation_year?: number | null
}

export interface JobRecord {
  id: string
  url: string | null
  company: string
  title: string
  description: string | null
  notes: string | null
  source: JobSource
  status: JobStatus
  resume_id: string | null
  created_at: string
  updated_at: string
  applied_at: string | null
}

export interface JobList {
  data: JobRecord[]
  count: number
}

export interface JobCreate {
  url?: string | null
  company: string
  title: string
  description?: string | null
  notes?: string | null
  source?: JobSource
  resume_id?: string | null
}

export interface JobUpdate {
  url?: string | null
  company?: string | null
  title?: string | null
  description?: string | null
  notes?: string | null
  source?: JobSource | null
  status?: JobStatus | null
  resume_id?: string | null
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interviewing: "Interviewing",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  saved: "gray",
  applied: "blue",
  screening: "purple",
  interviewing: "orange",
  offer: "teal",
  accepted: "green",
  rejected: "red",
  withdrawn: "gray",
}

export const JOB_SOURCE_LABELS: Record<JobSource, string> = {
  linkedin: "LinkedIn",
  ziprecruiter: "ZipRecruiter",
  indeed: "Indeed",
  glassdoor: "Glassdoor",
  company_site: "Company Site",
  referral: "Referral",
  other: "Other",
}

export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  saved: ["applied", "withdrawn", "rejected"],
  applied: ["screening", "interviewing", "offer", "rejected", "withdrawn"],
  screening: ["interviewing", "offer", "rejected", "withdrawn"],
  interviewing: ["offer", "rejected", "withdrawn"],
  offer: ["accepted", "rejected", "withdrawn"],
  accepted: [],
  rejected: [],
  withdrawn: [],
}

export const ALL_JOB_STATUSES: JobStatus[] = [
  "saved", "applied", "screening", "interviewing", "offer", "accepted", "rejected", "withdrawn",
]

export const ALL_JOB_SOURCES: JobSource[] = [
  "linkedin", "ziprecruiter", "indeed", "glassdoor", "company_site", "referral", "other",
]
