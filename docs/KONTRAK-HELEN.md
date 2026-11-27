# Kontrak Komponen untuk Helen

Dari Sabil (pemegang `App.tsx`). Isinya: komponen yang kamu kerjakan, props yang dikirim App, dan aturan update state supaya bagian kita langsung nyambung saat merge.

## 0. Aturan main

- **Buat branch dari `sabil`, bukan dari `main`.** Placeholder, handler, dan helper di bawah hanya ada di `sabil`:
  ```bash
  git fetch origin
  git switch -c helen origin/sabil
  ```
- `App.tsx` hanya diubah Sabil. Kamu cukup mengisi komponen berbasis props di bawah ini.
- Placeholder yang tinggal kamu isi:
  - `src/components/ApplicationDetail.tsx`
  - `src/components/InterviewPrep.tsx`
  - `src/components/OfferComparator.tsx`

  Ganti isinya, tapi **nama export dan props jangan diubah** tanpa bilang Sabil. Kalau butuh props tambahan, kabari dulu.
- File milikmu: `src/utils/stateMachine.ts`, 3 komponen di atas, dan komponen kecil turunan kalau perlu (misal `Checklist.tsx`, `ActivityLogList.tsx`).
- Tipe data dari Rifqi ada di `src/types/application.ts` (jangan diubah). Tipe handler ada di `src/types/handlers.ts`.
- Styling: ikuti desain Rifqi, tanpa Tailwind / library baru.
  - Class Rifqi (`index.css`): `.panel`, `.card`, `.card-head`, `.row`, `.grid`, `.badge-green/yellow/red`, `.chip`, `.muted`, `.error-text`, `.error-box`, `.form`
  - Class Sabil (`App.css`): `.btn-secondary`, `.btn-danger`, `.btn-sm`, `.hint`, `.status-pill`, progress bar `.progress` + `.progress-fill` (lebar diatur `style={{ width: "75%" }}`)
  - Komponen `<StatusBadge status={app.status} />` untuk pill status.
  - Warna: pakai CSS variables yang sudah ada, jangan kode warna langsung. Variable Rifqi: `var(--primary)`, `var(--text)`, `var(--muted)`, `var(--border)`, `var(--success)`, `var(--danger)`, `var(--radius)`. Untuk latar kotak/kartu pakai `var(--card)` (milik Sabil), bukan `var(--white)`.
- Helper siap pakai (milik Sabil, boleh di-import):
  - `src/utils/format.ts`: `formatRupiah(4500000)` → `"Rp 4.500.000"`, `formatDateTime("2026-11-22T10:00")` → `"22 Nov 2026, 10.00"`
  - `src/utils/ghosting.ts`: `canBeGhosted(status)` untuk mengaktifkan/men-disable tombol Simulasi. Badge "Rawan Ghosting" sudah tampil di kartu War Room, jadi tidak wajib di detail. Hindari `Date.now()` langsung di render (oxlint memberi warning purity); kalau butuh waktu sekarang, minta Sabil mengoper prop `now`.
- Dilarang `any`. Sebelum push, wajib lolos:
  ```bash
  npx tsc --noEmit -p tsconfig.app.json
  npm run build
  npx oxlint
  ```
  (`npx tsc --noEmit` tanpa `-p` tidak memeriksa apa-apa karena `tsconfig.json` cuma berisi references.)

## 1. Tipe handler

```ts
// src/types/handlers.ts
export type ApplicationUpdater = (app: Application) => Application;
export type UpdateApplicationHandler = (id: string, updater: ApplicationUpdater) => void;
export type ApplicationIdHandler = (id: string) => void;
```

Di App, `updateApplication` isinya:

```ts
setApplications((prev) => prev.map((app) => (app.id === id ? updater(app) : app)));
```

Jadi `updater` kamu menerima lamaran **terbaru** dan wajib mengembalikan **objek baru**.

## 2. `ApplicationDetail` (Fitur 4 + wadah Fitur 5)

### Props

```ts
export interface ApplicationDetailProps {
  application: Application;                     // lamaran yang sedang dibuka
  kaptenSkills: string[];                       // untuk Skill Match %
  onUpdateApplication: UpdateApplicationHandler; // semua perubahan lamaran lewat sini
  onDeleteApplication: ApplicationIdHandler;     // tombol Hapus
  onSimulateGhosting: ApplicationIdHandler;      // tombol Simulasi +15 Hari
}
```

