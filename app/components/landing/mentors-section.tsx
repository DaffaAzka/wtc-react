import { useRef, useState, useEffect } from "react";
import { teamPhotos } from "@/components/custom/team-photos";

// Multi-bahasa dihapus, sisa EN aja
const copy = {
  tag: "Mentors & Instructors",
  heading1: "Learn directly from",
  heading2: "active industry practitioners.",
  sub: "Our mentors are active developers building real products every day.",
};

const mentors = [
  {
    name: "Rizky Pratama",
    role: "Senior Frontend",
    company: "Gojek",
    photo: teamPhotos[0],
  },
  {
    name: "Dinda Ayu",
    role: "Backend Developer",
    company: "Tokopedia",
    photo: teamPhotos[1],
  },
  {
    name: "Bagas Wicaksono",
    role: "DevOps Engineer",
    company: "Traveloka",
    photo: teamPhotos[2],
  },
  {
    name: "Sari Kumalasari",
    role: "Mobile Developer",
    company: "Bukalapak",
    photo: teamPhotos[3],
  },
];

export function MentorsSection() {
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
      id="mentors"
      ref={ref}
      className="w-full"
      style={{ background: "#ffffff" }}>
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        {/* Header Section (Animasi Fade Up) */}
        <div
          className={`mb-16 transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
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

        {/* Mentor Grid 
            Skillshare style: no gap/small gap, full bleed images 
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 lg:gap-1.5 rounded-2xl overflow-hidden shadow-sm">
          {mentors.map((m, i) => (
            <div
              key={i}
              className="group relative overflow-hidden bg-gray-100 transition-all duration-700 ease-out"
              style={{
                aspectRatio: "3/4", // Tinggiin dikit biar pas buat portrait
                transitionDelay: `${i * 100}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
              }}>
              {/* Photo */}
              <img
                src={m.photo || "/placeholder-user.jpg"} // Fallback kalau gak ada foto
                alt={m.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Scrim (Biar teks selalu kebaca) */}
              <div
                className="absolute inset-0 transition-opacity duration-300 opacity-80 group-hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
                }}
              />

              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 transform transition-transform duration-300 translate-y-1 group-hover:translate-y-0">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "#00d2ff" }} // Aksen warna Cyan ala Skillshare
                >
                  {m.company}
                </p>
                <p
                  className="text-[18px] lg:text-[20px] font-bold leading-tight mb-1"
                  style={{ color: "#ffffff" }}>
                  {m.name}
                </p>
                <p
                  className="text-[13px] font-medium opacity-80"
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
