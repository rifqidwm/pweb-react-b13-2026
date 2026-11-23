import { useState } from "react";
import type { Application } from "./types/application";
import type { JobListing } from "./types/job";
import { SkillProfile } from "./components/SkillProfile";
import { JobExplorer } from "./components/JobExplorer";
import { ApplicationForm } from "./components/ApplicationForm";
import { createApplicationFromJob } from "./utils/createApplication";

export default function App() {
  // TODO (Sabil): ganti kedua useState ini dengan useLocalStorage<T>
  // const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>("kaptenSkills", [...]);
  // const [applications, setApplications] = useLocalStorage<Application[]>("applications", []);
  const [kaptenSkills, setKaptenSkills] = useState<string[]>(["React", "TypeScript", "CSS"]);
  const [applications, setApplications] = useState<Application[]>([]);

  const handleAddSkill = (skill: string) => {
    setKaptenSkills([...kaptenSkills, skill]);
  };

  const handleRemoveSkill = (skill: string) => {
    setKaptenSkills(kaptenSkills.filter((s) => s !== skill));
  };

  const handleAddApplication = (app: Application) => {
    setApplications([...applications, app]);
  };

  const handleSaveJob = (job: JobListing) => {
    handleAddApplication(createApplicationFromJob(job));
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <a href="#" className="logo">
            Aku Mw <span>Magang</span>
          </a>
          <nav className="nav-links">
            <a href="#profil">Profil Skill</a>
            <a href="#lowongan">Lowongan</a>
            <a href="#tambah">Tambah Lamaran</a>
          </nav>
        </div>
      </header>

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
        <div className="two-col">
          <div id="profil">
            <SkillProfile
              skills={kaptenSkills}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
            />
          </div>

          <div id="tambah">
            <ApplicationForm
              applications={applications}
              onAddApplication={handleAddApplication}
            />
          </div>
        </div>

        <div id="lowongan">
          <JobExplorer
            kaptenSkills={kaptenSkills}
            applications={applications}
            onSaveJob={handleSaveJob}
          />
        </div>
      </main>
    </>
  );
}
