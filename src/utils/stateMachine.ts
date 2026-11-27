import type { Application, ApplicationStatus, WorkMode } from "../types/application";
import { formatRupiah } from "./format";

// SATU-SATUNYA sumber aturan transisi. Cocokkan dengan Diagram State Machine asisten.
export const STATUS_TRANSITIONS: Readonly<Record<ApplicationStatus, readonly ApplicationStatus[]>> = {
  WISHLIST: ["APPLIED"],
  APPLIED: ["SCREENING", "REJECTED", "GHOSTED"],
  SCREENING: ["INTERVIEW", "REJECTED", "GHOSTED"],
  INTERVIEW: ["OFFER", "REJECTED", "GHOSTED"],
  OFFER: [], // final
  REJECTED: [], // final
  GHOSTED: ["SCREENING"],
};

export interface TransitionInput {
  cvVersion?: string;
  appliedDate?: string; // YYYY-MM-DD
  interviewDateTime?: string; // YYYY-MM-DDTHH:mm
  salaryOffer?: number;
  workMode?: WorkMode;
}

export type TransitionErrors = Partial<Record<keyof TransitionInput | "status", string>>;

// Format YYYY-MM-DD dan tanggalnya benar-benar ada (30 Februari ditolak)
export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

// Format YYYY-MM-DDTHH:mm (nilai asli input datetime-local)
export function isValidDateTime(value: string): boolean {
  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d$/.exec(value);
  return match !== null && isValidDate(match[1]);
}

export function isValidSalary(value: number | undefined): boolean {
  return value !== undefined && Number.isSafeInteger(value) && value > 0;
}

// "Rp 4.500.000" atau "4500000" -> 4500000. Input ambigu ("4.5", "1e9", "-1") ditolak
export function parseRupiah(text: string): number | undefined {
  const match = /^(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d+)$/i.exec(text.trim());
  if (!match) return undefined;
  const value = Number(match[1].replaceAll(".", ""));
  return isValidSalary(value) ? value : undefined;
}

// Syarat data untuk berada di suatu status
export function getRequirementErrors(
  status: ApplicationStatus,
  input: TransitionInput
): TransitionErrors {
  const errors: TransitionErrors = {};

  if (status === "APPLIED") {
    if (!input.cvVersion?.trim()) errors.cvVersion = "Versi CV wajib diisi";
    if (!input.appliedDate || !isValidDate(input.appliedDate)) {
      errors.appliedDate = "Tanggal melamar wajib diisi";
    }
  }

  if (status === "INTERVIEW") {
    if (!input.interviewDateTime || !isValidDateTime(input.interviewDateTime)) {
      errors.interviewDateTime = "Jadwal interview wajib diisi";
    }
  }

  if (status === "OFFER") {
    if (!isValidSalary(input.salaryOffer)) errors.salaryOffer = "Gaji wajib angka bulat > 0";
    if (!input.workMode) errors.workMode = "Mode kerja wajib dipilih";
  }

  return errors;
}

export function getTransitionErrors(
  from: ApplicationStatus,
  to: ApplicationStatus,
  input: TransitionInput
): TransitionErrors {
  if (!STATUS_TRANSITIONS[from].includes(to)) {
    return { status: `Tidak boleh pindah dari ${from} ke ${to}` };
  }
  return getRequirementErrors(to, input);
}

// Updater immutable. Aturan dicek lagi di sini terhadap data TERBARU,
// jadi transisi tidak sah mengembalikan lamaran apa adanya.
export function applyTransition(
  app: Application,
  to: ApplicationStatus,
  input: TransitionInput,
  now: Date
): Application {
  if (Object.keys(getTransitionErrors(app.status, to, input)).length > 0) return app;

  const timestamp = now.toISOString();
  // lastUpdatedAt hanya berubah saat status berubah (dasar Rawan Ghosting)
  const next: Application = { ...app, status: to, lastUpdatedAt: timestamp };
  let detail = "";

  // Hanya field milik status tujuan yang disalin dari input
  if (to === "APPLIED") {
    next.cvVersion = input.cvVersion?.trim();
    next.appliedDate = input.appliedDate;
    detail = ` (CV: ${next.cvVersion}, tanggal ${next.appliedDate})`;
  }
  if (to === "INTERVIEW") {
    next.interviewDateTime = input.interviewDateTime;
    detail = ` (jadwal ${input.interviewDateTime?.replace("T", " ")})`;
  }
  if (to === "OFFER") {
    next.salaryOffer = input.salaryOffer;
    next.workMode = input.workMode ?? app.workMode;
    detail = ` (${formatRupiah(input.salaryOffer ?? 0)}, ${next.workMode})`;
  }

  next.activityLogs = [
    ...app.activityLogs,
    {
      id: crypto.randomUUID(),
      timestamp,
      message: `Status pindah dari ${app.status} ke ${to}${detail}`,
    },
  ];

  return next;
}
