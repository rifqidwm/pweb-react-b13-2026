import type { Application } from "../types/application";
import type { ApplicationIdHandler, UpdateApplicationHandler } from "../types/handlers";
import { getSkillMatch } from "../utils/skillMatch";
import { canBeGhosted } from "../utils/ghosting";
import { InterviewPrep } from "./InterviewPrep";
import { StatusBadge } from "./StatusBadge";
import { ActivityLogList } from "./ActivityLogList";
import { Checklist } from "./Checklist";
import { StatusTransition } from "./StatusTransition";
import "./ApplicationDetail.css";

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
  onUpdateApplication,
  onDeleteApplication,
  onSimulateGhosting,
}: ApplicationDetailProps) {
  const match = getSkillMatch(kaptenSkills, application.requiredSkills);
  const canSimulate = canBeGhosted(application.status);

  return (
    <div className="detail hd">
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

            <div className="hd-body">
        <div>
          <StatusTransition
            key={application.status}
            application={application}
            onUpdateApplication={onUpdateApplication}
          />
          <Checklist application={application} onUpdateApplication={onUpdateApplication} />
        </div>
        <aside className="hd-side">
          <InterviewPrep />
          <ActivityLogList application={application} onUpdateApplication={onUpdateApplication} />
        </aside>
      </div>
    </div>
  );
}
