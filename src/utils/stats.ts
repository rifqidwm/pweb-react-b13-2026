import type { Application, ApplicationStatus } from "../types/application";
import { isRawanGhosting } from "./ghosting";

export interface DashboardStats {
  total: number; // semua lamaran (termasuk WISHLIST)
  active: number; // masih berjalan: APPLIED, SCREENING, INTERVIEW
  responded: number; // sudah ditanggapi perusahaan
  responseRate: number; // % responded dari total
  interviewed: number; // pernah sampai tahap wawancara
  interviewRate: number; // % interviewed dari total
  rawanGhosting: number; // APPLIED/SCREENING tanpa perubahan > 14 hari
  offers: number; // status OFFER
}

const ACTIVE_STATUSES: ApplicationStatus[] = ["APPLIED", "SCREENING", "INTERVIEW"];
const RESPONSE_STATUSES: ApplicationStatus[] = ["SCREENING", "INTERVIEW", "OFFER", "REJECTED"];

// Pernah wawancara: status INTERVIEW/OFFER, atau punya jadwal interview
// (jadwal wajib diisi saat masuk INTERVIEW, jadi tetap terhitung walau kemudian REJECTED/GHOSTED)
export function reachedInterview(app: Application): boolean {
  return app.status === "INTERVIEW" || app.status === "OFFER" || Boolean(app.interviewDateTime);
}

// Sudah ditanggapi perusahaan (positif maupun negatif). WISHLIST, APPLIED, GHOSTED = belum ada respons.
export function gotResponse(app: Application): boolean {
  return RESPONSE_STATUSES.includes(app.status) || reachedInterview(app);
}

// Persentase bulat; 0 lamaran -> 0%, bukan NaN
export function toPercent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

// Derived state: seluruh angka dihitung ulang dari applications, tidak disimpan di useState
export function computeStats(applications: Application[], now: number): DashboardStats {
  const total = applications.length;
  const responded = applications.filter(gotResponse).length;
  const interviewed = applications.filter(reachedInterview).length;

  return {
    total,
    active: applications.filter((app) => ACTIVE_STATUSES.includes(app.status)).length,
    responded,
    responseRate: toPercent(responded, total),
    interviewed,
    interviewRate: toPercent(interviewed, total),
    rawanGhosting: applications.filter((app) => isRawanGhosting(app, now)).length,
    offers: applications.filter((app) => app.status === "OFFER").length,
  };
}
