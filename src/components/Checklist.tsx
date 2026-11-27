import { useState } from "react";
import type { FormEvent } from "react";
import type { Application } from "../types/application";
import type { UpdateApplicationHandler } from "../types/handlers";

interface ChecklistProps {
  application: Application;
  onUpdateApplication: UpdateApplicationHandler;
}

// Semua updater immutable dan SENGAJA tidak mengubah lastUpdatedAt
export function Checklist({ application, onUpdateApplication }: ChecklistProps) {
  const [text, setText] = useState("");

  // Derived state: progress dihitung dari data, tidak disimpan di useState
  const total = application.checklist.length;
  const done = application.checklist.filter((item) => item.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (clean === "") return;

    const item = { id: crypto.randomUUID(), text: clean, done: false };
    onUpdateApplication(application.id, (app) => ({
      ...app,
      checklist: [...app.checklist, item],
    }));
    setText("");
  };

  const handleToggle = (itemId: string) => {
    onUpdateApplication(application.id, (app) => ({
      ...app,
      checklist: app.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const handleRemove = (itemId: string) => {
    onUpdateApplication(application.id, (app) => ({
      ...app,
      checklist: app.checklist.filter((item) => item.id !== itemId),
    }));
  };

  return (
    <section className="hd-section">
      <div className="section-head">
        <h3>Daftar Persiapan</h3>
        <strong className="hd-count">
          {done} / {total} selesai
        </strong>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-label="Progress checklist"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      {total === 0 && <p className="muted">Belum ada tugas persiapan.</p>}

      <ul className="hd-checklist">
        {application.checklist.map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={item.done} onChange={() => handleToggle(item.id)} />
              <span className={item.done ? "hd-done" : undefined}>{item.text}</span>
            </label>
            <button
              type="button"
              className="hd-remove"
              aria-label={`Hapus tugas ${item.text}`}
              onClick={() => handleRemove(item.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="hd-inline">
        <input
          value={text}
          maxLength={200}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tambah tugas persiapan baru..."
          aria-label="Tugas persiapan baru"
        />
        <button type="submit">Tambah</button>
      </form>
    </section>
  );
}
