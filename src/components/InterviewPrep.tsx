import { useEffect, useState } from "react";

const QUESTION_SECONDS = 120;

const QUESTIONS = [
  "Ceritakan tentang dirimu dan alasan ingin magang di bidang IT.",
  "Apa perbedaan props dan state di React? Kapan state perlu diangkat ke parent?",
  "Jelaskan apa yang terjadi sejak URL diketik di browser sampai halaman tampil.",
  "Apa fungsi cleanup pada useEffect? Berikan contoh bug jika cleanup dilupakan.",
  "Apa perbedaan autentikasi dan otorisasi? Bagaimana mencegah IDOR pada REST API?",
  "Bagaimana mencegah SQL Injection dan XSS pada aplikasi web?",
  "Ceritakan bug tersulit yang pernah kamu selesaikan dan cara kamu mencarinya.",
];

// 120 -> "02:00"
function formatCountdown(totalSeconds: number): string {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Tidak menerima props. Ikut unmount saat modal detail ditutup.
export function InterviewPrep() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  // Waktu selesai (ms). null berarti timer sedang berhenti
  const [deadline, setDeadline] = useState<number | null>(null);
  const isRunning = deadline !== null;

  useEffect(() => {
    if (deadline === null) return;

    // Sisa waktu dihitung dari jam asli, jadi tidak melambat saat tab di background
    const intervalId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setDeadline(null);
    }, 250);

    // Cleanup: saat jeda, reset, ganti soal, atau modal ditutup (unmount)
    return () => clearInterval(intervalId);
  }, [deadline]);

  const handleStartPause = () => {
    if (deadline === null) {
      setDeadline(Date.now() + secondsLeft * 1000);
    } else {
      setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
      setDeadline(null);
    }
  };

  const handleReset = () => {
    setDeadline(null);
    setSecondsLeft(QUESTION_SECONDS);
  };

  const handleNext = () => {
    setQuestionIndex((index) => (index + 1) % QUESTIONS.length);
    handleReset();
  };

  return (
    <section className="hd-section hd-prep">
      <div className="section-head">
        <h3>Latihan Interview</h3>
        <span className="muted hd-mono">
          Soal {questionIndex + 1} / {QUESTIONS.length}
        </span>
      </div>

      <p className="hd-question">&ldquo;{QUESTIONS[questionIndex]}&rdquo;</p>

      <div className="hd-timer-row">
        <p className="hd-timer" role="timer">
          {formatCountdown(secondsLeft)}
        </p>
        <div className="hd-timer-buttons">
          <button
            type="button"
            className="btn-sm"
            disabled={secondsLeft === 0}
            onClick={handleStartPause}
          >
            {isRunning ? "Jeda" : "Mulai"}
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={handleReset}>
            Reset
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm"
            title="Soal berikutnya"
            onClick={handleNext}
          >
            Lanjut
          </button>
        </div>
      </div>
      {secondsLeft === 0 && <p className="error-text">Waktu habis.</p>}
    </section>
  );
}
