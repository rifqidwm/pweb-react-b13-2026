import type { Application } from "../types/application";
import { getMatchColor, getSkillMatch } from "../utils/skillMatch";
import { StatusBadge } from "./StatusBadge";

// Tahap 1: daftar lamaran + tombol Detail.
// Tahap 2: filter gabungan, sorting, badge Rawan Ghosting, Simulasi +15 Hari.
interface WarRoomProps {
  applications: Application[];
  kaptenSkills: string[];
  onOpenDetail: (id: string) => void;
}

export function WarRoom({ applications, kaptenSkills, onOpenDetail }: WarRoomProps) {
  if (applications.length === 0) {
    return (
      <section className="panel">
        <h2>War Room Lamaran</h2>
        <p className="muted">
          Belum ada lamaran. Simpan lowongan dari tab Eksplorasi atau klik "+ Catat Lamaran".
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>War Room Lamaran</h2>

      <div className="grid">
        {applications.map((app) => {
          const match = getSkillMatch(kaptenSkills, app.requiredSkills);
          const doneCount = app.checklist.filter((item) => item.done).length;

          return (
            <article key={app.id} className="card">
              <div className="card-head">
                <div>
                  <h3>{app.role}</h3>
                  <p className="muted">
                    {app.company} • {app.workMode}
                  </p>
                </div>
                <span className={`badge badge-${getMatchColor(match.score)}`}>
                  {match.score}% Match
                </span>
              </div>

              <div className="row">
                <StatusBadge status={app.status} />
              </div>

              <p className="muted">
                CV: {app.cvVersion ?? "-"} • Checklist {doneCount}/{app.checklist.length}
              </p>

              <div className="row card-actions">
                <button type="button" className="btn-sm" onClick={() => onOpenDetail(app.id)}>
                  Lihat Detail
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
