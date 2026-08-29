import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useLang } from "./lang-context";

const copy = {
  tracks: "Learning Tracks",
  features: "Features",
  mentors: "Mentors",
  faq: "FAQ",
  login: "Sign In",
  register: "Get Started",
  categories: [
    "Web Development",
    "UI/UX Design",
    "Data Science",
    "Mobile Apps",
  ],
};

const ChevronDown = () => (
  <svg
    className="w-3.5 h-3.5 ml-1 inline-block transition-transform duration-200 group-hover:rotate-180"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Deteksi Scroll & Warna Section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Radar buat ngecek section apa yang lagi di bawah Navbar
      const sections = document.querySelectorAll("section");
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        // Kalau section lagi nyentuh area atas layar (di bawah navbar)
        if (rect.top <= 80 && rect.bottom >= 80) {
          const bg =
            sec.style.background ||
            window.getComputedStyle(sec).backgroundColor;
          // Cek kalau backgroundnya hitam (rgb(0, 0, 0) atau #000000)
          if (bg.includes("0, 0, 0") || bg.includes("#000000")) {
            setTheme("dark");
          } else {
            setTheme("light");
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Trigger pertama kali load
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Setel warna teks & background berdasarkan tema
  const isDark = theme === "dark";
  const textColor = isDark ? "#ffffff" : "#0b1215";
  const navBg = isDark
    ? scrolled
      ? "rgba(0, 0, 0, 0.9)"
      : "transparent"
    : scrolled
      ? "rgba(255, 255, 255, 0.9)"
      : "transparent";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled ? "h-16 py-0" : "h-20 py-2"
      }`}
      style={{
        background: navBg,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
          : "1px solid transparent",
      }}>
      <div className="mx-auto flex h-full max-w-6xl items-center px-6 lg:px-10">
        {/* KIRI - Logo otomatis ganti */}
        <div className="flex flex-1 justify-start">
          <Link to="/" className="flex items-center shrink-0">
            <img
              src={
                isDark
                  ? "/brand-pack/logo-h-light.svg"
                  : "/brand-pack/logo-h-dark.svg"
              }
              alt="Webtech Training Camp"
              className="h-8 md:h-9 w-auto transition-all duration-300 hover:scale-105"
              style={{ maxWidth: "180px" }}
            />
          </Link>
        </div>

        {/* TENGAH - Navigasi */}
        <nav className="hidden md:flex items-center justify-center gap-8 shrink-0">
          <div className="relative group cursor-pointer h-full flex items-center">
            <span
              className="text-[14px] font-bold flex items-center transition-colors duration-200"
              style={{ color: textColor }}>
              {copy.tracks} <ChevronDown />
            </span>
            {/* Dropdown Box tetap putih biar kebaca */}
            <div className="absolute top-[100%] left-1/2 -translate-x-1/2 mt-2 w-48 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
              <div className="bg-white rounded-xl p-2 shadow-xl border border-gray-100">
                {copy.categories.map((cat, idx) => (
                  <a
                    key={idx}
                    href={`#track-${idx}`}
                    className="block px-4 py-2.5 text-[13px] font-semibold text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                    {cat}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {[
            ["#features", copy.features],
            ["#mentors", copy.mentors],
            ["#faq", copy.faq],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-[14px] font-semibold opacity-70 transition-opacity duration-200 hover:opacity-100"
              style={{ color: textColor }}>
              {label}
            </a>
          ))}
        </nav>

        {/* KANAN */}
        <div className="flex flex-1 justify-end items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden sm:block text-[14px] font-bold opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: textColor }}>
              {copy.login}
            </Link>
            <Link
              to="/register"
              className="text-[14px] font-bold rounded-lg px-5 py-2.5 transition-transform hover:scale-105 active:scale-95"
              style={{ background: "#1c81ff", color: "#ffffff" }}>
              {copy.register}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
