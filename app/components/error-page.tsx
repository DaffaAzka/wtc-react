import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Home } from "lucide-react";

export function ErrorPage({
  code,
  title,
  description,
}: {
  code: string;
  title: string;
  description: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#ffffff] dark:bg-[#0b1215] font-sans overflow-hidden px-6">
      {/* 1. HUGE WATERMARK BACKGROUND */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <h1 className="font-black text-[45vw] text-slate-50 dark:text-white/[0.02] leading-none tracking-tighter">
          {code}
        </h1>
      </div>

      {/* 2. FOREGROUND CONTENT */}
      <div
        className={`relative z-10 flex flex-col items-center text-center max-w-2xl transition-all duration-1000 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}>
        {/* Status Badge */}
        <div className="mb-8 px-4 py-1.5 rounded-full bg-[#1c81ff]/10 border border-[#1c81ff]/20 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#1c81ff] animate-pulse"></span>
          <span className="text-[11px] font-bold text-[#1c81ff] uppercase tracking-[0.2em]">
            System Error {code}
          </span>
        </div>

        {/* Typography */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-[1.1] mb-6">
          {title}
        </h2>

        <p className="text-[15px] sm:text-[17px] text-gray-500 dark:text-gray-400 mb-10 max-w-md leading-relaxed">
          {description}
        </p>

        {/* Buttons with Icons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border-[1.5px] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-xl py-3.5 px-8 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-[14px]">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3.5 px-8 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-[14px]">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
  