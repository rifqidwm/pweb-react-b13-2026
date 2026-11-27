import { useEffect, useState } from "react";

interface UndoToastProps {
  company: string;
  role: string;
  durationMs: number;
  onUndo: () => void;
}

// Hitung mundur di sini HANYA untuk tampilan "Undo (4d)".
// Timer yang benar-benar membuat penghapusan permanen ada di App (disimpan di useRef).
// App memberi key = id lamaran, jadi hapus lamaran lain = toast baru, hitungan mulai lagi dari 5.
export function UndoToast({ company, role, durationMs, onUndo }: UndoToastProps) {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(durationMs / 1000));

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="toast" role="status">
      <span>
        Lamaran <b>{company}</b> ({role}) telah dihapus.
      </span>
      <button type="button" className="toast-undo" onClick={onUndo}>
        Undo ({secondsLeft}d)
      </button>
    </div>
  );
}
