import type { Application } from "../types/application";

// KONTRAK props Sabil <-> Helen. Lihat docs/KONTRAK-HELEN.md
export interface OfferComparatorProps {
  offers: Application[]; // semua lamaran berstatus OFFER (difilter App dari seluruh data)
  kaptenSkills: string[]; // untuk Skill Match % tiap offer
}

// PLACEHOLDER: isi komponen ini dikerjakan Helen (Fitur 7 bagian Offer Comparator).
// Nama export & props jangan diubah tanpa diskusi dengan Sabil.
export function OfferComparator({ offers }: OfferComparatorProps) {
  return (
    <section className="panel">
      <h2>Bandingkan Offer Magang</h2>
      {offers.length < 2 ? (
        <p className="muted">
          Butuh minimal 2 lamaran berstatus OFFER untuk dibandingkan (saat ini {offers.length}).
        </p>
      ) : (
        <p className="placeholder-note">
          Placeholder Helen: {offers.length} offer siap dibandingkan (pilih Offer A/B, skor
          berbobot, badge "Rekomendasi Terbaik").
        </p>
      )}
    </section>
  );
}
