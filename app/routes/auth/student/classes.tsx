import { useEffect, useState } from "react";
import { SkeletonCard } from "@/components/skeletons/card";
import StudyClassCard from "@/features/auth/student/study-class-card";
import { api } from "@/lib/axios";
import { BookOpen, Users, Inbox } from "lucide-react";

interface StudyClass {
  id: string | number;
  name: string;
  description: string;
  slug?: string;
  image_url?: string;
  modules_count?: number;
}

export default function StudentClassesPage() {
  const [studyClasses, setStudyClasses] = useState<StudyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function fetchStudyClasses() {
      try {
        setLoading(true);
        const response = await api.get("/study-classes");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setStudyClasses(data);
      } catch {
        setStudyClasses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStudyClasses();
  }, []);

  useEffect(() => {
    if (!loading) { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }
  }, [loading]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 animate-pulse rounded-full" />
          <div className="h-10 w-64 bg-gray-200 dark:bg-white/10 animate-pulse rounded-xl" />
          <div className="h-4 w-48 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Student</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            Kelas Saya
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Lanjutkan perjalanan belajar di kelas yang kamu ikuti.
          </p>
        </div>
        {studyClasses.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 bg-[#1c81ff]/10 rounded-2xl px-4 py-2.5 mt-1">
            <div className="w-7 h-7 rounded-full bg-[#1c81ff]/20 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-[#1c81ff]" />
            </div>
            <span className="font-extrabold text-[#1c81ff]">{studyClasses.length}</span>
            <span className="text-[12px] font-bold text-[#1c81ff]/70">
              {studyClasses.length === 1 ? "class" : "classes"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {studyClasses.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-gray-400 dark:text-gray-600" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white">Belum ada kelas</p>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Kamu belum terdaftar di kelas manapun. Jelajahi learning paths untuk memulai.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyClasses.map((studyClass) => (
            <StudyClassCard data={studyClass} key={studyClass.id} />
          ))}
        </div>
      )}
    </div>
  );
}
