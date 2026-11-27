import { useState } from "react";
import type { Application, ApplicationStatus } from "../types/application";
import type { ApplicationIdHandler } from "../types/handlers";
import { getSkillMatch } from "../utils/skillMatch";
import { isRawanGhosting } from "../utils/ghosting";
import { sortApplications } from "../utils/applicationSort";
import type { PipelineSort } from "../utils/applicationSort";
import { PipelineCard } from "./PipelineCard";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "GHOSTED",
];

type StatusFilter = ApplicationStatus | "ALL";

interface WarRoomProps {
  applications: Application[];
  kaptenSkills: string[];
  now: number; // waktu sekarang dari useNow di App (dasar hitung Rawan Ghosting)
  onOpenDetail: (id: string) => void;
  onSimulateGhosting: ApplicationIdHandler;
}

export function WarRoom({
  applications,
  kaptenSkills,
  now,
  onOpenDetail,
  onSimulateGhosting,
}: WarRoomProps) {
  // State lokal filter (hanya untuk tampilan, tidak perlu disimpan)
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [onlyGhosting, setOnlyGhosting] = useState(false);
  const [sortBy, setSortBy] = useState<PipelineSort>("newest");

  // ===== Derived state: semua dihitung ulang tiap render dari applications =====
  const ghostingCount = applications.filter((app) => isRawanGhosting(app, now)).length;
  const kw = keyword.trim().toLowerCase();

  // Filter gabungan (AND): teks + status + toggle Rawan Ghosting
  const filtered = applications.filter((app) => {
    const matchKeyword =
      kw === "" ||
      [app.company, app.role, app.cvVersion ?? ""].some((text) => text.toLowerCase().includes(kw));
    const matchStatus = statusFilter === "ALL" || app.status === statusFilter;
    const matchGhosting = !onlyGhosting || isRawanGhosting(app, now);
    return matchKeyword && matchStatus && matchGhosting;
  });
  const visible = sortApplications(filtered, sortBy);

  const resetFilters = () => {
    setKeyword("");
    setStatusFilter("ALL");
    setOnlyGhosting(false);
  };

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
      <div className="section-head">
        <h2>War Room Lamaran</h2>
        <span className="muted">
          Menampilkan {visible.length} dari {applications.length} lamaran
        </span>
      </div>

      <div className="row toolbar">
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Cari perusahaan, posisi, atau versi CV..."
          aria-label="Cari lamaran"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filter status"
        >
          <option value="ALL">Semua Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as PipelineSort)}
          aria-label="Urutkan"
        >
          <option value="newest">Terbaru</option>
          <option value="interview">Jadwal Interview Terdekat</option>
          <option value="offer">Offer Tertinggi</option>
        </select>
        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyGhosting}
            onChange={(e) => setOnlyGhosting(e.target.checked)}
          />
          Hanya Rawan Ghosting ({ghostingCount})
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <p className="muted">Tidak ada lamaran yang cocok dengan filter.</p>
          <button type="button" className="btn-secondary btn-sm" onClick={resetFilters}>
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid">
          {visible.map((app) => (
            <PipelineCard
              key={app.id}
              application={app}
              matchScore={getSkillMatch(kaptenSkills, app.requiredSkills).score}
              isGhosting={isRawanGhosting(app, now)}
              now={now}
              onOpenDetail={onOpenDetail}
              onSimulateGhosting={onSimulateGhosting}
            />
          ))}
        </div>
      )}
    </section>
  );
}
