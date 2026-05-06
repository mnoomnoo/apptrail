import { useRef, useState } from "react"
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  NativeSelect,
  Separator,
  Skeleton,
  Table,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import {
  LuFile,
  LuPencil,
  LuPlus,
  LuTrash2,
  LuX,
} from "react-icons/lu"
import { Dialog } from "../../components/ui/dialog"
import { toaster } from "../../components/ui/toaster"
import {
  useCreateResume,
  useDeleteResume,
  useResumes,
  useUpdateResume,
} from "../../hooks/useResumes"
import { extractResumeText } from "../../client/resumes"
import type { ResumeRecord, ResumeStatus, WorkExperience } from "../../types"
import { RESUME_STATUS_COLORS, RESUME_STATUS_LABELS } from "../../types"

function cleanFilename(filename: string): string {
  return filename
    .replace(/\.(docx|pdf)$/i, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

interface WorkExperienceEntry {
  company: string
  position: string
  years: string
  descriptions: string[]
}

function emptyExperience(): WorkExperienceEntry {
  return { company: "", position: "", years: "", descriptions: [] }
}

function experiencesFromRecord(record: ResumeRecord | null): WorkExperienceEntry[] {
  return (record?.work_experiences ?? []).map((e: WorkExperience) => ({
    company: e.company,
    position: e.position,
    years: e.years,
    descriptions: [...e.descriptions],
  }))
}

function ResumeFormDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: ResumeRecord | null
}) {
  const isEdit = !!editing
  const createMutation = useCreateResume()
  const updateMutation = useUpdateResume()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(editing?.name ?? "")
  const [email, setEmail] = useState(editing?.email ?? "")
  const [phone, setPhone] = useState(editing?.phone ?? "")
  const [linkedinUrl, setLinkedinUrl] = useState(editing?.linkedin_url ?? "")
  const [githubUrl, setGithubUrl] = useState(editing?.github_url ?? "")
  const [status, setStatus] = useState<ResumeStatus>(editing?.status ?? "active")
  const [professionalStatement, setProfessionalStatement] = useState(
    editing?.professional_statement ?? ""
  )
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceEntry[]>(
    experiencesFromRecord(editing)
  )
  const [skills, setSkills] = useState<string[]>(editing?.skills ?? [])
  const [skillInput, setSkillInput] = useState("")
  const [degreeType, setDegreeType] = useState(editing?.degree_type ?? "")
  const [degreeField, setDegreeField] = useState(editing?.degree_field ?? "")
  const [school, setSchool] = useState(editing?.school ?? "")
  const [graduationYear, setGraduationYear] = useState(
    editing?.graduation_year ? String(editing.graduation_year) : ""
  )
  const [isDragOver, setIsDragOver] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)

  const busy = createMutation.isPending || updateMutation.isPending

  function reset() {
    setName(editing?.name ?? "")
    setEmail(editing?.email ?? "")
    setPhone(editing?.phone ?? "")
    setLinkedinUrl(editing?.linkedin_url ?? "")
    setGithubUrl(editing?.github_url ?? "")
    setStatus(editing?.status ?? "active")
    setProfessionalStatement(editing?.professional_statement ?? "")
    setWorkExperiences(experiencesFromRecord(editing))
    setSkills(editing?.skills ?? [])
    setSkillInput("")
    setDegreeType(editing?.degree_type ?? "")
    setDegreeField(editing?.degree_field ?? "")
    setSchool(editing?.school ?? "")
    setGraduationYear(editing?.graduation_year ? String(editing.graduation_year) : "")
    setIsDragOver(false)
    setIsExtracting(false)
  }

  function commitSkillInput() {
    const trimmed = skillInput.trim().replace(/,+$/, "")
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setSkillInput("")
  }

  async function handleFileDrop(f: File) {
    if (!f.name.match(/\.(docx|pdf)$/i)) {
      toaster.create({ type: "error", title: "Only .docx or .pdf files are supported" })
      return
    }
    setIsExtracting(true)
    try {
      const parsed = await extractResumeText(f)
      if (parsed.name?.trim()) setName(parsed.name.trim())
      else if (!name.trim()) setName(cleanFilename(f.name))
      if (parsed.email?.trim()) setEmail(parsed.email.trim())
      if (parsed.phone?.trim()) setPhone(parsed.phone.trim())
      if (parsed.linkedin_url?.trim()) setLinkedinUrl(parsed.linkedin_url.trim())
      if (parsed.github_url?.trim()) setGithubUrl(parsed.github_url.trim())
      if (parsed.professional_statement?.trim()) setProfessionalStatement(parsed.professional_statement.trim())
      if (parsed.work_experiences?.length) setWorkExperiences(parsed.work_experiences)
      if (parsed.skills?.length) setSkills(parsed.skills)
      if (parsed.degree_type?.trim()) setDegreeType(parsed.degree_type.trim())
      if (parsed.degree_field?.trim()) setDegreeField(parsed.degree_field.trim())
      if (parsed.school?.trim()) setSchool(parsed.school.trim())
      if (parsed.graduation_year) setGraduationYear(String(parsed.graduation_year))
    } catch {
      toaster.create({ type: "warning", title: "Could not extract text from file" })
    } finally {
      setIsExtracting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const cleanedExperiences = workExperiences
      .filter((e) =>
        e.company.trim() || e.position.trim() || e.years.trim() ||
        e.descriptions.some((d) => d.trim())
      )
      .map((e) => ({
        company: e.company.trim(),
        position: e.position.trim(),
        years: e.years.trim(),
        descriptions: e.descriptions.map((d) => d.trim()).filter(Boolean),
      }))
    const payload = {
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      professional_statement: professionalStatement.trim() || null,
      work_experiences: cleanedExperiences.length > 0 ? cleanedExperiences : null,
      skills: skills.length > 0 ? skills : null,
      status,
      degree_type: degreeType.trim() || null,
      degree_field: degreeField.trim() || null,
      school: school.trim() || null,
      graduation_year: graduationYear ? parseInt(graduationYear, 10) : null,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editing!.id, data: payload })
        toaster.create({ type: "success", title: "Resume updated" })
      } else {
        await createMutation.mutateAsync(payload)
        toaster.create({ type: "success", title: "Resume created" })
      }
      onClose()
      reset()
    } catch {
      toaster.create({ type: "error", title: "Something went wrong" })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(); reset() }}
      title={isEdit ? "Edit Resume" : "New Resume"}
      size="lg"
      footer={
        <HStack justify="flex-end" w="full" gap={3}>
          <Button variant="ghost" onClick={() => { onClose(); reset() }} disabled={busy}>
            Cancel
          </Button>
          <Button colorPalette="blue" type="submit" form="resume-form" loading={busy}>
            {isEdit ? "Save" : "Create"}
          </Button>
        </HStack>
      }
    >
      <form id="resume-form" onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">

          {/* ── Contact ── */}
          <HStack gap={3} align="flex-start">
            <Box flex={1}>
              <Text mb={1} fontSize="sm" color="gray.400">Name *</Text>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </Box>
            <Box w="160px">
              <Text mb={1} fontSize="sm" color="gray.400">Status</Text>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ResumeStatus)}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>
          </HStack>

          <HStack gap={3} align="flex-start">
            <Box flex={1}>
              <Text mb={1} fontSize="sm" color="gray.400">Email</Text>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
              />
            </Box>
            <Box flex={1}>
              <Text mb={1} fontSize="sm" color="gray.400">Phone</Text>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </Box>
          </HStack>

          <Box>
            <Text mb={1} fontSize="sm" color="gray.400">LinkedIn URL</Text>
            <Input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="linkedin.com/in/yourname"
            />
          </Box>

          <Box>
            <Text mb={1} fontSize="sm" color="gray.400">GitHub URL</Text>
            <Input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="github.com/yourname"
            />
          </Box>

          {/* ── Summary ── */}
          <Separator borderColor="gray.700" />

          <Box>
            <Text mb={1} fontSize="sm" color="gray.400">Professional Statement</Text>
            <Textarea
              value={professionalStatement}
              onChange={(e) => setProfessionalStatement(e.target.value)}
              placeholder="Brief summary of your expertise, background, and career goals…"
              rows={3}
            />
          </Box>

          {/* ── Work Experience ── */}
          <Separator borderColor="gray.700" />

          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.400">
                Work Experience
                {isExtracting && (
                  <Text as="span" ml={2} fontSize="xs" color="blue.400">Extracting…</Text>
                )}
              </Text>
              <Button
                size="xs"
                variant="ghost"
                colorPalette="blue"
                onClick={() => setWorkExperiences((prev) => [...prev, emptyExperience()])}
                type="button"
                disabled={isExtracting}
              >
                <LuPlus /> Add Experience
              </Button>
            </HStack>
            <VStack gap={3} align="stretch">
              {workExperiences.map((exp, i) => (
                <Box
                  key={i}
                  border="1px solid"
                  borderColor="gray.700"
                  borderRadius="md"
                  p={3}
                >
                  <HStack gap={2} align="flex-end" mb={2}>
                    <Box flex={2}>
                      <Text mb={1} fontSize="xs" color="gray.500">Company</Text>
                      <Input
                        size="sm"
                        value={exp.company}
                        onChange={(e) =>
                          setWorkExperiences((prev) =>
                            prev.map((x, idx) => idx === i ? { ...x, company: e.target.value } : x)
                          )
                        }
                        placeholder="e.g. Acme Corp"
                        disabled={isExtracting}
                      />
                    </Box>
                    <Box flex={2}>
                      <Text mb={1} fontSize="xs" color="gray.500">Position</Text>
                      <Input
                        size="sm"
                        value={exp.position}
                        onChange={(e) =>
                          setWorkExperiences((prev) =>
                            prev.map((x, idx) => idx === i ? { ...x, position: e.target.value } : x)
                          )
                        }
                        placeholder="e.g. Software Engineer"
                        disabled={isExtracting}
                      />
                    </Box>
                    <Box flex={1}>
                      <Text mb={1} fontSize="xs" color="gray.500">Years</Text>
                      <Input
                        size="sm"
                        value={exp.years}
                        onChange={(e) =>
                          setWorkExperiences((prev) =>
                            prev.map((x, idx) => idx === i ? { ...x, years: e.target.value } : x)
                          )
                        }
                        placeholder="2020–2023"
                        disabled={isExtracting}
                      />
                    </Box>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() =>
                        setWorkExperiences((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      type="button"
                      aria-label="Remove experience"
                    >
                      <LuX />
                    </Button>
                  </HStack>

                  <VStack gap={1} align="stretch">
                    {exp.descriptions.map((desc, di) => (
                      <HStack key={di} gap={1}>
                        <Input
                          size="sm"
                          flex={1}
                          value={desc}
                          onChange={(e) =>
                            setWorkExperiences((prev) =>
                              prev.map((x, idx) =>
                                idx === i
                                  ? { ...x, descriptions: x.descriptions.map((d, dj) => dj === di ? e.target.value : d) }
                                  : x
                              )
                            )
                          }
                          placeholder="Description bullet…"
                          disabled={isExtracting}
                        />
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() =>
                            setWorkExperiences((prev) =>
                              prev.map((x, idx) =>
                                idx === i
                                  ? { ...x, descriptions: x.descriptions.filter((_, dj) => dj !== di) }
                                  : x
                              )
                            )
                          }
                          type="button"
                          aria-label="Remove description"
                        >
                          <LuX />
                        </Button>
                      </HStack>
                    ))}
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="gray"
                      alignSelf="flex-start"
                      onClick={() =>
                        setWorkExperiences((prev) =>
                          prev.map((x, idx) =>
                            idx === i ? { ...x, descriptions: [...x.descriptions, ""] } : x
                          )
                        )
                      }
                      type="button"
                      disabled={isExtracting}
                    >
                      <LuPlus /> Add Description
                    </Button>
                  </VStack>
                </Box>
              ))}
              {workExperiences.length === 0 && (
                <Text fontSize="xs" color="gray.600">
                  Click "Add Experience" to add a work history entry.
                </Text>
              )}
            </VStack>
          </Box>

          {/* ── Skills ── */}
          <Separator borderColor="gray.700" />

          <Box>
            <Text mb={1} fontSize="sm" color="gray.400">Skills</Text>
            {skills.length > 0 && (
              <HStack wrap="wrap" gap={1} mb={2}>
                {skills.map((s) => (
                  <Badge
                    key={s}
                    colorPalette="blue"
                    size="sm"
                    cursor="pointer"
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                  >
                    {s} ✕
                  </Badge>
                ))}
              </HStack>
            )}
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Type a skill and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault()
                  commitSkillInput()
                }
              }}
              onBlur={commitSkillInput}
            />
          </Box>

          {/* ── Education ── */}
          <Separator borderColor="gray.700" />

          <HStack gap={3} align="flex-start">
            <Box flex={1}>
              <Text mb={1} fontSize="sm" color="gray.400">Degree Type</Text>
              <Input
                value={degreeType}
                onChange={(e) => setDegreeType(e.target.value)}
                placeholder="e.g. Bachelor's"
              />
            </Box>
            <Box flex={1}>
              <Text mb={1} fontSize="sm" color="gray.400">Degree Field</Text>
              <Input
                value={degreeField}
                onChange={(e) => setDegreeField(e.target.value)}
                placeholder="e.g. Computer Science"
              />
            </Box>
          </HStack>

          <HStack gap={3} align="flex-start">
            <Box flex={1}>
              <Text mb={1} fontSize="sm" color="gray.400">School</Text>
              <Input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. University of California, Berkeley"
              />
            </Box>
            <Box w="120px">
              <Text mb={1} fontSize="sm" color="gray.400">Year</Text>
              <Input
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2022"
                type="number"
                min={1900}
                max={2100}
              />
            </Box>
          </HStack>

          {/* ── File import (new only) ── */}
          {!isEdit && (
            <>
              <Separator borderColor="gray.700" />
              <Box>
                <Text mb={1} fontSize="sm" color="gray.400">Pre-fill from file (optional)</Text>
                <Box
                  border="2px dashed"
                  borderColor={isDragOver ? "blue.400" : "gray.600"}
                  borderRadius="md"
                  p={5}
                  textAlign="center"
                  cursor="pointer"
                  bg={isDragOver ? "blue.950" : "transparent"}
                  transition="all 0.15s"
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragOver(false)
                    const f = e.dataTransfer.files[0]
                    if (f) handleFileDrop(f)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <HStack justify="center" gap={2} color="gray.500">
                    <LuFile />
                    <Text fontSize="sm">
                      Drop a .docx or .pdf to add a work experience entry, or click to browse
                    </Text>
                  </HStack>
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFileDrop(f)
                    e.target.value = ""
                  }}
                />
              </Box>
            </>
          )}
        </VStack>
      </form>
    </Dialog>
  )
}

