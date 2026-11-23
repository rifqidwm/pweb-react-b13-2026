// Format 1 item lowongan dari Remotive API dan magang-fallback.json
export interface JobListing {
  id: number;
  title: string;
  company_name: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  tags: string[];
}

// Bentuk response Remotive: { "job-count": number, "jobs": JobListing[] }
export interface JobResponse {
  jobs: JobListing[];
}

export type JobSource = "remote" | "local";
