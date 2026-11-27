import type { Application } from "./application";

// Tipe handler dari App.tsx yang dioper ke komponen lewat props.
// Dipakai bersama oleh komponen Sabil dan Helen supaya signature-nya seragam.

// Fungsi murni: terima lamaran lama, kembalikan objek lamaran BARU (immutable)
export type ApplicationUpdater = (app: Application) => Application;

export type UpdateApplicationHandler = (
  id: string,
  updater: ApplicationUpdater
) => void;

export type ApplicationIdHandler = (id: string) => void;
