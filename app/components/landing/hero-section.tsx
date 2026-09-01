import { Link } from "react-router";
import { useEffect, useState } from "react";
import { teamPhotos } from "@/components/custom/team-photos";
import {
  SiHtml5,
  SiFigma,
  SiReact,
  SiNodedotjs,
  SiPostgresql,
} from "react-icons/si";
import { HeroSquiggle } from "./hero-squiggle";

const copy = {
  headline1: "Master Software",
  headline2: "Engineering.",
  headline3: "Build Your Future.",
  sub: "Learn modern tech through real-world projects, experienced mentorship, and an industry-ready curriculum.",
  cta: "Start Learning",
  ctaSecondary: "Sign In",
  students: "active learners",
};

const StarIcon = () => (
  <svg className="h-4 w-4" fill="#f6b60b" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const floatingTagsData = [
  {
    label: "Web Development",
    icon: SiHtml5,
    iconColor: "#e34c26",
    top: "10%",
    left: "10%",
    delay: "0s",
    solidColor: "#1c81ff",
  },
  {
    label: "UI/UX Design",
    icon: SiFigma,
    iconColor: "#a259ff",
    top: "25%",
    right: "5%",
    delay: "1.5s",
    solidColor: "#ff007b",
  },
  {
    label: "React & Next.js",
    icon: SiReact,
    iconColor: "#61dafb",
    top: "45%",
    left: "5%",
    delay: "0.5s",
    solidColor: "#00b4ff",
  },
  {
    label: "Backend API",
    icon: SiNodedotjs,
    iconColor: "#339933",
    top: "60%",
    right: "10%",
    delay: "2s",
    solidColor: "#8c32ff",
  },
  {
    label: "Database",
    icon: SiPostgresql,
    iconColor: "#4169e1",
    top: "80%",
    left: "20%",
    delay: "1s",
    solidColor: "#00E676",
  },
];

function FloatingTag({ tag }: { tag: (typeof floatingTagsData)[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="absolute flex items-center gap-2 justify-center px-6 py-3.5 rounded-full cursor-default transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        top: tag.top,
        left: tag.left,
        right: tag.right,
        animation: "float 4s ease-in-out infinite",
        animationDelay: tag.delay,
        background: isHovered ? tag.solidColor : "#ffffff",
        color: isHovered ? "#ffffff" : "#0b1215",
        transform: isHovered ? "scale(1.12)" : "scale(1)",
        border: isHovered
          ? `1px solid ${tag.solidColor}`
          : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isHovered
          ? `0 12px 24px -8px ${tag.solidColor}80`
          : "0 4px 12px rgba(0,0,0,0.05)",
      }}>
      <tag.icon style={{ color: tag.iconColor, width: 18, height: 18, flexShrink: 0 }} />
      <span className="text-[15px] font-bold tracking-wide">{tag.label}</span>
    </div>
  );
}

export function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section
      id="hero"
      className="relative flex flex-col justify-center min-h-screen pt-20 px-6 sm:px-10 lg:px-20"
      style={{ background: "#ffffff" }}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* Ornamen Garis Luwes di Kiri */}
      <HeroSquiggle />

      <div className="flex flex-col lg:flex-row items-center justify-between w-full mx-auto max-w-6xl mt-4 lg:mt-0">
        {/* LEFT — Typography */}
        <div
          className={`w-full lg:w-[55%] flex flex-col justify-center relative z-10 transition-all duration-700 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
          <div className="max-w-[620px] pl-0 lg:pl-10">
            <h1
              className="font-black mb-6 mt-4 lg:mt-0"
              style={{
                color: "#0b1215",
                fontSize: "clamp(48px, 6vw, 68px)",
                lineHeight: "1.02",
                letterSpacing: "-0.03em",
              }}>
              {copy.headline1}
              <br />
              {copy.headline2}
              <br />
              {copy.headline3}
            </h1>

            <p
              className="mb-10 text-[18px] lg:text-[20px] leading-[1.6]"
              style={{ color: "#757575", maxWidth: "500px" }}>
              {copy.sub}
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-[6px] px-8 py-3.5 text-[16px] font-bold transition-transform hover:scale-[1.02]"
                style={{ background: "#1c81ff", color: "#ffffff" }}>
                {copy.cta}
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
                {copy.ctaSecondary}
              </Link>
            </div>

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
                  500+ {copy.students}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Floating Tags */}
        <div
          className={`w-full lg:w-[45%] h-[450px] lg:h-[650px] mt-16 lg:mt-0 relative flex items-center justify-center transition-all duration-1000 delay-300 z-10 ${loaded ? "opacity-100" : "opacity-0"}`}>
          <div
            className="absolute inset-0 z-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#9ca3af 1.5px, transparent 1.5px)",
              backgroundSize: "36px 36px",
            }}
          />


          <div className="relative w-full h-full z-10 max-w-lg">
            {floatingTagsData.map((tag, i) => (
              <FloatingTag key={i} tag={tag} />
            ))}

            {/* 5 BULET-BULET KECIL MELAYANG */}
            <div
              className="absolute top-[35%] right-[25%] w-2.5 h-2.5 rounded-full"
              style={{
                background: "#1c81ff",
                animation: "float 4s ease-in-out infinite",
                animationDelay: "0.8s",
              }}
            />
            <div
              className="absolute bottom-[30%] left-[15%] w-2 h-2 rounded-full"
              style={{
                background: "#f6b60b",
                animation: "float 4s ease-in-out infinite",
                animationDelay: "1.2s",
              }}
            />
            <div
              className="absolute top-[15%] left-[30%] w-3 h-3 rounded-full"
              style={{
                background: "#00E676",
                animation: "float 5s ease-in-out infinite",
                animationDelay: "0.3s",
              }}
            />
            <div
              className="absolute bottom-[15%] right-[20%] w-3.5 h-3.5 rounded-full"
              style={{
                background: "#ff007b",
                animation: "float 6s ease-in-out infinite",
                animationDelay: "1.8s",
              }}
            />
            <div
              className="absolute top-[60%] right-[10%] w-2 h-2 rounded-full"
              style={{
                background: "#8c32ff",
                animation: "float 4.5s ease-in-out infinite",
                animationDelay: "0.6s",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
