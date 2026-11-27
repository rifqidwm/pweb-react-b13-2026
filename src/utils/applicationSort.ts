import type { Application } from "../types/application";
import { parseInterviewTime } from "./interviewConflict";

export type PipelineSort = "newest" | "interview" | "offer";

// Waktu lamaran dibuat = timestamp paling awal di activityLogs
// (log pembuatan otomatis dari createApplication). Tidak perlu field createdAt.
export function getCreatedTime(app: Application): number {
  const times = app.activityLogs
    .map((log) => new Date(log.timestamp).getTime())
    .filter((time) => !Number.isNaN(time));
  return times.length > 0 ? Math.min(...times) : new Date(app.lastUpdatedAt).getTime();
}

const byNewest = (a: Application, b: Application) => getCreatedTime(b) - getCreatedTime(a);

// Jadwal hanya relevan untuk lamaran yang masih berstatus INTERVIEW
function upcomingInterviewTime(app: Application): number | null {
  return app.status === "INTERVIEW" ? parseInterviewTime(app.interviewDateTime) : null;
}

// Mengembalikan array BARU; array state asli tidak ikut ter-sort (immutable)
export function sortApplications(apps: Application[], sortBy: PipelineSort): Application[] {
  const copy = [...apps];

  if (sortBy === "interview") {
    return copy.sort((a, b) => {
      const timeA = upcomingInterviewTime(a);
      const timeB = upcomingInterviewTime(b);
      if (timeA === null && timeB === null) return byNewest(a, b);
      if (timeA === null) return 1; // tanpa jadwal -> paling bawah
      if (timeB === null) return -1;
      return timeA - timeB; // jadwal paling awal di atas
    });
  }

  if (sortBy === "offer") {
    // Tanpa salaryOffer dianggap 0 -> paling bawah; seri -> yang terbaru di atas
    return copy.sort((a, b) => (b.salaryOffer ?? 0) - (a.salaryOffer ?? 0) || byNewest(a, b));
  }

  return copy.sort(byNewest);
}
