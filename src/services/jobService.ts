import type { JobListing, JobResponse, JobSource } from "../types/job";

const REMOTE_URL =
  "https://remotive.com/api/remote-jobs?category=software-dev&limit=30";
const LOCAL_URL = "/magang-fallback.json";

export async function fetchJobs(
  source: JobSource,
  signal: AbortSignal
): Promise<JobListing[]> {
  const url = source === "remote" ? REMOTE_URL : LOCAL_URL;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Gagal mengambil data lowongan");

  const json: JobResponse = await res.json();
  return json.jobs;
}
