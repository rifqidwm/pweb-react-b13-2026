import type { Application } from "../types/application";

export const CONFLICT_WINDOW_MINUTES = 60;
const MINUTE_MS = 60 * 1000;

export interface InterviewConflict {
  first: Application;
  second: Application;
  firstTime: number;
  secondTime: number;
  diffMinutes: number;
}

interface ScheduledInterview {
  app: Application;
  time: number;
}

// "YYYY-MM-DDTHH:mm" dibaca sebagai waktu lokal. null jika kosong / tidak valid.
export function parseInterviewTime(value: string | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

// Semua pasangan lamaran INTERVIEW yang jadwalnya berselisih < 60 menit.
// WAJIB dipanggil dengan SELURUH applications, bukan data hasil filter.
export function findInterviewConflicts(applications: Application[]): InterviewConflict[] {
  const scheduled = applications
    .filter((app) => app.status === "INTERVIEW")
    .map((app) => ({ app, time: parseInterviewTime(app.interviewDateTime) }))
    .filter((item): item is ScheduledInterview => item.time !== null)
    .sort((a, b) => a.time - b.time);

  // Bandingkan tiap jadwal dengan jadwal-jadwal sesudahnya
  return scheduled.flatMap((current, index) =>
    scheduled
      .slice(index + 1)
      .filter((next) => next.time - current.time < CONFLICT_WINDOW_MINUTES * MINUTE_MS)
      .map((next) => ({
        first: current.app,
        second: next.app,
        firstTime: current.time,
        secondTime: next.time,
        diffMinutes: Math.round((next.time - current.time) / MINUTE_MS),
      }))
  );
}
