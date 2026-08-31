import { Link } from "react-router";
import { useInView } from "./use-in-view";

const copy = {
  learn: "Learn",
  learnLinks: [
    { label: "Learning Tracks", to: "/student/classes" },
    { label: "Courses", to: "/courses" },
    { label: "Projects", to: "/projects" },
  ],
  company: "Company",
  companyLinks: [
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
  ],
  copyright: "© 2026 Webtech Training Camp. All rights reserved.",
};

export function Footer() {
  const { ref, inView } = useInView();

  return (
    <footer
      ref={ref}
      className="relative w-full pt-16 pb-8 px-6 sm:px-10 lg:px-20 overflow-hidden"
      style={{ background: "#000000" }}>
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-10">
          {/* Brand & Social */}
          <div
            className={`col-span-1 md:col-span-2 transition-all duration-700 ease-out ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
            <Link to="/" className="flex items-center gap-2 mb-5 inline-block">
              <img
                src="/brand-pack/logo-h-light.svg"
                alt="WTC LMS"
                className="h-28 md:h-32 lg:h-38 w-auto transition-all duration-300 hover:scale-105"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  const fallback = el.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = "block";
                }}
              />
              <span className="text-xl font-black hidden text-white tracking-tighter">
                WebTech<span className="text-blue-500">Camp</span>
              </span>
            </Link>

            <p
              className="text-[14px] leading-relaxed mb-6 max-w-[320px]"
              style={{ color: "#757575" }}>
              A project-based technology learning platform with real industry
              mentorship.
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {[
                {
                  label: "GitHub",
                  href: "https://github.com",
                  path: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
                },
                {
                  label: "Instagram",
                  href: "https://instagram.com",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                },
                {
                  label: "LinkedIn",
                  href: "https://linkedin.com",
                  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "#1a1a1a" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "#2a2a2a")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "#1a1a1a")
                  }>
                  <svg
                    className="h-4 w-4 transition-colors duration-300"
                    fill="#a1a1aa"
                    viewBox="0 0 24 24">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Learn links */}
          <div
            className={`transition-all duration-700 delay-100 ease-out ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
            <h4
              className="text-[12px] font-bold uppercase tracking-[0.1em] mb-5"
              style={{ color: "#ffffff" }}>
              {copy.learn}
            </h4>
            <ul className="flex flex-col gap-3">
              {copy.learnLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[14px] font-medium transition-colors duration-200 hover:text-white"
                    style={{ color: "#888888" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div
            className={`transition-all duration-700 delay-200 ease-out ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
            <h4
              className="text-[12px] font-bold uppercase tracking-[0.1em] mb-5"
              style={{ color: "#ffffff" }}>
              {copy.company}
            </h4>
            <ul className="flex flex-col gap-3">
              {copy.companyLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[14px] font-medium transition-colors duration-200 hover:text-white"
                    style={{ color: "#888888" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div
          className={`mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-1000 delay-300 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ borderTop: "1px solid #1a1a1a" }}>
          <p className="text-[13px] font-medium" style={{ color: "#555555" }}>
            {copy.copyright}
          </p>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-[13px]" style={{ color: "#555555" }}>
              Built with
            </span>
            <span style={{ color: "#1c81ff" }}>♥</span>
            <span className="text-[13px]" style={{ color: "#555555" }}>
              in Indonesia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
