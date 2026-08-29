import { useState, useEffect } from "react";
import { teamPhotos } from "@/components/custom/team-photos";
import { useInView } from "./use-in-view";

const copy = {
  tag: "About Us",
  heading1: "Empowering the",
  heading2: "next generation",
  heading3: "of tech talents.",
  sub: "Webtech Training Camp (WTC) is more than just a coding bootcamp. We are a community of passionate developers, industry experts, and lifelong learners dedicated to bridging the gap between education and real-world industry demands. Join us and build the future together.",
};

export function AboutSection() {
  const { ref, inView } = useInView();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Efek Auto-Slide untuk Foto
  useEffect(() => {
    // Foto ganti setiap 4 detik
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teamPhotos.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section
      id="about"
      ref={ref}
      className="relative flex flex-col justify-center min-h-screen pt-20 px-6 sm:px-10 lg:px-20 overflow-hidden"
      style={{ background: "#000000" }}>
      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* KIRI: Teks & Deskripsi */}
        <div
          className={`transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
          }`}>
          <p
            className="text-[13px] font-bold uppercase tracking-[0.15em] mb-6"
            style={{ color: "#1c81ff" }}>
            {copy.tag}
          </p>

          <h2
            className="font-extrabold m-0 mb-6"
            style={{
              color: "#ffffff",
              fontSize: "clamp(40px, 5vw, 56px)", // Konsisten raksasa
              lineHeight: "1.05",
              letterSpacing: "-0.02em",
            }}>
            {copy.heading1}
            <br />
            <span style={{ color: "#1c81ff" }}>{copy.heading2}</span>
            <br />
            {copy.heading3}
          </h2>

          <p
            className="text-[16px] lg:text-[18px] leading-relaxed max-w-[480px]"
            style={{ color: "#888888" }}>
            {copy.sub}
          </p>

          {/* Opsional: Tombol kecil buat interaksi */}
          <div className="mt-8">
            <a
              href="#tracks"
              className="inline-flex items-center gap-2 text-[15px] font-bold transition-all hover:gap-3"
              style={{ color: "#ffffff" }}>
              Explore our community
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* KANAN: Slideshow Foto (Crossfade) */}
        <div
          className={`relative w-full transition-all duration-1000 ease-out delay-200 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}>
          {/* Frame Foto */}
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              aspectRatio: "4/3",
              border: "1px solid #2a2a2a",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}>
            {/* Map semua foto, pake opacity buat efek transisi fade-in/fade-out */}
            {teamPhotos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`WTC Community ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                style={{
                  opacity: i === currentSlide ? 1 : 0,
                  transform: i === currentSlide ? "scale(1)" : "scale(1.05)", // Efek zoom halus
                  transition: "opacity 1s ease-in-out, transform 3s ease-out",
                }}
              />
            ))}

            {/* Gradient tipis di bawah buat background dots indikator */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
              }}
            />

            {/* Indikator Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {teamPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === currentSlide ? "24px" : "8px",
                    background:
                      i === currentSlide ? "#1c81ff" : "rgba(255,255,255,0.3)",
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Aksen grafis kecil (Kotak dekorasi melayang di belakang) */}
          <div
            className="absolute -bottom-6 -left-6 w-32 h-32 rounded-xl -z-10 opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, #1c81ff 0%, transparent 70%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
