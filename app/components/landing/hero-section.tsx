import { Link } from "react-router";
import { useEffect, useState } from "react";
import { teamPhotos } from "@/components/custom/team-photos";
import { useLang } from "./lang-context";

const copy = {
  id: {
    headline1: "Kuasai Rekayasa",
    headline2: "Perangkat Lunak.",
    headline3: "Bangun Masa Depanmu.",
    sub: "Pelajari teknologi modern lewat proyek nyata, bimbingan mentor berpengalaman, dan kurikulum siap industri.",
    cta: "Mulai Belajar Gratis",
    ctaSecondary: "Masuk",
    ratingLabel: "Penilaian alumni",
    students: "peserta aktif",
  },
  en: {
    headline1: "Master Software",
    headline2: "Engineering.",
    headline3: "Build Your Future.",
    sub: "Learn modern tech through real-world projects, experienced mentorship, and an industry-ready curriculum.",
    cta: "Start Learning Free",
    ctaSecondary: "Sign In",
    ratingLabel: "Alumni rating",
    students: "active learners",
  },
};

const StarIcon = () => (
  <svg className="h-4 w-4" fill="#f6b60b" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Ornamen Gradasi ala Skillshare (Kiri layang di belakang teks)
const ColorfulSquiggle = () => (
  <svg
    className="absolute -left-10 lg:-left-20 top-0 h-[120%] w-[250px] lg:w-[350px] pointer-events-none z-0 opacity-90"
    viewBox="0 0 300 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M250 50 L80 200 L280 380 L20 580"
      stroke="url(#skillshare-gradient)"
      strokeWidth="32"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="skillshare-gradient"
        x1="0"
        y1="0"
        x2="300"
        y2="600"
        gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00d27f" /> {/* Hijau */}
        <stop offset="35%" stopColor="#00b4ff" /> {/* Biru Muda */}
        <stop offset="70%" stopColor="#8c32ff" /> {/* Ungu */}
        <stop offset="100%" stopColor="#ff007b" /> {/* Pink/Magenta */}
      </linearGradient>
    </defs>
  </svg>
);

// Icon SVG Profesional buat Floating Tags
const Icons = {
  Web: () => (
    <svg
      className="w-5 h-5 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  ),
  Design: () => (
    <svg
      className="w-5 h-5 text-pink-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  ),
  React: () => (
    <svg className="w-5 h-5 text-[#61DAFB]" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)" />
      </g>
    </svg>
  ),
  Backend: () => (
    <svg
      className="w-5 h-5 text-gray-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Database: () => (
    <svg
      className="w-5 h-5 text-indigo-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  ),
};

// Data untuk tag melayang
const floatingTags = [
  {
    label: "Web Development",
    top: "10%",
    left: "10%",
    delay: "0s",
    icon: <Icons.Web />,
  },
  {
    label: "UI/UX Design",
    top: "25%",
    right: "5%",
    delay: "1.5s",
    icon: <Icons.Design />,
  },
  {
    label: "React & Next.js",
    top: "45%",
    left: "5%",
    delay: "0.5s",
    icon: <Icons.React />,
  },
  {
    label: "Backend API",
    top: "60%",
    right: "10%",
    delay: "2s",
    icon: <Icons.Backend />,
  },
  {
    label: "Database",
    top: "80%",
    left: "20%",
    delay: "1s",
    icon: <Icons.Database />,
  },
];

export function HeroSection() {
  const { lang } = useLang();
  const t = copy[lang];
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section
      className="relative flex flex-col lg:flex-row items-center justify-between min-h-[90vh] pt-24 pb-16 px-6 sm:px-10 lg:px-20 overflow-hidden"
      style={{ background: "#ffffff" }}>
      {/* Animasi Floating */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* Ornamen Garis Gradasi Kiri */}
      <ColorfulSquiggle />

      {/* LEFT — Typography Raksasa */}
      <div
        className={`w-full lg:w-[55%] flex flex-col justify-center relative z-10 transition-all duration-700 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
        <div className="max-w-[620px] pl-0 lg:pl-10">
          {/* LOGO LEBIH JELAS */}
          <div className="mb-10">
            <img
              src="/brand-pack/logo-h-dark.svg"
              alt="Webtech Training Camp"
              className="h-12 w-auto drop-shadow-sm" /* Ukuran logo digedein jadi h-12 (sekitar 48px) */
              style={{ maxWidth: "260px" }}
              onError={(e) => {
                // Fallback text kalau logo SVG lu gagal muat / path salah
                e.currentTarget.style.display = "none";
                e.currentTarget.nextSibling.style.display = "block";
              }}
            />
            {/* Fallback kalau logo error */}
            <span
              style={{ display: "none" }}
              className="text-2xl font-black text-blue-600 tracking-tighter">
              WebTech<span className="text-gray-900">Camp</span>
            </span>
          </div>

          {/* HEADLINE: Font digedein parah (font-black, max 64px) & lebih rapat */}
          <h1
            className="font-black mb-6"
            style={{
              color: "#0b1215",
              fontSize: "clamp(48px, 6vw, 68px)",
              lineHeight: "1.02",
              letterSpacing: "-0.03em",
            }}>
            {t.headline1}
            <br />
            {t.headline2}
            <br />
            {t.headline3}
          </h1>

          <p
            className="mb-10 text-[18px] lg:text-[20px] leading-[1.6]"
            style={{ color: "#757575", maxWidth: "500px" }}>
            {t.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-10">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-[6px] px-8 py-3.5 text-[16px] font-bold transition-transform hover:scale-[1.02]"
              style={{ background: "#1c81ff", color: "#ffffff" }}>
              {t.cta}
              <svg
                className="h-4 w-4"
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
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-[6px] border-[1.5px] px-8 py-3.5 text-[16px] font-bold transition-colors hover:bg-gray-50"
              style={{ borderColor: "#d1d5db", color: "#0b1215" }}>
              {t.ctaSecondary}
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {teamPhotos.slice(0, 4).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover border-[3px]"
                  style={{ borderColor: "#ffffff" }}
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
                <span
                  className="text-[14px] font-bold ml-1.5"
                  style={{ color: "#0b1215" }}>
                  4.9
                </span>
              </div>
              <span
                className="text-[13px] font-medium"
                style={{ color: "#757575" }}>
                500+ {t.students}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Floating Tags dengan Logo Asli */}
      <div
        className={`w-full lg:w-[45%] h-[450px] lg:h-[650px] mt-16 lg:mt-0 relative flex items-center justify-center transition-all duration-1000 delay-300 z-10 ${loaded ? "opacity-100" : "opacity-0"}`}>
        {/* Subtle Dotted Background (Garis titik-titik persis di gambar) */}
        <div
          className="absolute inset-0 z-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#9ca3af 1.5px, transparent 1.5px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Glow effect di tengah biar nggak pucat */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-50 rounded-full blur-3xl pointer-events-none" />

        {/* Render Floating Tags */}
        <div className="relative w-full h-full z-10 max-w-lg">
          {floatingTags.map((tag, i) => (
            <div
              key={i}
              className="absolute animate-float flex items-center gap-3 px-5 py-3 rounded-full bg-white hover:scale-105 transition-transform duration-300 cursor-default"
              style={{
                top: tag.top,
                left: tag.left,
                right: tag.right,
                animationDelay: tag.delay,
                boxShadow: "0 12px 36px -12px rgba(0, 0, 0, 0.12)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}>
              {/* Tempat Render Icon Asli */}
              <div className="flex items-center justify-center p-1 rounded-full bg-gray-50/50">
                {tag.icon}
              </div>
              <span
                className="text-[14px] font-bold"
                style={{ color: "#0b1215" }}>
                {tag.label}
              </span>
            </div>
          ))}

          {/* Dots melayang sbg hiasan ekstra */}
          <div
            className="absolute top-[35%] right-[25%] w-2.5 h-2.5 rounded-full animate-float"
            style={{ background: "#1c81ff", animationDelay: "0.8s" }}
          />
          <div
            className="absolute bottom-[30%] left-[15%] w-2 h-2 rounded-full animate-float"
            style={{ background: "#f6b60b", animationDelay: "1.2s" }}
          />
        </div>
      </div>
    </section>
  );
}
