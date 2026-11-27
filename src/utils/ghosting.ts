import type { Application, ApplicationStatus } from "../types/application";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const GHOSTING_THRESHOLD_DAYS = 14; // > 14 hari tanpa perubahan status = rawan
export const SIMULATE_DAYS = 15; // dipakai tombol "Simulasi +15 Hari"

// Hanya lamaran yang sedang menunggu kabar HRD yang bisa kena ghosting
export function canBeGhosted(status: ApplicationStatus): boolean {
  return status === "APPLIED" || status === "SCREENING";
}

// Selisih hari dari tanggal ISO sampai `now` (boleh pecahan)
export function daysSince(isoDate: string, now: number): number {
  return (now - new Date(isoDate).getTime()) / DAY_MS;
}

// Derived state: dihitung langsung dari data lamaran, tidak disimpan di useState.
// `now` dikirim dari luar supaya fungsi ini murni dan mudah diuji.
export function isRawanGhosting(app: Application, now: number): boolean {
  return canBeGhosted(app.status) && daysSince(app.lastUpdatedAt, now) > GHOSTING_THRESHOLD_DAYS;
}

// Mundurkan tanggal ISO sebanyak `days` hari
export function shiftDaysBack(isoDate: string, days: number): string {
  return new Date(new Date(isoDate).getTime() - days * DAY_MS).toISOString();
}
