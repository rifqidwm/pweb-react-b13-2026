import type { Application } from "../types/application";

// Pasangan company + role tidak boleh sama (huruf besar/kecil tidak berpengaruh)
export function isDuplicate(
  applications: Application[],
  company: string,
  role: string
): boolean {
  return applications.some(
    (app) =>
      app.company.trim().toLowerCase() === company.trim().toLowerCase() &&
      app.role.trim().toLowerCase() === role.trim().toLowerCase()
  );
}
