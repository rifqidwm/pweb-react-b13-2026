import type { DashboardStats } from "../utils/stats";

interface StatsCardsProps {
  stats: DashboardStats;
}

interface StatCard {
  label: string;
  value: string;
  note: string;
  tone?: "danger" | "success";
}

// Urutan & isi mengikuti wireframe. Semua angka berasal dari computeStats (derived state).
export function StatsCards({ stats }: StatsCardsProps) {
  const cards: StatCard[] = [
    {
      label: "Total Lamaran",
      value: String(stats.total),
      note: `${stats.active} aktif di pipeline`,
    },
    {
      label: "Response Rate",
      value: `${stats.responseRate}%`,
      note: `${stats.responded} dari ${stats.total} diproses`,
    },
    {
      label: "Interview Rate",
      value: `${stats.interviewRate}%`,
      note: `${stats.interviewed} masuk wawancara`,
    },
    {
      label: "Rawan Ghosting",
      value: String(stats.rawanGhosting),
      note: "> 14 hari tanpa kabar",
      tone: stats.rawanGhosting > 0 ? "danger" : undefined,
    },
    {
      label: "Offer Diterima",
      value: String(stats.offers),
      note: stats.offers >= 2 ? "Siap dibandingkan" : "Minimal 2 untuk dibandingkan",
      tone: stats.offers > 0 ? "success" : undefined,
    },
  ];

  return (
    <section className="stats-grid" aria-label="Statistik lamaran">
      {cards.map((card) => (
        <div key={card.label} className="panel stat-card">
          <span className="stat-label">{card.label}</span>
          <strong className={card.tone ? `stat-value stat-${card.tone}` : "stat-value"}>
            {card.value}
          </strong>
          <span className="stat-note">{card.note}</span>
        </div>
      ))}
    </section>
  );
}
