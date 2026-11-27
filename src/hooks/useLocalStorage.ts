import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

// Sama seperti useState, tapi nilainya disimpan di localStorage
// sehingga tidak hilang saat halaman di-refresh (F5).
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  // Lazy initializer: localStorage hanya dibaca sekali saat render pertama
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return initialValue;
      const parsed: unknown = JSON.parse(saved);
      return parsed as T;
    } catch {
      // Data rusak / bukan JSON valid -> pakai nilai awal
      return initialValue;
    }
  });

  // Setiap kali value berubah, tulis ulang ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage penuh / diblokir browser: aplikasi tetap jalan tanpa persistensi
    }
  }, [key, value]);

  return [value, setValue];
}
