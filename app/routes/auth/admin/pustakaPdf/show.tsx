import { useParams, Link } from "react-router";
import { useGetLesson } from "@/hooks/lessons";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function MaterialDetailPage() {
  const { lessonSlug, attachmentId } = useParams();
  const { lesson, loading } = useGetLesson(lessonSlug!);
  const [fileLoading, setFileLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cachedFileUrl, setCachedFileUrl] = useState<string | null>(null);

  const attachment = lesson?.attachments?.find(
    (att) => att.id.toString() === attachmentId
  );

  const getFileUrl = async (): Promise<string | null> => {
    if (cachedFileUrl) return cachedFileUrl;
    const response = await fetch(
      `https://wtc-api.pinat.nl/api/attachments/${attachmentId}/file`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    if (!response.ok) throw new Error("Gagal memuat file");
    const result = await response.json();
    const url = result.data?.file?.url ?? null;
    if (url) setCachedFileUrl(url);
    return url;
  };

  useEffect(() => {
    if (!attachmentId) return;
    const loadPreview = async () => {
      setPreviewLoading(true);
      try {
        const url = await getFileUrl();
        if (!url) return;
        const fileResponse = await fetch(url);
        if (!fileResponse.ok) throw new Error("Gagal memuat file");
        const blob = await fileResponse.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (error: any) {
        toast.error(error.message || "Gagal memuat preview");
      } finally {
        setPreviewLoading(false);
      }
    };
    loadPreview();
  }, [attachmentId]);

  const handleDownload = async () => {
    setFileLoading(true);
    try {
      const url = await getFileUrl();
      if (url) window.open(url, "_blank");
      else toast.error("File tidak tersedia");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengunduh file");
    } finally {
      setFileLoading(false);
    }
  };

  const formatSize = (bytes: string | number) => {
    const size = typeof bytes === "string" ? parseInt(bytes) : bytes;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[600px] rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!attachment) {
    return (
      <div className="space-y-4">
        <Link
          to="/materials"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Pustaka Materi
        </Link>
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6">
          <p className="text-[15px] text-red-600 dark:text-red-400">
            Materi tidak ditemukan.
          </p>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/materials"
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Pustaka Materi
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* PDF Preview */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm">
          {previewLoading ? (
            <div className="flex h-[600px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#1c81ff]" />
              <p className="text-[14px] text-gray-500 dark:text-gray-400">
                Memuat preview…
              </p>
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-[800px]"
              title={attachment.title}
            />
          ) : (
            <div className="flex h-[600px] flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <FileText className="h-7 w-7 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-[15px] font-bold text-gray-900 dark:text-white">
                Preview tidak tersedia
              </p>
              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                Download file untuk melihat isinya.
              </p>
            </div>
          )}
        </div>

        {/* Metadata sidebar */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 h-fit space-y-5">
          {/* Attachment title */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-1.5">
              Materi
            </p>
            <h2
              className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              {attachment.title}
            </h2>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5" />

          {/* Meta rows */}
          <dl className="space-y-4">
            <div>
              <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">
                Lesson
              </dt>
              <dd className="text-[14px] font-bold text-gray-900 dark:text-white">
                {lesson?.title}
              </dd>
            </div>

            {attachment.description && (
              <div>
                <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">
                  Deskripsi
                </dt>
                <dd className="text-[14px] leading-relaxed text-gray-600 dark:text-gray-300">
                  {attachment.description}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">
                Nama File
              </dt>
              <dd className="text-[13px] font-mono text-gray-600 dark:text-gray-300 break-all">
                {attachment.file_name}
              </dd>
            </div>

            {attachment.size && (
              <div>
                <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">
                  Ukuran
                </dt>
                <dd className="text-[14px] text-gray-600 dark:text-gray-300">
                  {formatSize(attachment.size)}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">
                Ditambahkan
              </dt>
              <dd className="text-[14px] text-gray-600 dark:text-gray-300">
                {formatDate(attachment.created_at)}
              </dd>
            </div>
          </dl>

          <div className="border-t border-gray-100 dark:border-white/5 pt-2" />

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={fileLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]"
          >
            {fileLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {fileLoading ? "Memuat…" : "Download File"}
          </button>
        </div>
      </div>
    </div>
  );
}
