import { useState } from "react";
import type { FormEvent } from "react";
import type { Application, ApplicationStatus, WorkMode } from "../types/application";
import type { UpdateApplicationHandler } from "../types/handlers";
import {
  applyTransition,
  getTransitionErrors,
  parseRupiah,
  STATUS_TRANSITIONS,
} from "../utils/stateMachine";
import type { TransitionErrors } from "../utils/stateMachine";

interface StatusTransitionProps {
  application: Application;
  onUpdateApplication: UpdateApplicationHandler;
}

const STEPS: ApplicationStatus[] = ["WISHLIST", "APPLIED", "SCREENING", "INTERVIEW", "OFFER"];

// "INTERVIEW" -> "Interview"
const toLabel = (status: ApplicationStatus) => status.charAt(0) + status.slice(1).toLowerCase();

export function StatusTransition({ application, onUpdateApplication }: StatusTransitionProps) {
  // Derived state: opsi tujuan dan posisi stepper dihitung dari status saat ini
  const options = STATUS_TRANSITIONS[application.status];
  const currentStep = STEPS.indexOf(application.status);

  // Komponen ini direset lewat key={status}, jadi nilai awal selalu sesuai status terbaru
  const [target, setTarget] = useState<ApplicationStatus | null>(options[0] ?? null);
  const [cvVersion, setCvVersion] = useState(application.cvVersion ?? "");
  const [appliedDate, setAppliedDate] = useState(application.appliedDate ?? "");
  const [interviewDateTime, setInterviewDateTime] = useState(application.interviewDateTime ?? "");
  const [salaryText, setSalaryText] = useState(application.salaryOffer?.toString() ?? "");
  const [workMode, setWorkMode] = useState<WorkMode>(application.workMode);
  const [errors, setErrors] = useState<TransitionErrors>({});

  const chooseTarget = (status: ApplicationStatus) => {
    setTarget(status);
    setErrors({});
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!target) return;

    const input = {
      cvVersion,
      appliedDate,
      interviewDateTime,
      salaryOffer: parseRupiah(salaryText),
      workMode,
    };
    const newErrors = getTransitionErrors(application.status, target, input);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const now = new Date();
    onUpdateApplication(application.id, (app) => applyTransition(app, target, input, now));
  };

  return (
    <section className="hd-section">
      <h3>Tahap Seleksi</h3>

      <ol className="hd-stepper">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className={
              index === currentStep
                ? "hd-step hd-step-current"
                : index < currentStep
                  ? "hd-step hd-step-done"
                  : "hd-step"
            }
          >
            {index + 1}. {toLabel(step)}
          </li>
        ))}
      </ol>

      {options.length === 0 ? (
        <p className="muted">Status {toLabel(application.status)} bersifat final.</p>
      ) : (
        <form onSubmit={handleSubmit} className="hd-box" noValidate>
          <div className="hd-options">
            <span className="hd-options-label">Pindahkan status ke:</span>
            {options.map((status) => (
              <button
                key={status}
                type="button"
                className={target === status ? "btn-sm" : "btn-secondary btn-sm"}
                aria-pressed={target === status}
                onClick={() => chooseTarget(status)}
              >
                {toLabel(status)}
              </button>
            ))}
          </div>

          {target && (
            <div className="hd-fields">
              {target === "APPLIED" && (
                <>
                  <label>
                    Versi CV
                    <input
                      value={cvVersion}
                      maxLength={100}
                      onChange={(e) => setCvVersion(e.target.value)}
                      placeholder="CV_v3_Frontend"
                    />
                    {errors.cvVersion && <span className="error-text">{errors.cvVersion}</span>}
                  </label>
                  <label>
                    Tanggal Melamar
                    <input
                      type="date"
                      value={appliedDate}
                      onChange={(e) => setAppliedDate(e.target.value)}
                    />
                    {errors.appliedDate && <span className="error-text">{errors.appliedDate}</span>}
                  </label>
                </>
              )}

              {target === "INTERVIEW" && (
                <label>
                  Jadwal Interview
                  <input
                    type="datetime-local"
                    value={interviewDateTime}
                    onChange={(e) => setInterviewDateTime(e.target.value)}
                  />
                  {errors.interviewDateTime && (
                    <span className="error-text">{errors.interviewDateTime}</span>
                  )}
                </label>
              )}

              {target === "OFFER" && (
                <>
                  <label>
                    Gaji / Uang Saku (Rp)
                    <input
                      inputMode="numeric"
                      value={salaryText}
                      maxLength={20}
                      onChange={(e) => setSalaryText(e.target.value)}
                      placeholder="Rp 5.500.000"
                    />
                    {errors.salaryOffer && <span className="error-text">{errors.salaryOffer}</span>}
                  </label>
                  <label>
                    Mode Kerja
                    <select value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)}>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                    {errors.workMode && <span className="error-text">{errors.workMode}</span>}
                  </label>
                </>
              )}

              <button type="submit" className="hd-submit">
                Konfirmasi
              </button>

              {STATUS_TRANSITIONS[target].length === 0 && (
                <p className="hint hd-note">
                  Status {toLabel(target)} bersifat final dan tidak bisa diubah lagi.
                </p>
              )}
              {errors.status && <p className="error-text hd-note">{errors.status}</p>}
            </div>
          )}
        </form>
      )}
    </section>
  );
}
