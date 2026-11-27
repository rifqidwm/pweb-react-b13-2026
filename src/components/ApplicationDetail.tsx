import type { Application } from "../types/application";
import type { ApplicationIdHandler, UpdateApplicationHandler } from "../types/handlers";
import { getSkillMatch } from "../utils/skillMatch";
import { InterviewPrep } from "./InterviewPrep";
import { StatusBadge } from "./StatusBadge";

// KONTRAK props Sabil <-> Helen. Lihat docs/KONTRAK-HELEN.md
export interface ApplicationDetailProps {
  application: Application;
  kaptenSkills: string[];
  onUpdateApplication: UpdateApplicationHandler;
  onDeleteApplication: ApplicationIdHandler;
  onSimulateGhosting: ApplicationIdHandler;
}

// PLACEHOLDER: isi komponen ini dikerjakan Helen (Fitur 4 + wadah Fitur 5).
// Nama export & props jangan diubah tanpa diskusi dengan Sabil.
export function ApplicationDetail({
  application,
  kaptenSkills,
  onDeleteApplication,
  onSimulateGhosting,
}: ApplicationDetailProps) {
  const match = getSkillMatch(kaptenSkills, application.requiredSkills);
  const canSimulate = application.status === "APPLIED" || application.status === "SCREENING";

  return (
    <div className="detail">
      <div className="card-head">
        <div>
          <h2>
            {application.role} — {application.company}
          </h2>
          <p className="muted">
            {application.workMode} • CV: {application.cvVersion ?? "-"} • Skill Match{" "}
            {match.score}%
          </p>
        </div>
        <div className="row">
          <StatusBadge status={application.status} />
          <button
            type="button"
            className="btn-secondary btn-sm"
            disabled={!canSimulate}
            title={canSimulate ? undefined : "Hanya untuk status APPLIED/SCREENING"}
            onClick={() => onSimulateGhosting(application.id)}
          >
            Simulasi +15 Hari
          </button>
          <button
            type="button"
            className="btn-danger btn-sm"
            onClick={() => onDeleteApplication(application.id)}
          >
            Hapus
          </button>
        </div>
      </div>
      {!canSimulate && <p className="hint">Simulasi hanya untuk status APPLIED/SCREENING.</p>}

      <p className="placeholder-note">
        Placeholder Helen (Fitur 4): transisi status sesuai state machine, input kondisional,
        nested checklist + progress bar, activity log + catatan manual.
      </p>

      <InterviewPrep />
    </div>
  );
}
