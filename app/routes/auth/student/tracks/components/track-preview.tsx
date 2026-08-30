import { Link } from "react-router";
import { EnrollmentConfirmationModal } from "@/students/components/enrollment-confirmation-modal";
import { getPatternBackground } from "@/lib/utils";
import { ArrowLeft, Award, BookOpen, Clock, Loader2, PlayCircle, Target, CheckCircle, Sparkles } from "lucide-react";
import type { Track } from "@/types/model";

interface TrackPreviewProps {
  track: Track;
  showConfirmModal: boolean;
  enrollmentPending: boolean;
  onEnrollClick: () => void;
  onConfirmEnroll: () => void;
  onModalChange: (open: boolean) => void;
}

export function TrackPreview({ track, showConfirmModal, enrollmentPending, onEnrollClick, onConfirmEnroll, onModalChange }: TrackPreviewProps) {
  return (
    <div className="space-y-8">
      {/* Back */}
      <Link to="/student/classes" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left: content ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Hero card */}
          <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm">
            {/* Image / pattern */}
            <div className="relative h-52 w-full overflow-hidden" style={{ background: getPatternBackground(track.title) }}>
              {track.image_url && (
                <img
                  src={track.image_url}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* Badges */}
              <div className="absolute bottom-4 left-5 flex flex-wrap gap-2">
                {track.modules_count != null && track.modules_count > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-[12px] font-bold text-white">
                    <BookOpen className="h-3 w-3" />
                    {track.modules_count} Modul
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-[12px] font-bold text-white">
                  <Clock className="h-3 w-3" />
                  Self-Paced
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00E676]/80 backdrop-blur-sm px-3 py-1 text-[12px] font-bold text-white">
                  <Award className="h-3 w-3" />
                  Gratis
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 space-y-5">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Learning Path</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
                  {track.title}
                </h1>
              </div>

              <div className="h-px bg-gray-100 dark:bg-white/5" />

              {/* Description */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="h-4 w-4 text-[#1c81ff]" />
                </div>
                <div>
                  <h2 className="font-bold text-[15px] text-gray-900 dark:text-white mb-1">Tentang Kelas Ini</h2>
                  <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">{track.description || "Deskripsi kelas akan segera ditambahkan."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* What you'll learn */}
          <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-[#31c7c8]/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-[#31c7c8]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Apa yang Akan Kamu Pelajari</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                {
                  icon: BookOpen,
                  color: "bg-[#1c81ff]/10",
                  iconColor: "text-[#1c81ff]",
                  title: "Modul Pembelajaran Terstruktur",
                  desc: "Materi disusun sistematis dari dasar hingga lanjutan, dirancang membangun pemahaman bertahap.",
                },
                {
                  icon: PlayCircle,
                  color: "bg-[#2548d8]/10",
                  iconColor: "text-[#2548d8]",
                  title: "Lessons Interaktif",
                  desc: "Setiap modul dilengkapi lessons interaktif, latihan praktis, dan challenges untuk menguji pemahaman.",
                },
                {
                  icon: Award,
                  color: "bg-[#31c7c8]/10",
                  iconColor: "text-[#31c7c8]",
                  title: "Progress Tracking",
                  desc: "Pantau perkembangan belajar dengan sistem tracking yang membantumu tetap termotivasi.",
                },
              ].map(({ icon: Icon, color, iconColor, title, desc }) => (
                <div key={title} className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:shadow-sm transition-shadow">
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[14px] text-gray-900 dark:text-white mb-0.5">{title}</h3>
                    <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum structure */}
          <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-[#2548d8]/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#2548d8]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Struktur Pembelajaran</span>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-[14px] text-gray-500 dark:text-gray-400">Kurikulum dirancang dengan pendekatan bertahap untuk pemahaman yang solid.</p>
              {[
                { n: "01", color: "bg-[#1c81ff]/10 text-[#1c81ff]", title: "Fundamental Concepts", desc: "Membangun fondasi dengan konsep-konsep dasar yang penting" },
                { n: "02", color: "bg-[#2548d8]/10 text-[#2548d8]", title: "Practical Implementation", desc: "Menerapkan teori ke dalam praktik dengan hands-on exercises" },
                { n: "03", color: "bg-[#31c7c8]/10 text-[#31c7c8]", title: "Advanced Techniques", desc: "Menguasai teknik lanjutan dan best practices" },
                { n: "04", color: "bg-[#00E676]/10 text-[#00E676]", title: "Real-World Projects", desc: "Mengerjakan project nyata untuk portfolio dan pengalaman praktis" },
              ].map(({ n, color, title, desc }) => (
                <div key={n} className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 p-4 transition-colors">
                  <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-mono text-[12px] font-extrabold ${color}`}>{n}</span>
                  <div>
                    <h4 className="font-bold text-[14px] text-gray-900 dark:text-white">{title}</h4>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-[#1c81ff]/5 border border-[#1c81ff]/15 p-4 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-[#1c81ff] shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-600 dark:text-gray-300">
                  <span className="font-bold text-gray-900 dark:text-white">Daftar sekarang</span> untuk mengakses kurikulum lengkap dengan detail modul, lessons, dan challenges.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: enrollment sidebar ── */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm sticky top-20">
            {/* Price hero */}
            <div className="p-6 py-8.5 text-center border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-[#1c81ff]/5 to-[#31c7c8]/5">
              <div className="w-16 h-16 rounded-2xl bg-[#1c81ff]/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-[#1c81ff]" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1" style={{ letterSpacing: "-0.02em" }}>
                Gratis
              </div>
              <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400">Akses Selamanya</p>
            </div>

            {/* Includes */}
            <div className="p-5 space-y-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Kelas ini mencakup:</p>
              <ul className="space-y-2.5">
                {[
                  { icon: BookOpen, color: "text-[#1c81ff]", bg: "bg-[#1c81ff]/10", text: `${track.modules_count || "Beberapa"} modul pembelajaran` },
                  { icon: PlayCircle, color: "text-[#2548d8]", bg: "bg-[#2548d8]/10", text: "Lessons interaktif" },
                  { icon: Award, color: "text-[#31c7c8]", bg: "bg-[#31c7c8]/10", text: "Sertifikat penyelesaian" },
                  { icon: CheckCircle, color: "text-[#00E676]", bg: "bg-[#00E676]/10", text: "Akses seumur hidup" },
                ].map(({ icon: Icon, color, bg, text }) => (
                  <li key={text} className="flex items-center gap-3 text-[14px] text-gray-700 dark:text-gray-300">
                    <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>

              <div className="pt-3">
                <button
                  onClick={onEnrollClick}
                  disabled={enrollmentPending}
                  className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3.5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[15px]"
                >
                  {enrollmentPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Memproses…
                    </>
                  ) : (
                    <>
                      <Award className="h-5 w-5" />
                      Ambil Kelas Sekarang
                    </>
                  )}
                </button>
                <p className="text-center text-[12px] text-gray-400 dark:text-gray-600 mt-3">Dengan mendaftar, kamu setuju untuk belajar dan menyelesaikan materi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnrollmentConfirmationModal open={showConfirmModal} onOpenChange={onModalChange} onConfirm={onConfirmEnroll} loading={enrollmentPending} trackTitle={track.title} />
    </div>
  );
}
