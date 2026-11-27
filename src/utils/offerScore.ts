import type { Application, WorkMode } from "../types/application";
import { getSkillMatch } from "./skillMatch";

const MODE_SCORE: Record<WorkMode, number> = { Remote: 100, Hybrid: 75, Onsite: 50 };

export interface OfferScore {
  salary: number;
  modeScore: number;
  skillScore: number;
  matchedCount: number;
  requiredCount: number;
  salaryPoints: number; // maks 50
  modePoints: number; // maks 25
  skillPoints: number; // maks 25
  total: number; // maks 100
}

// Normalisasi gaji = gaji / gaji tertinggi dari dua offer yang dibandingkan * 100
export function getOfferScore(
  app: Application,
  maxSalary: number,
  kaptenSkills: string[]
): OfferScore {
  const salary = app.salaryOffer ?? 0;
  const match = getSkillMatch(kaptenSkills, app.requiredSkills);
  const modeScore = MODE_SCORE[app.workMode];

  const salaryPoints = (maxSalary > 0 ? (salary / maxSalary) * 100 : 0) * 0.5;
  const modePoints = modeScore * 0.25;
  const skillPoints = match.score * 0.25;

  return {
    salary,
    modeScore,
    skillScore: match.score,
    matchedCount: match.matched.length,
    requiredCount: app.requiredSkills.length,
    salaryPoints,
    modePoints,
    skillPoints,
    total: salaryPoints + modePoints + skillPoints,
  };
}
