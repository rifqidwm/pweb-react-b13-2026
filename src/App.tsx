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
    <main className="container">
      <h1>Aku Mw Magang</h1>

      <SkillProfile
        skills={kaptenSkills}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
      />

      <ApplicationForm
        applications={applications}
        onAddApplication={handleAddApplication}
      />

      <JobExplorer
        kaptenSkills={kaptenSkills}
        applications={applications}
        onSaveJob={handleSaveJob}
      />
    </main>
  );
}
