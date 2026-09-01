import { useEffect, useState } from "react";

export function HeroSquiggle() {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        /* 1. Draw-in: stroke menggambar dirinya sendiri dari atas ke bawah */
        @keyframes squiggleDraw {
          0%   { stroke-dashoffset: 1; opacity: 0; }
          8%   { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }

        /* 2. Glow breathe khusus Desktop */
        @keyframes squiggleGlow {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(28,129,255,0.30))
                    drop-shadow(0 0 16px rgba(49,199,200,0.15));
          }
          50% {
            filter: drop-shadow(0 0 18px rgba(28,129,255,0.60))
                    drop-shadow(0 0 40px rgba(49,199,200,0.35));
          }
        }

        /* 3. Float: seluruh SVG naik-turun pelan */
        @keyframes squiggleFloat {
          0%, 100% { transform: translateY(0px)  rotate(0deg);   }
          33%      { transform: translateY(-10px) rotate(0.4deg); }
          66%      { transform: translateY(6px)   rotate(-0.3deg); }
        }

        /* 4. Gradient color shift setelah draw */
        @keyframes gStop0 { 0%, 100% { stop-color: #1c81ff; } 50% { stop-color: #31c7c8; } }
        @keyframes gStop1 { 0%, 100% { stop-color: #31c7c8; } 50% { stop-color: #1c81ff; } }
        @keyframes gStop2 { 0%, 100% { stop-color: #010d95; } 50% { stop-color: #1c81ff; } }

        /* Base state buat semua garis */
        .sq-path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          opacity: 0;
        }

        /* Animasi Draw aja (Buat layer utama di Mobile & Desktop) */
        .sq-path.drawn {
          animation: squiggleDraw 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.12s both;
        }

        /* Animasi Glow (Cuma ditaruh di layer blur pas layar Desktop) */
        @media (min-width: 1024px) {
          .sq-glow-layer.drawn {
            animation:
              squiggleDraw 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.12s both,
              squiggleGlow 4s ease-in-out 2.8s infinite;
          }
        }

        .sq-svg { animation: squiggleFloat 9s ease-in-out infinite; }
        .gs0 { animation: gStop0 5s ease-in-out 3s infinite; }
        .gs1 { animation: gStop1 5s ease-in-out 3.4s infinite; }
        .gs2 { animation: gStop2 5s ease-in-out 3.8s infinite; }
      `}</style>

      <svg
        className="sq-svg absolute -left-10 lg:left-0 top-32 lg:top-[20%] h-[70%] lg:h-[80%] w-[350px] lg:w-[450px] pointer-events-none z-0"
        overflow="visible"
        viewBox="0 0 400 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        {/* LAYER 1: BLUR & GLOW (Hanya muncul di Layar Besar / Desktop) */}
        {/* Perhatikan ada class "hidden lg:block" di sini */}
        <path
          d="M 20 80 L 320 200 L 80 420 L 360 580 L 150 780"
          stroke="url(#sq-grad-blur)"
          strokeWidth="72"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className={`hidden lg:block sq-path ${drawn ? " drawn" : ""}`}
          style={{ opacity: 0, filter: "blur(22px)" }}
        />

        {/* LAYER 2: GARIS UTAMA TAJAM (Muncul di Mobile & Desktop) */}
        <path
          d="M 20 80 L 320 200 L 80 420 L 360 580 L 150 780"
          stroke="url(#sq-grad)"
          strokeWidth="44"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className={`sq-path${drawn ? " drawn" : ""}`}
        />

        <defs>
          <linearGradient
            id="sq-grad"
            x1="0"
            y1="0"
            x2="400"
            y2="800"
            gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1c81ff" className="gs0" />
            <stop offset="50%" stopColor="#31c7c8" className="gs1" />
            <stop offset="100%" stopColor="#010d95" className="gs2" />
          </linearGradient>
          <linearGradient
            id="sq-grad-blur"
            x1="0"
            y1="0"
            x2="400"
            y2="800"
            gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1c81ff" />
            <stop offset="50%" stopColor="#31c7c8" />
            <stop offset="100%" stopColor="#010d95" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}
