import { useEffect, useState } from "react";
import type { StreakResult } from "@/utils/streak";

interface StreakModalProps {
  result: StreakResult | null;
  onClose: () => void;
}

export function StreakModal({ result, onClose }: StreakModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (result) {
      // tiny delay so the zoom-in animation plays on mount
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [result]);

  if (!result) return null;

  const { currentStreak, isNewUser } = result;

  const headline =
    isNewUser
      ? "Streak Dimulai!"
      : currentStreak === 1
        ? "Streak Dimulai Lagi!"
        : `${currentStreak} Hari Runtun!`;

  const sub =
    isNewUser
      ? "Selamat datang di WTC! Perjalanan belajarmu dimulai hari ini."
      : currentStreak === 1
        ? "Jangan putus lagi ya! Konsistensi adalah kuncinya. 💪"
        : `Luar biasa! Kamu sudah belajar ${currentStreak} hari berturut-turut.`;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className={`relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0b1215] p-8 text-center shadow-2xl transition-all duration-300 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring behind emoji */}
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
          {/* outer glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(246,182,11,0.35) 0%, rgba(246,182,11,0.12) 50%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
          {/* inner ring */}
          <div className="absolute inset-4 rounded-full bg-[#f6b60b]/10 ring-2 ring-[#f6b60b]/30" />
          {/* emoji */}
          <span
            className="relative z-10 select-none"
            style={{ fontSize: "56px", lineHeight: 1 }}
            role="img"
            aria-label="Fire"
          >
            🔥
          </span>
        </div>

        {/* Streak number */}
        <p
          className="font-extrabold text-white"
          style={{
            fontSize: "clamp(36px, 8vw, 52px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {headline}
        </p>

        {/* Sub-text */}
        <p className="mt-3 text-[15px] leading-relaxed text-gray-400">
          {sub}
        </p>

        {/* Streak badge */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f6b60b]/10 px-4 py-1.5 ring-1 ring-[#f6b60b]/30">
          <span style={{ fontSize: "16px" }}>🔥</span>
          <span className="text-[13px] font-bold text-[#f6b60b]">
            {currentStreak} day streak
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="mt-7 w-full rounded-xl py-3.5 text-[15px] font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          style={{
            background: "linear-gradient(135deg, #1c81ff 0%, #2548d8 100%)",
            boxShadow: "0 8px 24px rgba(28,129,255,0.35)",
          }}
        >
          Lanjutkan Belajar
        </button>
      </div>
    </div>
  );
}
