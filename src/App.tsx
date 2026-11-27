import { useEffect, useRef, useState } from "react";
import "./App.css";
import type { Application } from "./types/application";
import type { JobListing } from "./types/job";
import type { ApplicationUpdater } from "./types/handlers";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useNow } from "./hooks/useNow";
import { createApplicationFromJob } from "./utils/createApplication";
import { isDuplicate } from "./utils/isDuplicate";
import { canBeGhosted, shiftDaysBack, SIMULATE_DAYS } from "./utils/ghosting";
import { findInterviewConflicts } from "./utils/interviewConflict";
import { computeStats } from "./utils/stats";
import { AppHeader } from "./components/AppHeader";
import { ConflictBanner } from "./components/ConflictBanner";
import { StatsCards } from "./components/StatsCards";
import { UndoToast } from "./components/UndoToast";
import type { TabId } from "./components/AppHeader";
import { Modal } from "./components/Modal";
import { SkillProfile } from "./components/SkillProfile";
import { JobExplorer } from "./components/JobExplorer";
import { ApplicationForm } from "./components/ApplicationForm";
import { WarRoom } from "./components/WarRoom";
import { ApplicationDetail } from "./components/ApplicationDetail";
import { OfferComparator } from "./components/OfferComparator";

const DEFAULT_SKILLS = ["React", "TypeScript", "CSS"];
const UNDO_DURATION_MS = 5000;

// Lamaran yang baru dihapus dan masih bisa di-Undo
interface PendingDelete {
  application: Application; // objek utuh, termasuk checklist & activityLogs
  index: number; // posisi semula di array applications
}

