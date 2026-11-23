export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export type ApplicationStatus =
  | "WISHLIST"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  requiredSkills: string[];
  cvVersion?: string;
  appliedDate?: string;
  interviewDateTime?: string; // format YYYY-MM-DDTHH:mm
  salaryOffer?: number;
  lastUpdatedAt: string; // ISO
  checklist: ChecklistItem[];
  activityLogs: ActivityLog[];
}
