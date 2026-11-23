import type { Application, ApplicationStatus, WorkMode } from "../types/application";
import type { JobListing } from "../types/job";

interface NewApplicationInput {
  company: string;
  role: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  requiredSkills: string[];
  cvVersion?: string;
  appliedDate?: string;
}

// Membuat objek Application baru + log pembuatan otomatis
export function createApplication(input: NewApplicationInput): Application {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    company: input.company.trim(),
    role: input.role.trim(),
    workMode: input.workMode,
    status: input.status,
    requiredSkills: input.requiredSkills,
    cvVersion: input.cvVersion,
    appliedDate: input.appliedDate,
    lastUpdatedAt: now,
    checklist: [],
    activityLogs: [
      {
        id: crypto.randomUUID(),
        timestamp: now,
        message: `Lamaran dibuat dengan status ${input.status}`,
      },
    ],
  };
}

// Mode kerja dibaca dari candidate_required_location, misal "Surabaya (Hybrid)"
export function getWorkModeFromLocation(location: string): WorkMode {
  const text = location.toLowerCase();
  if (text.includes("hybrid")) return "Hybrid";
  if (text.includes("onsite") || text.includes("on-site")) return "Onsite";
  return "Remote";
}

// Lowongan dari Explorer disimpan sebagai WISHLIST
export function createApplicationFromJob(job: JobListing): Application {
  return createApplication({
    company: job.company_name,
    role: job.title,
    workMode: getWorkModeFromLocation(job.candidate_required_location),
    status: "WISHLIST",
    requiredSkills: job.tags,
  });
}