export default function App() {
  // ===== State utama (persist ke localStorage lewat custom hook) =====
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>("kaptenSkills", DEFAULT_SKILLS);
  const [applications, setApplications] = useLocalStorage<Application[]>("applications", []);

  // ===== State UI (tidak perlu disimpan) =====
  const [activeTab, setActiveTab] = useState<TabId>("explore");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Wadah form tambah lamaran (#tambah, desain Rifqi), tujuan tombol "+ Catat Lamaran"
  const formSectionRef = useRef<HTMLDivElement>(null);

  // Jam yang di-update tiap 1 menit, dasar hitung Rawan Ghosting
  const now = useNow(60_000);

  // ===== Undo hapus =====
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  // ID setTimeout disimpan di useRef: mengubahnya tidak memicu render ulang,
  // dan nilainya tetap ada antar-render sehingga bisa di-clearTimeout kapan saja.
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup saat App unmount: jangan tinggalkan timer undo yang masih berjalan
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current !== null) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  // ===== Derived state (dihitung tiap render, tidak disimpan di useState) =====
  // Yang disimpan hanya id-nya, objeknya selalu diambil dari data terbaru.
  // Jika lamaran terhapus, hasilnya null -> modal detail otomatis tertutup.
  const selectedApplication = applications.find((app) => app.id === selectedId) ?? null;
  const offers = applications.filter((app) => app.status === "OFFER");
  // Bentrok dicek dari SELURUH applications, bukan hasil filter War Room
  const interviewConflicts = findInterviewConflicts(applications);
  // 5 kartu statistik, dihitung langsung dari applications + now
  const stats = computeStats(applications, now);

  // ===== Handler skill Kapten =====
  const handleAddSkill = (skill: string) => {
    setKaptenSkills((prev) => [...prev, skill]);
  };

  const handleRemoveSkill = (skill: string) => {
    setKaptenSkills((prev) => prev.filter((s) => s !== skill));
  };

  // ===== Handler lamaran (dioper ke komponen lain lewat props) =====
  const addApplication = (app: Application) => {
    // Pengaman terakhir anti-duplikat, dicek terhadap state paling baru (prev)
    setApplications((prev) => (isDuplicate(prev, app.company, app.role) ? prev : [...prev, app]));
  };

  // updater wajib mengembalikan objek baru (immutable).
  // Sengaja TIDAK mengubah lastUpdatedAt: itu hanya berubah saat lamaran dibuat / status berubah.
  const updateApplication = (id: string, updater: ApplicationUpdater) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? updater(app) : app)));
  };

  const deleteApplication = (id: string) => {
    // Simpan salinan utuh + posisinya SEBELUM dihapus, supaya Undo bisa mengembalikannya.
    // Dibaca dari state render ini (bukan di dalam updater) karena updater harus murni.
    const index = applications.findIndex((app) => app.id === id);
    if (index === -1) return;
    const deleted = applications[index];

    setApplications((prev) => prev.filter((app) => app.id !== id));
    // Tutup modal detail jika yang dihapus sedang dibuka
    setSelectedId((prev) => (prev === id ? null : prev));

    // Hapus 2x berturut-turut (< 5 detik): timer lama dibersihkan,
    // lamaran pertama jadi terhapus permanen, toast diganti dengan yang baru.
    if (undoTimeoutRef.current !== null) clearTimeout(undoTimeoutRef.current);
    setPendingDelete({ application: deleted, index });
    undoTimeoutRef.current = setTimeout(() => {
      setPendingDelete(null);
      undoTimeoutRef.current = null;
    }, UNDO_DURATION_MS);
  };

  const undoDelete = () => {
    if (pendingDelete === null) return;
    const { application, index } = pendingDelete;

    if (undoTimeoutRef.current !== null) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    // Sisipkan kembali di index semula (slice aman walau index > panjang array).
    // Pengaman: jangan kembalikan jika company + role yang sama sudah dibuat lagi.
    setApplications((prev) =>
      isDuplicate(prev, application.company, application.role)
        ? prev
        : [...prev.slice(0, index), application, ...prev.slice(index)]
    );
    setPendingDelete(null);
  };

  // Mundurkan lastUpdatedAt 15 hari untuk demo badge Rawan Ghosting.
  // Tombolnya sudah disabled untuk status lain; guard ini hanya pengaman terakhir.
  const simulateGhosting = (id: string) => {
    updateApplication(id, (app) =>
      canBeGhosted(app.status)
        ? { ...app, lastUpdatedAt: shiftDaysBack(app.lastUpdatedAt, SIMULATE_DAYS) }
        : app
    );
  };

  const handleSaveJob = (job: JobListing) => {
    addApplication(createApplicationFromJob(job));
  };

  // Tombol "+ Catat Lamaran": buka tab Eksplorasi lalu arahkan ke form tambah lamaran
  const goToApplicationForm = () => {
    setActiveTab("explore");
    // Tunggu 1 frame supaya tab Eksplorasi sudah tampil, baru scroll & fokus ke input pertama
    requestAnimationFrame(() => {
      const section = formSectionRef.current;
      if (!section) return;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      section.querySelector("input")?.focus({ preventScroll: true });
    });
  };

  return (
    <>
      <AppHeader
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        applicationCount={applications.length}
        offerCount={offers.length}
        onAddApplicationClick={goToApplicationForm}
      />

      {/* Hero desain Rifqi */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge">MAGANG 2026</span>
          <h1>
            Kelola Lamaran <span>Magangmu</span> di Satu Tempat
          </h1>
          <p>Cari lowongan, cek kecocokan skill, dan pantau semua lamaran Kapten sampai dapat offer.</p>
        </div>
      </section>

      <main className="container">
        {/* Banner tampil di semua tab, tidak terpengaruh filter */}
        {interviewConflicts.length > 0 && <ConflictBanner conflicts={interviewConflicts} />}

        <StatsCards stats={stats} />

        {/* Tab Eksplorasi (layout Rifqi) hanya disembunyikan, bukan unmount, supaya data lowongan,
            kata kunci, filter, dan isi form tidak hilang + tidak fetch ulang tiap ganti tab */}
        <div hidden={activeTab !== "explore"}>
          <div className="two-col">
            <div id="profil">
              <SkillProfile
                skills={kaptenSkills}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
              />
            </div>

            <div id="tambah" ref={formSectionRef} className="scroll-target">
              <ApplicationForm applications={applications} onAddApplication={addApplication} />
            </div>
          </div>

          <div id="lowongan">
            <JobExplorer
              kaptenSkills={kaptenSkills}
              applications={applications}
              onSaveJob={handleSaveJob}
            />
          </div>
        </div>

        {activeTab === "pipeline" && (
          <WarRoom
            applications={applications}
            kaptenSkills={kaptenSkills}
            now={now}
            onOpenDetail={(id) => setSelectedId(id)}
            onSimulateGhosting={simulateGhosting}
            onDeleteApplication={deleteApplication}
          />
        )}

        {activeTab === "offers" && <OfferComparator offers={offers} kaptenSkills={kaptenSkills} />}
      </main>

      {/* Render bersyarat: saat ditutup, ApplicationDetail benar-benar unmount
          (cleanup timer interview milik Helen ikut jalan) */}
      {selectedApplication && (
        <Modal
          label={`Detail lamaran ${selectedApplication.company}`}
          onClose={() => setSelectedId(null)}
        >
          <ApplicationDetail
            key={selectedApplication.id}
            application={selectedApplication}
            kaptenSkills={kaptenSkills}
            onUpdateApplication={updateApplication}
            onDeleteApplication={deleteApplication}
            onSimulateGhosting={simulateGhosting}
          />
        </Modal>
      )}

      {/* key = id lamaran: hapus lamaran lain -> toast baru, hitung mundur mulai dari 5 lagi */}
      {pendingDelete && (
        <UndoToast
          key={pendingDelete.application.id}
          company={pendingDelete.application.company}
          role={pendingDelete.application.role}
          durationMs={UNDO_DURATION_MS}
          onUndo={undoDelete}
        />
      )}
    </>
  );
}
