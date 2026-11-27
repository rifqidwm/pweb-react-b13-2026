import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  label: string; // dibacakan screen reader (aria-label)
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ label, onClose, children }: ModalProps) {
  // Tombol Escape menutup modal. Listener dilepas lagi saat modal unmount.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      // Hanya klik tepat di backdrop yang menutup modal (bukan klik di dalam kotak modal)
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={label}>
        <div className="modal-topbar">
          <button type="button" className="modal-close" aria-label="Tutup" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
