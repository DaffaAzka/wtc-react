import { useInView, fadeUpStyle, staggerDelay } from "./use-in-view";
import {
  SiReact,
  SiVuedotjs,
  SiNodedotjs,
  SiPython,
  SiDocker,
  SiMongodb,
  SiTypescript,
  SiPostgresql,
  SiGit,
  SiLaravel,
  SiKotlin,
  SiFlutter,
  SiMysql,
  SiPhp,
  SiOpenjdk,
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";

const copy = {
  tag: "Learning Tracks",
  heading: "Technologies you'll master here.",
  sub: "Our curriculum is designed with industry practitioners — relevant, up-to-date, and immediately applicable for your tech career.",
};

const techs = [
  { icon: SiReact, name: "React", color: "#61DAFB" },
  { icon: SiVuedotjs, name: "Vue.js", color: "#4FC08D" },
  { icon: SiNodedotjs, name: "Node.js", color: "#339933" },
  { icon: SiTypescript, name: "TypeScript", color: "#3178C6" },
  { icon: SiPython, name: "Python", color: "#3776AB" },
  { icon: SiLaravel, name: "Laravel", color: "#FF2D20" },
  { icon: SiDocker, name: "Docker", color: "#2496ED" },
  { icon: FaAws, name: "AWS", color: "#FF9900" },
  { icon: SiPostgresql, name: "PostgreSQL", color: "#4169E1" },
  { icon: SiMongodb, name: "MongoDB", color: "#47A248" },
  { icon: SiGit, name: "Git", color: "#F05032" },
  { icon: SiKotlin, name: "Kotlin", color: "#7F52FF" },
  { icon: SiFlutter, name: "Flutter", color: "#02569B" },
  { icon: SiOpenjdk, name: "Java", color: "#007396" },
  { icon: SiMysql, name: "MySQL", color: "#4479A1" },
  { icon: SiPhp, name: "PHP", color: "#777BB4" },
];

export function TracksSection() {
  const { ref, inView } = useInView();

  return (
    <section
      id="tracks"
      ref={ref}
      className="min-h-screen flex flex-col justify-center w-full pt-20 pb-16 px-6 lg:px-20"
      style={{ background: "#ffffff" }}>
      <div className="mx-auto max-w-6xl px-6 py-24">
        {/* Header Section (Animasi barengan) */}
        <div
          className={`mb-16 transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
          <p
            className="text-[13px] font-bold uppercase tracking-[0.15em] mb-4"
            style={{ color: "#1c81ff" }}>
            {copy.tag}
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2
              className="font-extrabold m-0"
              style={{
                color: "#0b1215",
                fontSize: "clamp(36px, 4vw, 48px)",
                lineHeight: "1.05",
                letterSpacing: "-0.02em",
                maxWidth: "600px",
              }}>
              {copy.heading}
            </h2>
            <p
              className="text-[16px] lg:text-[18px] leading-relaxed max-w-[420px] m-0"
              style={{ color: "#757575" }}>
              {copy.sub}
            </p>
          </div>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {techs.map(({ icon: Icon, name, color }, i) => (
            /* Wrapper Animasi Masuk (Biar gak bentrok sama hover card) */
            <div
              key={name}
              className="transition-all duration-500 ease-out"
              style={{
                transitionDelay: `${i * 50}ms`, // Stagger: munculnya gilir-giliran per 50ms
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
              }}>
              {/* Card Konten Utama */}
              <div
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-5 cursor-default transition-all duration-300 hover:-translate-y-2 hover:bg-gray-50"
                style={{
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)",
                }}>
                {/* Box Icon */}
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-white transition-transform duration-300 group-hover:scale-110"
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}>
                  <Icon style={{ color, width: 26, height: 26 }} />
                </div>

                <span
                  className="text-[13px] font-bold text-center tracking-tight"
                  style={{ color: "#0b1215" }}>
                  {name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
