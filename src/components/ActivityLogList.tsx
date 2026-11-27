import { useState } from "react";
import type { FormEvent } from "react";
import type { Application } from "../types/application";
import type { UpdateApplicationHandler } from "../types/handlers";
import { formatDateTime } from "../utils/format";

interface ActivityLogListProps {
  application: Application;
  onUpdateApplication: UpdateApplicationHandler;
}

export function ActivityLogList({ application, onUpdateApplication }: ActivityLogListProps) {
  const [note, setNote] = useState("");

  // Salinan dibalik untuk tampilan; array asli di state tidak dimutasi
  const logs = [...application.activityLogs].reverse();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = note.trim();
    if (clean === "") return;

    const log = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message: `Catatan: ${clean}`,
    };
    onUpdateApplication(application.id, (app) => ({
      ...app,
      activityLogs: [...app.activityLogs, log],
    }));
    setNote("");
  };

  return (
    <section className="hd-section">
      <h3>Riwayat Aktivitas</h3>

      {logs.length === 0 ? (
        <p className="muted">Belum ada aktivitas.</p>
      ) : (
        <ul className="hd-timeline">
          {logs.map((log) => (
            <li key={log.id}>
              <time dateTime={log.timestamp}>{formatDateTime(log.timestamp)}</time>
              <span>{log.message}</span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="hd-inline">
        <input
          value={note}
          maxLength={500}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tambah catatan manual..."
          aria-label="Catatan baru"
        />
        <button type="submit">Catat</button>
      </form>
    </section>
  );
}
