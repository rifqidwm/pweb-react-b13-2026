import type { ApplicationStatus } from "../types/application";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

// Pill warna untuk status lamaran. Warna diatur di App.css (.status-wishlist, .status-applied, dst.)
export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-pill status-${status.toLowerCase()}`}>{status}</span>;
}
