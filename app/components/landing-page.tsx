import { LangProvider } from "./landing/lang-context";
import { Navbar } from "./landing/navbar";
import { HeroSection } from "./landing/hero-section";
import { StatsSection } from "./landing/stats-section";
import { TracksSection } from "./landing/tracks-section";
import { ExperienceSection } from "./landing/experience-section";
import { MentorsSection } from "./landing/mentors-section";
import { AboutSection } from "./landing/testimonials-section";
import { FaqSection } from "./landing/faq-section";
import { Footer } from "./landing/footer";

export function LandingPage() {
  return (
    <LangProvider>
      <style>{`
        /* Gilroy untuk seluruh landing page */
        .wtc-landing, .wtc-landing * {
          font-family: 'Gilroy', 'DM Sans', ui-sans-serif, system-ui, sans-serif !important;
        }
        ::-webkit-scrollbar { display: none; }
        
        html, body, #root { 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 100%;
          -ms-overflow-style: none; 
          scrollbar-width: none; 
          overflow-x: hidden; 
          background-color: #ffffff; /* Paksa background belakang layar jadi putih */
        }
      `}</style>

      {/* Tambahin w-full biar pasti mentok kiri kanan */}
      <div
        className="wtc-landing w-full min-h-screen overflow-x-hidden flex flex-col"
        style={{ background: "#ffffff" }}>
        {/* 0 — Sticky navbar (scroll-reveal) */}
        <Navbar />

        {/* 1 — Hero: white/black split with community photo */}
        <HeroSection />

        {/* 2 — Value props (black) + stat counter row */}
        <StatsSection />

        {/* 3 — Learning tracks & tech grid (white) */}
        <TracksSection />

        {/* 4 — Learning experience 3-step cards (black) */}
        <ExperienceSection />

        {/* 5 — Mentor portrait grid (white) */}
        <MentorsSection />

        {/* 6 — Testimonials (black) */}
        <AboutSection />

        {/* 7 — FAQ accordion (white) */}
        <FaqSection />

        {/* 8 — CTA banner + footer (black) */}
        <Footer />
      </div>
    </LangProvider>
  );
}
