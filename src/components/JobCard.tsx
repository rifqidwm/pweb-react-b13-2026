import type { JobListing } from "../types/job";
import type { SkillMatchResult } from "../utils/skillMatch";
import { getMatchColor } from "../utils/skillMatch";

interface JobCardProps {
  job: JobListing;
  match: SkillMatchResult;
  isApplied: boolean;
  onSave: (job: JobListing) => void;
}

export function JobCard({ job, match, isApplied, onSave }: JobCardProps) {
  return (
    <article className="card">
      <div className="card-head">
        <div>
          <h3>{job.title}</h3>
          <p className="muted">
            {job.company_name} • {job.candidate_required_location}
          </p>
        </div>
        <span className={`badge badge-${getMatchColor(match.score)}`}>
          {match.score}% Match
        </span>
      </div>

      <p className="muted">
        {job.category} • {job.salary || "Gaji tidak dicantumkan"}
      </p>

      <p>
        <strong>Skill cocok:</strong>{" "}
        {match.matched.length > 0 ? match.matched.join(", ") : "-"}
      </p>
      <p>
        <strong>Missing skills:</strong>{" "}
        {match.missing.length > 0 ? (
          <span className="missing">{match.missing.join(", ")}</span>
        ) : (
          "-"
        )}
      </p>

      <button type="button" disabled={isApplied} onClick={() => onSave(job)}>
        {isApplied ? "Sudah Dilamar" : "Simpan ke Wishlist"}
      </button>
    </article>
  );
}