function DeleteDialog({
  open,
  onClose,
  resume,
}: {
  open: boolean
  onClose: () => void
  resume: ResumeRecord | null
}) {
  const deleteMutation = useDeleteResume()

  async function handleDelete() {
    if (!resume) return
    try {
      await deleteMutation.mutateAsync(resume.id)
      toaster.create({ type: "success", title: "Resume deleted" })
      onClose()
    } catch {
      toaster.create({ type: "error", title: "Delete failed" })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete Resume"
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
        Delete <strong>{resume?.name}</strong>? This cannot be undone.
        Jobs referencing this resume will have their resume link cleared.
      </Text>
    </Dialog>
  )
}

export function ResumesPage() {
  const { data, isLoading } = useResumes()
  const resumes = data?.data ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ResumeRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ResumeRecord | null>(null)

  function openCreate() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(r: ResumeRecord) {
    setEditTarget(r)
    setFormOpen(true)
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color="white">Resumes</Text>
        <Button colorPalette="blue" onClick={openCreate}>
          <LuPlus />
          New Resume
        </Button>
      </Flex>

      {isLoading ? (
        <VStack gap={3} align="stretch">
          {[1, 2, 3].map((i) => <Skeleton key={i} h="40px" rounded="md" />)}
        </VStack>
      ) : resumes.length === 0 ? (
        <Box textAlign="center" py={16} color="gray.500">
          <Text fontSize="lg">No resumes yet.</Text>
          <Text fontSize="sm" mt={1}>Click "New Resume" to get started.</Text>
        </Box>
      ) : (
        <Table.Root size="sm" variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Created</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {resumes.map((r) => {
              const statusKey = r.status ?? "active"
              return (
                <Table.Row key={r.id}>
                  <Table.Cell fontWeight="medium" color="white">
                    {r.name}
                  </Table.Cell>
                  <Table.Cell color="gray.400">{r.email ?? "—"}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={RESUME_STATUS_COLORS[statusKey]} size="sm">
                      {RESUME_STATUS_LABELS[statusKey]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell color="gray.500" fontSize="xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack justify="flex-end" gap={1}>
                      <Button size="xs" variant="ghost" onClick={() => openEdit(r)} title="Edit">
                        <LuPencil />
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => setDeleteTarget(r)}
                        title="Delete"
                      >
                        <LuTrash2 />
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      )}

      <ResumeFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editTarget}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        resume={deleteTarget}
      />
    </Box>
  )
}
