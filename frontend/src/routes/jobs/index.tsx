import { useState, useEffect } from "react"
import axios from "axios"
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Skeleton,
  Table,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { LuExternalLink, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu"
import { Dialog } from "../../components/ui/dialog"
import { Tooltip } from "../../components/ui/tooltip"
import { toaster } from "../../components/ui/toaster"
import { useCreateJob, useDeleteJob, useJobs, useUpdateJob } from "../../hooks/useJobs"
import { useResumes, useCreateResume } from "../../hooks/useResumes"
import type {
  JobCreate,
  JobRecord,
  JobSource,
  JobStatus,
  JobUpdate,
  ResumeRecord,
} from "../../types"
import {
  ALL_JOB_SOURCES,
  ALL_JOB_STATUSES,
  JOB_SOURCE_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
  VALID_TRANSITIONS,
} from "../../types"

function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge colorPalette={JOB_STATUS_COLORS[status]} size="sm">
      {JOB_STATUS_LABELS[status]}
    </Badge>
  )
}

function ResumeSelector({
  value,
  onChange,
  resumes,
}: {
  value: string
  onChange: (id: string) => void
  resumes: ResumeRecord[]
}) {
  return (
    <NativeSelect.Root>
      <NativeSelect.Field value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— no resume —</option>
        {resumes.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </NativeSelect.Field>
    </NativeSelect.Root>
  )
}

interface JobFormDialogProps {
  open: boolean
  onClose: () => void
  editing: JobRecord | null
  resumes: ResumeRecord[]
}

function JobFormDialog({ open, onClose, editing, resumes }: JobFormDialogProps) {
  const isEdit = !!editing
  const createJob = useCreateJob()
  const updateJob = useUpdateJob()
  const createResume = useCreateResume()

  const [url, setUrl] = useState(editing?.url ?? "")
  const [company, setCompany] = useState(editing?.company ?? "")
  const [title, setTitle] = useState(editing?.title ?? "")
  const [description, setDescription] = useState(editing?.description ?? "")
  const [notes, setNotes] = useState(editing?.notes ?? "")
  const [source, setSource] = useState<JobSource>(editing?.source ?? "other")
  const [status, setStatus] = useState<JobStatus>(editing?.status ?? "saved")
  const [resumeId, setResumeId] = useState(editing?.resume_id ?? "")
  const [newResumeName, setNewResumeName] = useState("")
  const [resumeMode, setResumeMode] = useState<"existing" | "new">("existing")

  const busy = createJob.isPending || updateJob.isPending || createResume.isPending

  useEffect(() => {
    if (!open) return
    setUrl(editing?.url ?? "")
    setCompany(editing?.company ?? "")
    setTitle(editing?.title ?? "")
    setDescription(editing?.description ?? "")
    setNotes(editing?.notes ?? "")
    setSource(editing?.source ?? "other")
    setStatus(editing?.status ?? "saved")
    setResumeId(editing?.resume_id ?? "")
    setNewResumeName("")
    setResumeMode("existing")
  }, [open, editing])

  function reset() {
    setUrl(editing?.url ?? "")
    setCompany(editing?.company ?? "")
    setTitle(editing?.title ?? "")
    setDescription(editing?.description ?? "")
    setNotes(editing?.notes ?? "")
    setSource(editing?.source ?? "other")
    setStatus(editing?.status ?? "saved")
    setResumeId(editing?.resume_id ?? "")
    setNewResumeName("")
    setResumeMode("existing")
  }

  const validNextStatuses = isEdit
    ? [editing!.status, ...VALID_TRANSITIONS[editing!.status]]
    : ALL_JOB_STATUSES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim() || !title.trim()) return

    try {
      let finalResumeId: string | null = resumeId || null

      if (!isEdit && resumeMode === "new" && newResumeName.trim()) {
        const created = await createResume.mutateAsync({
          name: newResumeName.trim(),
        })
        finalResumeId = created.id
      }

      if (isEdit) {
        const data: JobUpdate = {
          url: url.trim() || null,
          company: company.trim(),
          title: title.trim(),
          description: description.trim() || null,
          notes: notes.trim() || null,
          source,
          status,
          resume_id: finalResumeId,
        }
        await updateJob.mutateAsync({ id: editing!.id, data })
        toaster.create({ type: "success", title: "Job updated" })
      } else {
        const data: JobCreate = {
          url: url.trim() || null,
          company: company.trim(),
          title: title.trim(),
          description: description.trim() || null,
          notes: notes.trim() || null,
          source,
          resume_id: finalResumeId,
        }
        await createJob.mutateAsync(data)
        toaster.create({ type: "success", title: "Job added" })
      }
      onClose()
      reset()
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? "Something went wrong")
        : "Something went wrong"
      toaster.create({ type: "error", title: detail })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(); reset() }}
      title={isEdit ? "Edit Job" : "New Job"}
      size="lg"
      footer={
        <HStack justify="flex-end" w="full" gap={3}>
          <Button variant="ghost" onClick={() => { onClose(); reset() }} disabled={busy}>
            Cancel
          </Button>
          <Button colorPalette="blue" type="submit" form="job-form" loading={busy}>
            {isEdit ? "Save" : "Add Job"}
          </Button>
        </HStack>
      }
    >
      <form id="job-form" onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <HStack gap={4}>
            <Box flex={1}>
              <Text mb={1} fontSize="sm" color="gray.400">Company *</Text>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                required
              />
            </Box>
            <Box flex={1}>
              <Text mb={1} fontSize="sm" color="gray.400">Position Title *</Text>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Software Engineer"
                required
              />
            </Box>
          </HStack>
          <Box>
            <Text mb={1} fontSize="sm" color="gray.400">Job URL</Text>
            <HStack gap={2}>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                type="url"
              />
              <IconButton
                aria-label="Open URL"
                variant="ghost"
                size="sm"
                disabled={!url}
                onClick={() => window.open(url, "_blank", "noreferrer")}
              >
                <LuExternalLink />
              </IconButton>
            </HStack>
          </Box>
          <HStack gap={4}>
            <Box flex={1}>
              <Text mb={1} fontSize="sm" color="gray.400">Source</Text>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={source}
                  onChange={(e) => setSource(e.target.value as JobSource)}
                >
                  {ALL_JOB_SOURCES.map((s) => (
                    <option key={s} value={s}>{JOB_SOURCE_LABELS[s]}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>
            {isEdit && (
              <Box flex={1}>
                <Text mb={1} fontSize="sm" color="gray.400">Status</Text>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                  >
                    {validNextStatuses.map((s) => (
                      <option key={s} value={s}>{JOB_STATUS_LABELS[s]}</option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>
            )}
          </HStack>
          <Box>
            <Text mb={1} fontSize="sm" color="gray.400">Description</Text>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={4}
            />
          </Box>
          <Box>
            <Text mb={1} fontSize="sm" color="gray.400">Notes</Text>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your private notes..."
              rows={2}
            />
          </Box>
          <Box>
            <Text mb={2} fontSize="sm" color="gray.400">Resume</Text>
            {!isEdit && (
              <HStack gap={4} mb={3}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="radio"
                    checked={resumeMode === "existing"}
                    onChange={() => setResumeMode("existing")}
                  />
                  <Text fontSize="sm">Use existing</Text>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="radio"
                    checked={resumeMode === "new"}
                    onChange={() => setResumeMode("new")}
                  />
                  <Text fontSize="sm">Create new</Text>
                </label>
              </HStack>
            )}
            {(isEdit || resumeMode === "existing") ? (
              <ResumeSelector value={resumeId} onChange={setResumeId} resumes={resumes} />
            ) : (
              <Input
                value={newResumeName}
                onChange={(e) => setNewResumeName(e.target.value)}
                placeholder="Resume name (e.g. Acme Corp v1)"
              />
            )}
          </Box>
        </VStack>
      </form>
    </Dialog>
  )
}

function DeleteDialog({
  open,
  onClose,
  job,
}: {
  open: boolean
  onClose: () => void
  job: JobRecord | null
}) {
  const deleteMutation = useDeleteJob()

  async function handleDelete() {
    if (!job) return
    try {
      await deleteMutation.mutateAsync(job.id)
      toaster.create({ type: "success", title: "Job deleted" })
      onClose()
    } catch {
      toaster.create({ type: "error", title: "Delete failed" })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete Job"
      footer={
        <HStack justify="flex-end" w="full" gap={3}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button colorPalette="red" onClick={handleDelete} loading={deleteMutation.isPending}>
            Delete
          </Button>
        </HStack>
      }
    >
      <Text>
        Delete <strong>{job?.title}</strong> at <strong>{job?.company}</strong>? This cannot be undone.
      </Text>
    </Dialog>
  )
}

export function JobsPage() {
  const [statusFilter, setStatusFilter] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [search, setSearch] = useState("")

  const { data, isLoading } = useJobs({
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
  })
  const { data: resumeData } = useResumes()

  const resumes = resumeData?.data ?? []
  const resumeMap = Object.fromEntries(resumes.map((r) => [r.id, r]))

  const jobs = (data?.data ?? []).filter((j) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      j.company.toLowerCase().includes(q) ||
      j.title.toLowerCase().includes(q) ||
      (j.notes ?? "").toLowerCase().includes(q)
    )
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<JobRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<JobRecord | null>(null)

  function openCreate() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(j: JobRecord) {
    setEditTarget(j)
    setFormOpen(true)
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color="white">Jobs</Text>
        <Button colorPalette="blue" onClick={openCreate}>
          <LuPlus />
          Add Job
        </Button>
      </Flex>

      <HStack gap={3} mb={5} flexWrap="wrap">
        <Input
          placeholder="Search company, title, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="280px"
          size="sm"
        />
        <NativeSelect.Root maxW="160px" size="sm">
          <NativeSelect.Field value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {ALL_JOB_STATUSES.map((s) => (
              <option key={s} value={s}>{JOB_STATUS_LABELS[s]}</option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
        <NativeSelect.Root maxW="160px" size="sm">
          <NativeSelect.Field value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="">All sources</option>
            {ALL_JOB_SOURCES.map((s) => (
              <option key={s} value={s}>{JOB_SOURCE_LABELS[s]}</option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      </HStack>

      {isLoading ? (
        <VStack gap={3} align="stretch">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} h="40px" rounded="md" />)}
        </VStack>
      ) : jobs.length === 0 ? (
        <Box textAlign="center" py={16} color="gray.500">
          <Text fontSize="lg">No jobs found.</Text>
          <Text fontSize="sm" mt={1}>
            {data?.count === 0 ? 'Click "Add Job" to start tracking.' : "Try adjusting your filters."}
          </Text>
        </Box>
      ) : (
        <Table.Root size="sm" variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Company</Table.ColumnHeader>
              <Table.ColumnHeader>Position</Table.ColumnHeader>
              <Table.ColumnHeader>Source</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Resume</Table.ColumnHeader>
              <Table.ColumnHeader>Applied</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {jobs.map((j) => (
              <Table.Row key={j.id}>
                <Table.Cell fontWeight="medium" color="white">
                  {j.notes ? (
                    <Tooltip content={j.notes}>
                      <HStack gap={1} display="inline-flex">
                        {j.url ? (
                          <a href={j.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {j.company}
                            <LuExternalLink size={12} />
                          </a>
                        ) : (
                          <span>{j.company}</span>
                        )}
                      </HStack>
                    </Tooltip>
                  ) : (
                    <HStack gap={1}>
                      {j.url ? (
                        <a href={j.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {j.company}
                          <LuExternalLink size={12} />
                        </a>
                      ) : (
                        j.company
                      )}
                    </HStack>
                  )}
                </Table.Cell>
                <Table.Cell color="gray.300">{j.title}</Table.Cell>
                <Table.Cell color="gray.500" fontSize="xs">{JOB_SOURCE_LABELS[j.source]}</Table.Cell>
                <Table.Cell><StatusBadge status={j.status} /></Table.Cell>
                <Table.Cell color="gray.400" fontSize="xs">
                  {j.resume_id && resumeMap[j.resume_id]
                    ? resumeMap[j.resume_id].name
                    : "—"}
                </Table.Cell>
                <Table.Cell color="gray.500" fontSize="xs">
                  {j.applied_at ? new Date(j.applied_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—"}
                </Table.Cell>
                <Table.Cell>
                  <HStack justify="flex-end" gap={1}>
                    <Button size="xs" variant="ghost" onClick={() => openEdit(j)} title="Edit">
                      <LuPencil />
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => setDeleteTarget(j)}
                      title="Delete"
                    >
                      <LuTrash2 />
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <JobFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editTarget}
        resumes={resumes}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        job={deleteTarget}
      />
    </Box>
  )
}
