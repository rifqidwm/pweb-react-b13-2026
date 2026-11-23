import { useState } from "react";

interface SkillProfileProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export function SkillProfile({ skills, onAddSkill, onRemoveSkill }: SkillProfileProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skill = text.trim();

    if (skill === "") {
      setError("Skill tidak boleh kosong");
      return;
    }

    const sudahAda = skills.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (sudahAda) {
      setError(`Skill "${skill}" sudah ada`);
      return;
    }

    onAddSkill(skill);
    setText("");
    setError(null);
  };

  return (
    <section className="panel">
      <h2>Profil Skill Kapten</h2>

      <form onSubmit={handleSubmit} className="row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tambah skill, misal Docker"
        />
        <button type="submit">Tambah</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      {skills.length > 0 ? (
        <ul className="chip-list">
          {skills.map((skill) => (
            <li key={skill} className="chip">
              {skill}
              <button
                type="button"
                className="chip-remove"
                onClick={() => onRemoveSkill(skill)}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Belum ada skill.</p>
      )}
    </section>
  );
}
