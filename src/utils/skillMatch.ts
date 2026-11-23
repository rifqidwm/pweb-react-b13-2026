export interface SkillMatchResult {
  score: number;
  matched: string[];
  missing: string[];
}

// Rumus: Math.round((jumlahCocok / totalRequired) * 100), case-insensitive
export function getSkillMatch(
  kaptenSkills: string[],
  requiredSkills: string[]
): SkillMatchResult {
  const owned = kaptenSkills.map((skill) => skill.toLowerCase());

  const matched = requiredSkills.filter((skill) =>
    owned.includes(skill.toLowerCase())
  );
  const missing = requiredSkills.filter(
    (skill) => !owned.includes(skill.toLowerCase())
  );

  const score =
    requiredSkills.length === 0
      ? 0
      : Math.round((matched.length / requiredSkills.length) * 100);

  return { score, matched, missing };
}

// Hijau >= 70, kuning 40-69, merah < 40
export function getMatchColor(score: number): "green" | "yellow" | "red" {
  if (score >= 70) return "green";
  if (score >= 40) return "yellow";
  return "red";
}
