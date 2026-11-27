import type { Application } from "../types/application";
import type { ApplicationIdHandler } from "../types/handlers";
import { getMatchColor } from "../utils/skillMatch";
import { canBeGhosted, daysSince, SIMULATE_DAYS } from "../utils/ghosting";
import { formatDateTime, formatRupiah } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

interface PipelineCardProps {
  application: Application;
  matchScore: number;
  isGhosting: boolean;
  now: number;
  onOpenDetail: (id: string) => void;
  onSimulateGhosting: ApplicationIdHandler;
}

export function PipelineCard({
  application: app,
  matchScore,
  isGhosting,
  now,
  onOpenDetail,
  onSimulateGhosting,
}: PipelineCardProps) {
  const doneCount = app.checklist.filter((item) => item.done).length;
  const totalCount = app.checklist.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const canSimulate = canBeGhosted(app.status);
  // Math.max: lamaran yang baru dibuat setelah `now` terakhir di-update tidak tampil -1 hari
  const idleDays = Math.max(0, Math.floor(daysSince(app.lastUpdatedAt, now)));

  return (
    <article className={isGhosting ? "card card-ghosting" : "card"}>
      <div className="card-head">
        <div>
          <h3>{app.role}</h3>
          <p className="muted">
            {app.company} • {app.workMode}
          </p>
        </div>
        <span className={`badge badge-${getMatchColor(matchScore)}`}>{matchScore}% Match</span>
      </div>

      <div className="badge-row">
        <StatusBadge status={app.status} />
        {isGhosting && <span className="badge badge-red">Rawan Ghosting</span>}
      </div>

      <div className="meta">
        <span>CV: {app.cvVersion ?? "-"}</span>
        <span>
          Checklist: {doneCount}/{totalCount} selesai
        </span>
        <div className="progress" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {app.status === "INTERVIEW" && app.interviewDateTime && (
          <span>Interview: {formatDateTime(app.interviewDateTime)}</span>
        )}
        {app.salaryOffer !== undefined && <span>Offer: {formatRupiah(app.salaryOffer)}</span>}
        {canSimulate && <span className="muted">Status tidak berubah: {idleDays} hari</span>}
      </div>

      <div className="row card-actions">
        <button type="button" className="btn-sm" onClick={() => onOpenDetail(app.id)}>
          Lihat Detail
        </button>
        <button
          type="button"
          className="btn-secondary btn-sm"
          disabled={!canSimulate}
          title={canSimulate ? undefined : "Hanya untuk status APPLIED/SCREENING"}
          onClick={() => onSimulateGhosting(app.id)}
        >
          Simulasi +{SIMULATE_DAYS} Hari
        </button>
      </div>
      {!canSimulate && <p className="hint">Simulasi hanya untuk status APPLIED/SCREENING.</p>}
    </article>
  );
}
