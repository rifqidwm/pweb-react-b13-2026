import { useEffect, useState } from "react";
import type { JobListing, JobSource } from "../types/job";
import type { Application } from "../types/application";
import { fetchJobs } from "../services/jobService";
import { useDebounce } from "../hooks/useDebounce";
import { getSkillMatch } from "../utils/skillMatch";
import { isDuplicate } from "../utils/isDuplicate";
import { JobCard } from "./JobCard";

interface JobExplorerProps {
  kaptenSkills: string[];
  applications: Application[];
  onSaveJob: (job: JobListing) => void;
}

type SortBy = "default" | "match";

export function JobExplorer({ kaptenSkills, applications, onSaveJob }: JobExplorerProps) {
  const [source, setSource] = useState<JobSource>("remote");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("default");

  const debouncedKeyword = useDebounce(keyword, 400);

  // Fetch ulang setiap sumber data berubah atau tombol Coba Lagi diklik
  useEffect(() => {
    const controller = new AbortController();

    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchJobs(source, controller.signal);
        setJobs(data);
      } catch (err) {
        // Request yang sengaja dibatalkan tidak dianggap error
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    loadJobs();

    // Cleanup: batalkan request lama saat unmount atau dependency berubah
    return () => controller.abort();
  }, [source, reloadKey]);

  // Derived state: dihitung langsung dari jobs + filter + kaptenSkills
  const categories = [...new Set(jobs.map((job) => job.category))];

  const filteredJobs = jobs
    .filter((job) => {
      const kw = debouncedKeyword.toLowerCase();
      return (
        job.title.toLowerCase().includes(kw) ||
        job.company_name.toLowerCase().includes(kw)
      );
    })
    .filter((job) => category === "all" || job.category === category)
    .map((job) => ({ job, match: getSkillMatch(kaptenSkills, job.tags) }));

  const visibleJobs =
    sortBy === "match"
      ? [...filteredJobs].sort((a, b) => b.match.score - a.match.score)
      : filteredJobs;

  return (
    <section className="panel">
      <h2>Eksplorasi Lowongan</h2>

      <div className="row">
        <label>
          Sumber data:{" "}
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as JobSource)}
          >
            <option value="remote">Remotive API</option>
            <option value="local">Fallback Lokal</option>
          </select>
        </label>
      </div>

      <div className="row">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Cari posisi atau perusahaan..."
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
        >
          <option value="default">Urutan Default</option>
          <option value="match">Skill Match Tertinggi</option>
        </select>
      </div>

      {isLoading && <p>Memuat lowongan...</p>}

      {!isLoading && error && (
        <div className="error-box">
          <p>Error: {error}</p>
          <div className="row">
            <button type="button" onClick={() => setReloadKey(reloadKey + 1)}>
              Coba Lagi
            </button>
            {source === "remote" && (
              <button type="button" onClick={() => setSource("local")}>
                Pakai Fallback Lokal
              </button>
            )}
          </div>
        </div>
      )}

      {!isLoading && !error && visibleJobs.length === 0 && (
        <p className="muted">Tidak ada lowongan yang ditemukan.</p>
      )}

      {!isLoading && !error && visibleJobs.length > 0 && (
        <div className="grid">
          {visibleJobs.map(({ job, match }) => (
            <JobCard
              key={job.id}
              job={job}
              match={match}
              isApplied={isDuplicate(applications, job.company_name, job.title)}
              onSave={onSaveJob}
            />
          ))}
        </div>
      )}
    </section>
  );
}
