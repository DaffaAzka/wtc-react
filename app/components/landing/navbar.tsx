import { Link } from "react-router";
import { useEffect, useState } from "react";

const navLinks = [
  ["#tracks", "Learning Tracks"],
  ["#features", "Features"],
  ["#mentors", "Mentors"],
  ["#faq", "FAQ"],
] as [string, string][];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-300"
      style={{
        background: "#ffffff",
        borderBottom: scrolled ? "1px solid #e0e0e0" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/brand-pack/logo-h-light.svg"
            alt="WTC LMS"
            className="h-8 w-auto"
            style={{ maxWidth: "160px" }}
          />
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-[14px] font-semibold transition-opacity duration-150 hover:opacity-60"
              style={{ color: "#0b1215" }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:block text-[14px] font-semibold transition-opacity hover:opacity-60"
            style={{ color: "#0b1215" }}
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="text-[14px] font-bold rounded-[4px] px-4 py-[7px] transition-opacity hover:opacity-85"
            style={{ background: "#1c81ff", color: "#ffffff" }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
