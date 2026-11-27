import { useRef, useState } from "react";
import "./App.css";
import type { Application } from "./types/application";
import type { JobListing } from "./types/job";
import type { ApplicationUpdater } from "./types/handlers";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { createApplicationFromJob } from "./utils/createApplication";
import { isDuplicate } from "./utils/isDuplicate";
import { AppHeader } from "./components/AppHeader";
import type { TabId } from "./components/AppHeader";
import { Modal } from "./components/Modal";
import { SkillProfile } from "./components/SkillProfile";
import { JobExplorer } from "./components/JobExplorer";
import { ApplicationForm } from "./components/ApplicationForm";
import { WarRoom } from "./components/WarRoom";
import { ApplicationDetail } from "./components/ApplicationDetail";
import { OfferComparator } from "./components/OfferComparator";

const DEFAULT_SKILLS = ["React", "TypeScript", "CSS"];
const DAY_MS = 24 * 60 * 60 * 1000;

export default function App() {
  // ===== State utama (persist ke localStorage lewat custom hook) =====
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>("kaptenSkills", DEFAULT_SKILLS);
  const [applications, setApplications] = useLocalStorage<Application[]>("applications", []);

  // ===== State UI (tidak perlu disimpan) =====
  const [activeTab, setActiveTab] = useState<TabId>("explore");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Wadah form tambah lamaran (#tambah, desain Rifqi), tujuan tombol "+ Catat Lamaran"
  const formSectionRef = useRef<HTMLDivElement>(null);

  // ===== Derived state (dihitung tiap render, tidak disimpan di useState) =====
  // Yang disimpan hanya id-nya, objeknya selalu diambil dari data terbaru.
  // Jika lamaran terhapus, hasilnya null -> modal detail otomatis tertutup.
  const selectedApplication = applications.find((app) => app.id === selectedId) ?? null;
  const offers = applications.filter((app) => app.status === "OFFER");

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
    setApplications((prev) => prev.filter((app) => app.id !== id));
    // Tutup modal detail jika yang dihapus sedang dibuka
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  // Mundurkan lastUpdatedAt 15 hari (khusus APPLIED/SCREENING) untuk demo badge Rawan Ghosting
  const simulateGhosting = (id: string) => {
    updateApplication(id, (app) => {
      if (app.status !== "APPLIED" && app.status !== "SCREENING") return app;
      const mundur = new Date(new Date(app.lastUpdatedAt).getTime() - 15 * DAY_MS);
      return { ...app, lastUpdatedAt: mundur.toISOString() };
    });
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
        {/* Tahap 2: banner bentrok jadwal. Tahap 3: 5 kartu statistik. */}

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
            onOpenDetail={(id) => setSelectedId(id)}
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
    </>
  );
}
