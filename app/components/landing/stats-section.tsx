import { useInView, fadeUpStyle, staggerDelay } from "./use-in-view";
import { CheckCircle2, Star } from "lucide-react";

// Karena lu bilang cuma mau bahasa Inggris, gw hapus multi-bahasanya
const copy = {
  heading1: "Creative",
  heading2: "Learning",
  heading3: "Made Easy",
  features: [
    "Structured module-by-module video content.",
    "Comprehension tests with immediate feedback.",
    "Healthy competition with a gamified points system.",
    "Coding assignments based on real industry tasks.",
  ],
  stats: [
    { value: "500+", label: "MEMBERS" },
    { value: "20+", label: "CLASSES" },
    { value: "10+", label: "MENTORS" },
    { value: "4.9", label: "APP STORE RATING", hasStars: true }, // Flag khusus buat render bintang
  ],
};

export function StatsSection() {
  const { ref, inView } = useInView();

  return (
    <section
      id="features"
      ref={ref}
      className="min-h-screen flex flex-col justify-center w-full pt-20 pb-16 px-6 lg:px-20"
      style={{ background: "#000000" }}>
      {/* 1. TOP PART: Heading (Kiri) & Checklists (Kanan) */}
      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-24">
        {/* Kiri: Heading Besar */}
        <div className="lg:col-span-5">
          <h2
            className="font-extrabold m-0"
            style={{
              color: "#ffffff",
              fontSize: "clamp(40px, 5vw, 56px)",
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
            }}>
            {copy.heading1}
            <br />
            {copy.heading2}
            <br />
            {copy.heading3}
          </h2>
        </div>

        {/* Kanan: Checklist ala Skillshare */}
        <div className="lg:col-span-7 flex flex-col gap-6 lg:pl-10">
          {copy.features.map((featureText, i) => (
            <div
              key={i}
              className="flex items-center gap-4 transition-all duration-700"
              style={{
                transitionDelay: `${i * 150}ms`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateX(0)" : "translateX(20px)",
              }}>
              {/* Check Icon dari Lucide (Warna cyan/biru terang kayak referensi) */}
              <CheckCircle2
                className="w-7 h-7 shrink-0"
                style={{ color: "#00d2ff" }} // Warna biru cyan skillshare
                strokeWidth={2.5}
              />
              <p className="text-white text-[18px] lg:text-[22px] font-bold leading-snug m-0">
                {featureText}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. BOTTOM PART: Stats Cards */}
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {copy.stats.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-[12px] py-8 px-4 transition-all duration-500 hover:-translate-y-1.5"
              style={{
                background: "#1a1a1a", // Abu-abu gelap ala card skillshare
                border: "1px solid #2a2a2a",
                transitionDelay: `${i * 100}ms`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
              }}>
              {/* Value / Angka Gede */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="font-extrabold"
                  style={{
                    color: "#ffffff",
                    fontSize: "clamp(32px, 3.5vw, 42px)",
                    lineHeight: "1",
                  }}>
                  {s.value}
                </span>

                {/* Render 5 Bintang kalau stat ini punya flag hasStars */}
                {s.hasStars && (
                  <div className="flex items-center gap-0.5 ml-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-4 h-4"
                        fill="#ffffff"
                        color="#ffffff"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-[12px] lg:text-[13px] font-bold tracking-widest text-gray-300">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
