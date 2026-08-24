import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SelectForm from "@/components/custom/select-form";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { useGetAllLessons } from "@/hooks/lessons";
import { Plus, Search, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import MaterialCard from "@/features/auth/pustakapdf/material-card";
import UploadMaterialModal from "@/features/auth/pustakapdf/upload-modal";
import type { Lesson } from "@/types/model";

const TYPE_OPTIONS = [
  { id: "material", name: "Materi" },
  { id: "reference", name: "Referensi" },
  { id: "slides", name: "Slide" },
  { id: "document", name: "Dokumen" },
  { id: "download", name: "Download" },
];

export default function MaterialsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

 const { lessons, loading, error, refresh } = useGetAllLessons();

  // Filter lessons that have attachments
  const lessonsWithAttachments = useMemo(() => {
    if (!lessons) return [];
    return lessons.filter((lesson) => lesson.attachments && lesson.attachments.length > 0);
  }, [lessons]);

  // Apply filters
  const filteredLessons = useMemo(() => {
    let filtered = lessonsWithAttachments;

    // Filter by lesson
    if (selectedLessonId !== "all") {
      filtered = filtered.filter((lesson) => lesson.id.toString() === selectedLessonId);
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.map((lesson) => ({
        ...lesson,
        attachments: lesson.attachments?.filter((att) => att.type === selectedType) || [],
      })).filter((lesson) => lesson.attachments && lesson.attachments.length > 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered
        .map((lesson) => ({
          ...lesson,
          attachments: lesson.attachments?.filter(
            (att) =>
              att.title.toLowerCase().includes(query) ||
              att.description?.toLowerCase().includes(query) ||
              lesson.title.toLowerCase().includes(query)
          ) || [],
        }))
        .filter((lesson) => lesson.attachments && lesson.attachments.length > 0);
    }

    return filtered;
  }, [lessonsWithAttachments, selectedLessonId, selectedType, searchQuery]);

  // Total attachments count
  const totalAttachments = useMemo(() => {
    return filteredLessons.reduce(
      (sum, lesson) => sum + (lesson.attachments?.length || 0),
      0
    );
  }, [filteredLessons]);

  if (loading) {
    return <PageHeaderSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Pustaka Materi Pembelajaran
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola dan atur materi pembelajaran untuk semua lesson
        </p>
      </div>

      {/* Toolbar: search + add, then title strip + filters */}
      <div className="mb-6 rounded-lg border border-border bg-card overflow-hidden">
        {/* Row 1: search + add button */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Masukkan kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 bg-background"
            />
          </div>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Tambah Materi"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Row 2: section title + filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Materi <span className="text-primary">Pembelajaran</span>
            </h2>
            <p className="text-sm text-muted-foreground">Cari Materi</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-56">
              <SelectForm
                name="lessonId"
                text="Lesson"
                usePlaceholder
                withAll
                value={selectedLessonId}
                handleChange={setSelectedLessonId}
                items={lessons.map((lesson) => ({
                  id: lesson.id,
                  name: lesson.title,
                }))}
              />
            </div>
            <div className="w-full sm:w-44">
              <SelectForm
                name="type"
                text="Tipe Materi"
                usePlaceholder
                withAll
                value={selectedType}
                handleChange={setSelectedType}
                items={TYPE_OPTIONS}
              />
            </div>
            <Button onClick={() => {}} className="h-9 self-end sm:self-auto">
              <Search className="mr-2 h-4 w-4" />
              Cari
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Materi <span className="text-primary">Pembelajaran</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalAttachments} materi ditemukan
          </p>
        </div>

        {/* Materials List */}
        {filteredLessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">Tidak ada materi ditemukan</p>
            <p className="text-muted-foreground text-sm mt-1">
              Coba ubah filter atau tambahkan materi baru
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id}>
                {/* Lesson Group Header */}
                <div className="mb-4 border-l-4 border-primary pl-4">
                  <h3 className="text-base font-semibold text-foreground">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lesson.attachments?.length || 0} materi tersedia
                  </p>
                </div>

                {/* Attachments */}
                <div className="space-y-3 pl-6">
                  {lesson.attachments?.map((attachment) => (
                    <MaterialCard
                      key={attachment.id}
                      attachment={attachment}
                      lesson={lesson}
                      onDelete={refresh}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        lessons={lessons}
        onSuccess={refresh}
      />
    </div>
  );
}