### Cara App merender (sudah dibuat Sabil)

```tsx
{selectedApplication && (
  <Modal label="..." onClose={() => setSelectedId(null)}>
    <ApplicationDetail key={selectedApplication.id} {...props} />
  </Modal>
)}
```

Artinya:

- Kotak modal, tombol ×, klik backdrop, dan tombol Escape sudah diurus App. Kamu **tidak perlu** `onClose`.
- Saat modal ditutup, `ApplicationDetail` dan `InterviewPrep` di dalamnya benar-benar **unmount**, jadi cleanup `useEffect` kamu pasti jalan (diuji di Testcase 9).
- Karena ada `key={id}`, membuka lamaran lain berarti komponen baru. State lokal (tab aktif, isi input transisi) otomatis reset.
- `application` selalu data terbaru dari App. Setelah `onUpdateApplication`, komponenmu otomatis re-render dengan data baru; tidak perlu menyalin `application` ke `useState`.

### Yang wajib ada di komponenmu

- Tombol **Hapus** memanggil `onDeleteApplication(application.id)`. App yang menutup modal dan menampilkan toast Undo 5 detik.
- Tombol **Simulasi +15 Hari** memanggil `onSimulateGhosting(application.id)`. Tombol selalu tampil, tapi **disabled** untuk status selain `APPLIED`/`SCREENING`, dengan keterangan singkat (contoh: "Simulasi hanya untuk status APPLIED/SCREENING."). Pakai `canBeGhosted(application.status)` dari `src/utils/ghosting.ts`. Jangan sampai tombol bisa diklik tapi tidak terjadi apa-apa. Lihat placeholder dan `PipelineCard.tsx` sebagai contoh.
- Skill Match: `getSkillMatch(kaptenSkills, application.requiredSkills)` dari `src/utils/skillMatch.ts`.
- Posisi tombol mengikuti placeholder (header kanan, sesuai wireframe).

### Aturan update (PENTING)

1. **Semua perubahan** lewat `onUpdateApplication(application.id, (app) => ({ ...app, ... }))`. Updater harus immutable: jangan `push`, jangan `app.status = ...`, jangan ubah `item.done` langsung.
2. **`lastUpdatedAt` hanya diubah saat status berubah** (`new Date().toISOString()`). Ini dasar badge Rawan Ghosting. Checklist dan catatan manual **tidak** boleh mengubah `lastUpdatedAt`; kalau ikut berubah, badge hasil "Simulasi +15 Hari" langsung hilang saat demo.
3. Setiap perpindahan status menambah 1 `ActivityLog`. Catatan manual juga disimpan sebagai `ActivityLog`. Log pembuatan lamaran sudah otomatis dari `createApplication` (Rifqi), jangan dibuat ulang.
4. Jangan hapus atau ubah `timestamp` log yang sudah ada. Sabil memakai timestamp paling awal di `activityLogs` untuk sort "Terbaru" di War Room. Urutan tampil log bebas (boleh dibalik saat render).

Contoh pindah status:

```ts
const now = new Date().toISOString();
onUpdateApplication(application.id, (app) => ({
  ...app,
  status: "INTERVIEW",
  interviewDateTime: jadwal, // "2026-11-30T10:00" dari <input type="datetime-local">
  lastUpdatedAt: now,
  activityLogs: [
    ...app.activityLogs,
    { id: crypto.randomUUID(), timestamp: now, message: `Pindah ke INTERVIEW (jadwal ${jadwal})` },
  ],
}));
```

Contoh centang checklist (nested immutable, tanpa ubah `lastUpdatedAt`):

```ts
onUpdateApplication(application.id, (app) => ({
  ...app,
  checklist: app.checklist.map((item) =>
    item.id === itemId ? { ...item, done: !item.done } : item
  ),
}));
```

### Field yang dibaca bagian Sabil (tolong jaga formatnya)

| Field | Dipakai Sabil untuk | Format |
|---|---|---|
| `status` | filter, statistik, ghosting, bentrok | `ApplicationStatus` |
| `interviewDateTime` | banner bentrok, sort "Jadwal Interview Terdekat", statistik Interview Rate | `YYYY-MM-DDTHH:mm` (value asli `<input type="datetime-local">`) |
| `salaryOffer` | sort "Offer Tertinggi" | `number` > 0, **bukan** string `"Rp ..."` |
| `lastUpdatedAt` | badge Rawan Ghosting | ISO string (`toISOString()`) |
| `cvVersion` | ditampilkan & dicari di War Room | `string` |
| `checklist` | progress X/Y di War Room | `ChecklistItem[]` |
| `activityLogs` | sort "Terbaru" (timestamp paling awal) | `ActivityLog[]` |

