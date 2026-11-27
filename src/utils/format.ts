const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

// 4500000 -> "Rp 4.500.000"
export function formatRupiah(value: number): string {
  return rupiahFormatter.format(value);
}

// "2026-11-22T10:00" (atau timestamp ms) -> "22 Nov 2026, 10.00"
export function formatDateTime(value: string | number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
