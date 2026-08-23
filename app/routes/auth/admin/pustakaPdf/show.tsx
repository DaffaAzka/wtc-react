import { useParams, Link } from "react-router";
import { useGetLesson } from "@/hooks/lessons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) throw new Error("Gagal memuat file");

    const result = await response.json();
    const url = result.data?.file?.url ?? null;
    if (url) setCachedFileUrl(url);
    return url;
  };

  // Auto-load preview begitu halaman dibuka
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
        const blobUrl = URL.createObjectURL(blob);
        setPreviewUrl(blobUrl);
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
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("File tidak tersedia");
      }
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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  if (loading) {
    return <div className="p-6">Memuat...</div>;
  }

  if (!attachment) {
    return (
      <div className="p-6">
        <p className="text-destructive">Materi tidak ditemukan</p>
        <Link to="/materials" className="text-primary underline mt-2 inline-block">
          Kembali ke Pustaka Materi
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Link
        to="/materials"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Pustaka Materi
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: PDF Preview */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          {previewLoading ? (
            <div className="flex items-center justify-center h-[600px] text-muted-foreground">
              Memuat preview...
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-[800px]"
              title={attachment.title}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground gap-2">
              <FileText className="h-10 w-10" />
              <p>Preview tidak tersedia</p>
            </div>
          )}
        </div>

        {/* Right: Metadata */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 h-fit">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Lesson</p>
            <p className="font-medium text-foreground">{lesson?.title}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Judul Materi</p>
            <p className="font-medium text-foreground">{attachment.title}</p>
          </div>

          {attachment.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Deskripsi</p>
              <p className="text-foreground">{attachment.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-1">Nama File</p>
            <p className="text-foreground">{attachment.file_name}</p>
          </div>

          {attachment.size && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ukuran</p>
              <p className="text-foreground">{formatSize(attachment.size)}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-1">Ditambahkan</p>
            <p className="text-foreground">{formatDate(attachment.created_at)}</p>
          </div>

          <Button
            onClick={handleDownload}
            disabled={fileLoading}
            className="w-full mt-4"
          >
            <Download className="mr-2 h-4 w-4" />
            {fileLoading ? "Memuat..." : "Download File"}
          </Button>
        </div>
      </div>
    </div>
  );
}