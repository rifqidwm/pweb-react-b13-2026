import { useState } from "react";
import type { Application } from "../types/application";
import { formatRupiah } from "../utils/format";
import { getOfferScore } from "../utils/offerScore";
import type { OfferScore } from "../utils/offerScore";
import "./OfferComparator.css";

// KONTRAK props Sabil <-> Helen. Lihat docs/KONTRAK-HELEN.md
export interface OfferComparatorProps {
  offers: Application[]; // semua lamaran berstatus OFFER (difilter App dari seluruh data)
  kaptenSkills: string[]; // untuk Skill Match % tiap offer
}

// PLACEHOLDER: isi komponen ini dikerjakan Helen (Fitur 7 bagian Offer Comparator).
// Nama export & props jangan diubah tanpa diskusi dengan Sabil.
export function OfferComparator({ offers, kaptenSkills }: OfferComparatorProps) {
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  if (offers.length < 2) {
    return (
      <section className="panel">
        <h2>Bandingkan Offer Magang</h2>
        <p className="muted">
          Butuh minimal 2 lamaran berstatus OFFER untuk dibandingkan (saat ini {offers.length}).
        </p>
      </section>
    );
  }

  // Derived state: kalau pilihan lama sudah dihapus, otomatis kembali ke default
  const offerA = offers.find((o) => o.id === idA) ?? offers.find((o) => o.id !== idB) ?? offers[0];
  const offerB =
    offers.find((o) => o.id === idB && o.id !== offerA.id) ??
    offers.find((o) => o.id !== offerA.id) ??
    offers[1];

  const maxSalary = Math.max(offerA.salaryOffer ?? 0, offerB.salaryOffer ?? 0);
  const scoreA = getOfferScore(offerA, maxSalary, kaptenSkills);
  const scoreB = getOfferScore(offerB, maxSalary, kaptenSkills);

  // Dibandingkan pada 1 desimal, sama dengan angka yang tampil
  const diff = Math.round(scoreA.total * 10) - Math.round(scoreB.total * 10);

  const renderSelect = (
    label: string,
    value: string,
    otherId: string,
    onChange: (id: string) => void
  ) => (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {offers.map((offer) => (
        // Opsi yang sudah dipakai di sisi lain di-disable (cegah A === B)
        <option key={offer.id} value={offer.id} disabled={offer.id === otherId}>
          {/* Role hanya ditampilkan bila ada 2 offer dari perusahaan yang sama */}
          {offers.some((o) => o.id !== offer.id && o.company === offer.company)
            ? `${label}: ${offer.company} - ${offer.role}`
            : `${label}: ${offer.company}`}
        </option>
      ))}
    </select>
  );

  const renderCard = (offer: Application, score: OfferScore, isBest: boolean) => (
    <article className={isBest ? "card oc-best" : "card"}>
      <div className="card-head">
        <div>
          <h3>{offer.company}</h3>
          <p className="muted">{offer.role}</p>
        </div>
        {isBest && <span className="badge oc-badge">Rekomendasi Terbaik</span>}
      </div>

      <table className="oc-table">
        <tbody>
          <tr>
            <th scope="row">Gaji</th>
            <td>{formatRupiah(score.salary)}</td>
            <td>{score.salaryPoints.toFixed(1)} / 50</td>
          </tr>
          <tr>
            <th scope="row">Mode Kerja</th>
            <td>
              {offer.workMode} ({score.modeScore})
            </td>
            <td>{score.modePoints.toFixed(1)} / 25</td>
          </tr>
          <tr>
            <th scope="row">Skill Match</th>
            <td>
              {score.skillScore}% ({score.matchedCount} dari {score.requiredCount})
            </td>
            <td>{score.skillPoints.toFixed(1)} / 25</td>
          </tr>
        </tbody>
      </table>

      <p className="oc-total">
        Total skor berbobot <strong>{score.total.toFixed(1)}</strong>
      </p>
    </article>
  );

  return (
    <section className="panel">
      <div className="oc-head">
        <div>
          <h2>Bandingkan Offer Magang</h2>
          <p className="muted">Bobot: Gaji 50% • Mode Kerja 25% • Skill Match 25%</p>
        </div>
        <div className="oc-selects">
          {renderSelect("Offer A", offerA.id, offerB.id, (id) => {
            setIdA(id);
            setIdB(offerB.id);
          })}
          <span className="muted">vs</span>
          {renderSelect("Offer B", offerB.id, offerA.id, (id) => {
            setIdA(offerA.id);
            setIdB(id);
          })}
        </div>
      </div>

      {diff === 0 && <p className="muted">Skor kedua offer seri.</p>}

      <div className="oc-grid">
        {renderCard(offerA, scoreA, diff > 0)}
        {renderCard(offerB, scoreB, diff < 0)}
      </div>
    </section>
  );
}
