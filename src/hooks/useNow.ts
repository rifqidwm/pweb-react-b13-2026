import { useEffect, useState } from "react";

// Waktu sekarang (ms) yang diperbarui berkala.
// Dipakai untuk derived state berbasis waktu (Rawan Ghosting) supaya render tetap murni:
// tidak memanggil Date.now() langsung di tengah render.
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    // Cleanup: hentikan interval saat komponen unmount
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