### State machine (acuan sementara)

Diagram State Machine **tidak ada** di PDF soal. Tabel ini disusun dari wireframe + testcase, tolong dikonfirmasi ke asisten. Kalau ternyata beda, cukup ubah `stateMachine.ts`.

| Dari | Boleh ke |
|---|---|
| WISHLIST | APPLIED |
| APPLIED | SCREENING, REJECTED, GHOSTED |
| SCREENING | INTERVIEW, REJECTED, GHOSTED |
| INTERVIEW | OFFER, REJECTED, GHOSTED |
| GHOSTED | SCREENING (satu-satunya jalan balik) |
| OFFER, REJECTED | — (final) |

Yang pasti dari soal: INTERVIEW punya tombol Offer/Rejected/Ghosted di wireframe, GHOSTED boleh balik ke SCREENING, OFFER dan REJECTED final, WISHLIST tidak boleh langsung ke OFFER.

Syarat pindah status:

- ke `APPLIED`: `cvVersion` dan `appliedDate` wajib diisi
- ke `INTERVIEW`: `interviewDateTime` wajib diisi
- ke `OFFER`: `salaryOffer > 0` dan `workMode` wajib diisi

## 3. `InterviewPrep` (Fitur 5)

- **Tidak menerima props dari App.** Kamu render sendiri di dalam `ApplicationDetail` (tab/bagian "Latihan Interview"). Kalau butuh props (misal `role` untuk soal yang relevan), tinggal tambah sendiri karena yang merender kamu juga.
- Wajib: minimal 5 soal, countdown 02:00 per soal, Start/Pause, Reset, Soal Berikutnya (reset ke 02:00), `useEffect` dengan `return () => clearInterval(id)`.
- `main.tsx` memakai `<StrictMode>`, jadi di mode dev effect dijalankan 2x. Kalau cleanup salah, timer langsung kelihatan 2x lebih cepat — bagus untuk cek sendiri.

## 4. `OfferComparator` (Fitur 7 bagian Offer)

### Props

```ts
export interface OfferComparatorProps {
  offers: Application[];  // semua lamaran berstatus OFFER (difilter App dari SELURUH data)
  kaptenSkills: string[]; // untuk Skill Match % tiap offer
}
```

App merender komponen ini di tab "Bandingkan Offer (N)".

### Ketentuan

- `offers.length < 2` → tampilkan pesan kosong yang jelas.
- Pilih Offer A dan B (misal default 2 offer pertama, cegah A === B). Simpan **id** terpilih di state lalu cari objeknya dari `offers`. Kalau offer terpilih dihapus atau tidak ketemu, kembali ke default.
- Rumus skor (sudah dicocokkan dengan angka di wireframe):
  - Gaji: `salaryOffer / max(salaryA, salaryB) * 100`, bobot 50%
  - Mode kerja: Remote 100, Hybrid 75, Onsite 50, bobot 25%
  - Skill: `getSkillMatch(kaptenSkills, offer.requiredSkills).score`, bobot 25%
- Cek dengan contoh wireframe:
  - Rp 6.000.000, Remote, 80% → 50 + 25 + 20 = **95,0**
  - Rp 4.500.000, Hybrid, 100% → 37,5 + 18,75 + 25 = **81,3**
- Badge "Rekomendasi Terbaik" di skor tertinggi (tentukan juga tampilan kalau skornya seri).
- Semua skor adalah **derived state** (dihitung saat render), jangan disimpan di `useState`.

## 5. Bonus Export/Import JSON (kalau sempat)

Butuh akses ke state di App, jadi kabari Sabil dulu. Nanti App menambah props, misalnya `applications`, `kaptenSkills`, dan `onImport(data)`.

## 6. Tips tes lokal

- Data lamaran tersimpan di localStorage key `applications`, skill di `kaptenSkills` (DevTools → Application → Local Storage).
- Selama state machine belum jadi, lamaran baru bisa dibuat dari tab Eksplorasi (Simpan ke Wishlist) atau form "Tambah Lamaran" (tombol "+ Catat Lamaran" di navbar).
