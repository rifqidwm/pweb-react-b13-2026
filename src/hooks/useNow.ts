import { useEffect, useState } from "react";

// Waktu sekarang (ms) yang diperbarui berkala + fungsi untuk memperbaruinya saat itu juga.
// Dipakai untuk derived state berbasis waktu (Rawan Ghosting) supaya render tetap murni:
// tidak memanggil Date.now() langsung di tengah render.
export function useNow(intervalMs: number): [number, () => void] {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    // Cleanup: hentikan interval saat komponen unmount
    return () => clearInterval(id);
  }, [intervalMs]);

  // Dipanggil dari event handler saat data berubah, supaya `now` tidak lebih lama
  // dari data terbaru (misal lamaran yang baru dibuat lalu langsung disimulasikan)
  const refreshNow = () => setNow(Date.now());

  return [now, refreshNow];
}
