import { useRef, useState } from "react";
import type { Application, WorkMode } from "../types/application";
import { isDuplicate } from "../utils/isDuplicate";
import { createApplication } from "../utils/createApplication";

interface ApplicationFormProps {
  applications: Application[];
  onAddApplication: (app: Application) => void;
}

type InitialStatus = "WISHLIST" | "APPLIED";
type FieldName = "company" | "role" | "requiredSkills" | "cvVersion" | "appliedDate";
type FormErrors = Partial<Record<FieldName, string>>;

// Urutan field dipakai untuk menentukan input error pertama
const FIELD_ORDER: FieldName[] = ["company", "role", "requiredSkills", "cvVersion", "appliedDate"];

export function ApplicationForm({ applications, onAddApplication }: ApplicationFormProps) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("Remote");
  const [status, setStatus] = useState<InitialStatus>("WISHLIST");
  const [skillsText, setSkillsText] = useState("");
  const [cvVersion, setCvVersion] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const companyRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const refs: Record<FieldName, React.RefObject<HTMLInputElement | null>> = {
    company: companyRef,
    role: roleRef,
    requiredSkills: skillsRef,
    cvVersion: cvRef,
    appliedDate: dateRef,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requiredSkills = skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    const newErrors: FormErrors = {};
    if (company.trim() === "") newErrors.company = "Perusahaan wajib diisi";
    if (role.trim() === "") newErrors.role = "Posisi/Role wajib diisi";
    if (requiredSkills.length === 0) newErrors.requiredSkills = "Minimal 1 skill";
    if (status === "APPLIED") {
      if (cvVersion.trim() === "") newErrors.cvVersion = "Versi CV wajib diisi";
      if (appliedDate === "") newErrors.appliedDate = "Tanggal melamar wajib diisi";
    }
    if (!newErrors.company && !newErrors.role && isDuplicate(applications, company, role)) {
      newErrors.company = "Lamaran dengan perusahaan + role ini sudah ada";
    }

    setErrors(newErrors);

    // Gagal submit: fokuskan kursor ke input pertama yang error
    const firstError = FIELD_ORDER.find((field) => newErrors[field]);
    if (firstError) {
      refs[firstError].current?.focus();
      return;
    }

    onAddApplication(
      createApplication({
        company,
        role,
        workMode,
        status,
        requiredSkills,
        cvVersion: status === "APPLIED" ? cvVersion.trim() : undefined,
        appliedDate: status === "APPLIED" ? appliedDate : undefined,
      })
    );

    setCompany("");
    setRole("");
    setWorkMode("Remote");
    setStatus("WISHLIST");
    setSkillsText("");
    setCvVersion("");
    setAppliedDate("");
  };

  return (
    <section className="panel">
      <h2>Tambah Lamaran Manual</h2>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Perusahaan
          <input ref={companyRef} value={company} onChange={(e) => setCompany(e.target.value)} />
          {errors.company && <span className="error-text">{errors.company}</span>}
        </label>

        <label>
          Posisi/Role
          <input ref={roleRef} value={role} onChange={(e) => setRole(e.target.value)} />
          {errors.role && <span className="error-text">{errors.role}</span>}
        </label>

        <label>
          Mode Kerja
          <select value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)}>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </label>

        <label>
          Status Awal
          <select value={status} onChange={(e) => setStatus(e.target.value as InitialStatus)}>
            <option value="WISHLIST">WISHLIST</option>
            <option value="APPLIED">APPLIED</option>
          </select>
        </label>

        <label>
          Required Skills (pisahkan dengan koma)
          <input
            ref={skillsRef}
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="React, TypeScript, CSS"
          />
          {errors.requiredSkills && <span className="error-text">{errors.requiredSkills}</span>}
        </label>

        {status === "APPLIED" && (
          <>
            <label>
              Versi CV
              <input
                ref={cvRef}
                value={cvVersion}
                onChange={(e) => setCvVersion(e.target.value)}
                placeholder="CV_v3_Frontend"
              />
              {errors.cvVersion && <span className="error-text">{errors.cvVersion}</span>}
            </label>

            <label>
              Tanggal Melamar
              <input
                ref={dateRef}
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
              />
              {errors.appliedDate && <span className="error-text">{errors.appliedDate}</span>}
            </label>
          </>
        )}

        <button type="submit">Simpan Lamaran</button>
      </form>
    </section>
  );
}
