import { useRef, useState, useEffect } from "react";
// Import icon dari Lucide
import { PlayCircle, Code2, Briefcase } from "lucide-react";

// Hapus multi-bahasa, murni English sesuai request
const copy = {
  tag: "Learning Experience",
  heading1: "Not just watching.",
  heading2: "Learning that actually",
  heading3: "levels you up.",
  cards: [
    {
      step: "01",
      title: "Structured Video Content",
      desc: "Every track is broken into short, dense modules. Watch anywhere, anytime — no time limit.",
      icon: PlayCircle, // Icon buat video
    },
    {
      step: "02",
      title: "Challenges & Evaluation",
      desc: "Every module comes with quizzes and coding challenges. Answer, submit, and get instant system feedback.",
      icon: Code2, // Icon buat coding/kuis
    },
    {
      step: "03",
      title: "Projects & Portfolio",
      desc: "Work on real-case assignments. Upload your results and get direct review from a mentor.",
      icon: Briefcase, // Icon buat proyek/portofolio
    },
  ],
};

export function ExperienceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Efek Scroll Reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="experience"
      ref={ref}
      className="min-h-screen flex flex-col justify-center w-full pt-20 pb-16 px-6 lg:px-20"
      style={{ background: "#000000" }}>
      <div className="mx-auto w-full max-w-6xl">
        {/* Header (Animasi Muncul Duluan) */}
        <div
          className={`mb-16 transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
          <p
            className="text-[13px] font-bold uppercase tracking-[0.15em] mb-4"
            style={{ color: "#1c81ff" }}>
            {copy.tag}
          </p>
          <h2
            className="font-extrabold m-0"
            style={{
              color: "#ffffff",
              fontSize: "clamp(40px, 5vw, 56px)", // Samain kayak Stats Section
              lineHeight: "1.05",
              letterSpacing: "-0.02em",
            }}>
            {copy.heading1}
            <br />
            {copy.heading2}
            <br />
            <span style={{ color: "#1c81ff" }}>{copy.heading3}</span>{" "}
            {/* Kasih aksen biru di teks terakhir */}
          </h2>
        </div>

        {/* 3-Column Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {copy.cards.map((card, i) => {
            const Icon = card.icon;
            return (
              /* Wrapper Animasi (Staggered per 150ms) */
              <div
                key={i}
                className="transition-all duration-700 ease-out"
                style={{
                  transitionDelay: `${i * 150}ms`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                }}>
                {/* Main Card */}
                <div
                  className="relative flex flex-col h-full rounded-2xl p-8 group transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                  style={{
                    background: "#1a1a1a", // Warna card dark-mode modern
                    border: "1px solid #2a2a2a",
                  }}>
                  {/* Angka Raksasa Watermark di Belakang */}
                  <span
                    className="absolute -bottom-4 -right-4 font-black transition-transform duration-500 group-hover:scale-110"
                    style={{
                      fontSize: "120px",
                      color: "#222222", // Warna abu-abu pudar
                      lineHeight: "1",
                      zIndex: 0,
                    }}>
                    {card.step}
                  </span>

                  {/* Konten Card (Di atas watermark) */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header Card: Icon + Step Number */}
                    <div className="flex items-center justify-between mb-8">
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-full transition-transform duration-300 group-hover:scale-110"
                        style={{ background: "rgba(28, 129, 255, 0.1)" }} // Background biru transparan
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: "#1c81ff" }}
                        />
                      </div>
                      <span
                        className="text-[13px] font-bold uppercase tracking-widest"
                        style={{ color: "#1c81ff" }}>
                        STEP {card.step}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-[22px] font-bold mb-4 leading-snug"
                      style={{ color: "#ffffff" }}>
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-[15px] leading-relaxed mt-auto"
                      style={{ color: "#888888" }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
