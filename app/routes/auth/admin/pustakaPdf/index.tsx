import { useState, useMemo, useEffect } from "react";
import SelectForm from "@/components/custom/select-form";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { useGetAllLessons } from "@/hooks/lessons";
import { Plus, Search, FileText, Inbox } from "lucide-react";
import MaterialCard from "@/features/auth/pustakapdf/material-card";
import UploadMaterialModal from "@/features/auth/pustakapdf/upload-modal";

const TYPE_OPTIONS = [
  { id: "material",  name: "Material" },
  { id: "reference", name: "Reference" },
  { id: "slides",    name: "Slides" },
  { id: "document",  name: "Document" },
  { id: "download",  name: "Download" },
];

export default function MaterialsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { lessons, loading, error, refresh } = useGetAllLessons();

  const lessonsWithAttachments = useMemo(() => {
    if (!lessons) return [];
    return lessons.filter((l) => l.attachments && l.attachments.length > 0);
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    let filtered = lessonsWithAttachments;
    if (selectedLessonId !== "all") {
      filtered = filtered.filter((l) => l.id.toString() === selectedLessonId);
    }
    if (selectedType !== "all") {
      filtered = filtered
        .map((l) => ({ ...l, attachments: l.attachments?.filter((a) => a.type === selectedType) ?? [] }))
        .filter((l) => l.attachments.length > 0);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered
        .map((l) => ({
          ...l,
          attachments: l.attachments?.filter(
            (a) => a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || l.title.toLowerCase().includes(q)
          ) ?? [],
        }))
        .filter((l) => l.attachments.length > 0);
    }
    return filtered;
  }, [lessonsWithAttachments, selectedLessonId, selectedType, searchQuery]);

  const totalAttachments = useMemo(
    () => filteredLessons.reduce((sum, l) => sum + (l.attachments?.length ?? 0), 0),
    [filteredLessons]
  );

  useEffect(() => {
    if (!loading) { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }
  }, [loading]);

  if (loading) return <PageHeaderSkeleton />;
  if (error) return (
    <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6">
      <p className="text-[15px] text-red-600 dark:text-red-400">Error: {error.message}</p>
    </div>
  );

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Content</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            Learning Materials
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Manage and organize learning materials for all lessons.
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="shrink-0 mt-1 flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Material
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search materials…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 pl-10 pr-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-56">
              <SelectForm name="lessonId" text="Lesson" usePlaceholder withAll value={selectedLessonId} handleChange={setSelectedLessonId}
                items={lessons.map((l) => ({ id: l.id, name: l.title }))} />
            </div>
            <div className="w-full sm:w-44">
              <SelectForm name="type" text="Material Type" usePlaceholder withAll value={selectedType} handleChange={setSelectedType} items={TYPE_OPTIONS} />
            </div>
          </div>
        </div>
      </div>

      {/* Count */}
      {filteredLessons.length > 0 && (
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white">{totalAttachments}</span> materials found
        </p>
      )}

      {/* Content */}
      {filteredLessons.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <Inbox className="h-6 w-6 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-[15px] font-bold text-gray-900 dark:text-white">No materials found</p>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Try adjusting the filters or add a new material</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
              {/* Lesson group header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <div className="w-2 h-8 rounded-full bg-[#1c81ff]" />
                <div>
                  <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white">{lesson.title}</h3>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400">
                    {lesson.attachments?.length ?? 0} materials available
                  </p>
                </div>
              </div>
              {/* Attachments */}
              <div className="p-4 space-y-2">
                {lesson.attachments?.map((attachment) => (
                  <MaterialCard key={attachment.id} attachment={attachment} lesson={lesson} onDelete={refresh} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        lessons={lessons}
        onSuccess={refresh}
      />
    </div>
  );
}
