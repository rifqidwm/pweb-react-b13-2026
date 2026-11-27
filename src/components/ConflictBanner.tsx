import type { InterviewConflict } from "../utils/interviewConflict";
import { CONFLICT_WINDOW_MINUTES } from "../utils/interviewConflict";
import { formatDateTime } from "../utils/format";

interface ConflictBannerProps {
  conflicts: InterviewConflict[];
}

// Dirender App di atas semua tab. Data bentrok dihitung dari SELURUH lamaran,
// jadi banner tetap muncul walaupun filter War Room sedang aktif.
export function ConflictBanner({ conflicts }: ConflictBannerProps) {
  return (
    <div className="banner-conflict" role="alert">
      <strong>⚠ Jadwal Interview Bentrok</strong>
      <ul>
        {conflicts.map(({ first, second, firstTime, secondTime, diffMinutes }) => (
          <li key={`${first.id}-${second.id}`}>
            <b>{first.company}</b> · {first.role} ({formatDateTime(firstTime)}) dan{" "}
            <b>{second.company}</b> · {second.role} ({formatDateTime(secondTime)}) berselisih{" "}
            {diffMinutes} menit (kurang dari {CONFLICT_WINDOW_MINUTES} menit).
          </li>
        ))}
      </ul>
    </div>
  );
}
