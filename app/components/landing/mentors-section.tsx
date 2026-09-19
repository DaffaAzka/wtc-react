import { FaGithub } from "react-icons/fa6";
import { useInView } from "./use-in-view";
import { mentorsPhotos } from "@/components/custom/team-photos";

const copy = {
  tag: "Mentors & Instructors",
  heading1: "Learn directly from",
  heading2: "active industry practitioners.",
  sub: "Our mentors are active developers building real products every day.",
};

const mentors = [
  {
    name: "Komariah S.Kom",
    role: "Guru Produktif RPL",
    company: "",
    photo: mentorsPhotos[5],
  },
  {
    github: "https://github.com/Raiyll",
    githubusn: "Raiyll",
    name: "Ahmad Rafi Fadhilah",
    role: "Full-Stack Web & Mobile Dev",
    company: "XII RPL 1",
    photo: mentorsPhotos[0],
  },
  {
    github: "https://github.com/salsykeys",
    githubusn: "salsykeys",
    name: "Ahmad Faisal",
    role: "Full-Stack Web & Mobile Dev",
    company: "XII RPL 2",
    photo: mentorsPhotos[4],
  },
  {
    github: "https://github.com/DaffaAzka",
    githubusn: "DaffaAzka",
    name: "Daffa Islami Azka",
    role: "Full-Stack Web & Mobile Dev",
    company: "XII RPL 3 (Alumni 2026)",
    photo: mentorsPhotos[1],
  },
  {
    github: "https://github.com/zinocchi",
    githubusn: "zinocchi",
    name: "FIkri Aziz Mudzakir",
    role: "Full-Stack Web & Mobile Dev",
    company: "XII RPL 1",
    photo: mentorsPhotos[2],
  },
  {
    github: "https://github.com/Allghzl",
    githubusn: "Allghzl",
    name: "Muhamad Afif Al Ghozali",
    role: "Full-Stack Web, DevOps, & Cloud",
    company: "XII RPL 1",
    photo: mentorsPhotos[3],
  },
];

export function MentorsSection() {
  const { ref, inView } = useInView();

  return (
    <section
      id="mentors"
      ref={ref}
      className="min-h-screen flex flex-col justify-center w-full pt-20 pb-16 px-4 lg:px-10"
      style={{ background: "#ffffff" }}>
      {/* Container dikembalikan ke max-w-6xl supaya formasi 3-3 lebih proporsional */}
      <div className="mx-auto w-full max-w-5xl px-2 lg:px-6">
        {" "}
        {/* Header Section (Animasi Fade Up) */}
        <div
          className={`mb-16 transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
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
              {copy.heading1}
              <br />
              {copy.heading2}
            </h2>
            <p
              className="text-[16px] lg:text-[18px] leading-relaxed max-w-[420px] m-0"
              style={{ color: "#757575" }}>
              {copy.sub}
            </p>
          </div>
        </div>
        {/* Grid diubah ke lg:grid-cols-3 supaya jadi 2 baris (3-3) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3 rounded-2xl overflow-hidden shadow-sm">
          {mentors.map((m, i) => (
            <div
              key={i}
              className="group relative overflow-hidden bg-gray-100 transition-all duration-700 ease-out rounded-xl"
              style={{
                aspectRatio: "3/4",
                transitionDelay: `${i * 100}ms`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(30px)",
              }}>
              {/* Photo */}
              <img
                src={m.photo || "/placeholder-user.jpg"}
                alt={m.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Scrim (Biar teks selalu kebaca) */}
              <div
                className="absolute inset-0 transition-opacity duration-300 opacity-70 group-hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                }}
              />
              <div
                className="absolute inset-0 transition-opacity duration-300 opacity-10 group-hover:opacity-40"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
                }}
              />

              {/* GitHub Link (Kondisional rendering) */}
              {m.github && (
                <div>
                  <p
                    className="absolute top-0 right-0 p-5 text-[10px] md:text-[12px] font-bold uppercase tracking-widest mb-1.5 z-10"
                    style={{ color: "#ffffff" }}>
                    <a
                      href={m.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-[#00d2ff] transition-colors">
                      <FaGithub className="inline-block size-4 mr-2" />
                      {m.githubusn}
                    </a>
                  </p>
                </div>
              )}

              {/* Text Overlay (Ukuran font dibalikin agak besar karena cardnya lebih lebar) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 transform transition-transform duration-300 translate-y-1 group-hover:translate-y-0">
                {m.company && (
                  <p
                    className="text-[10px] md:text-[12px] font-bold uppercase tracking-widest mb-1.5"
                    style={{ color: "#00d2ff" }}>
                    {m.company}
                  </p>
                )}
                <p
                  className="text-[16px] md:text-[20px] lg:text-[22px] font-bold leading-tight mb-1"
                  style={{ color: "#ffffff" }}>
                  {m.name}
                </p>
                <p
                  className="text-[11px] md:text-[13px] lg:text-[14px] font-medium opacity-85 leading-relaxed line-clamp-2"
                  style={{ color: "#e5e7eb" }}>
                  {m.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
