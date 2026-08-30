import { Download, Eye, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { ChallengeAttachment, Lesson } from "@/types/model";

interface MaterialCardProps {
  attachment: ChallengeAttachment;
  lesson: Lesson;
  onDelete: () => void;
}

const TYPE_STYLE: Record<string, { bg: string; text: string; label: string }> =
  {
    material: {
      bg: "bg-[#00E676]/10",
      text: "text-[#00E676]",
      label: "Materi",
    },
    reference: {
      bg: "bg-[#1c81ff]/10",
      text: "text-[#1c81ff]",
      label: "Referensi",
    },
    slides: { bg: "bg-[#31c7c8]/10", text: "text-[#31c7c8]", label: "Slide" },
    document: {
      bg: "bg-[#f6b60b]/10",
      text: "text-[#f6b60b]",
      label: "Dokumen",
    },
    download: {
      bg: "bg-[#2548d8]/10",
      text: "text-[#2548d8]",
      label: "Download",
    },
  };

function formatSize(bytes: string | number) {
  const size = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function MaterialCard({
  attachment,
  lesson,
  onDelete,
}: MaterialCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const typeStyle = TYPE_STYLE[attachment.type] ?? {
    bg: "bg-gray-100 dark:bg-white/5",
    text: "text-gray-500 dark:text-gray-400",
    label: attachment.type,
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus materi "${attachment.title}"?`)) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://wtc-api.pinat.nl/api/lessons/${lesson.slug}/attachments/${attachment.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (!response.ok) throw new Error("Gagal menghapus materi");
      toast.success("Materi berhasil dihapus");
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus materi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `https://wtc-api.pinat.nl/api/attachments/${attachment.id}/file`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (!response.ok) throw new Error("Gagal mengambil file");
      const result = await response.json();
      const fileUrl = result.data?.file?.url;
      if (fileUrl) {
        window.open(fileUrl, "_blank");
        toast.success("Download dimulai");
      } else toast.error("File tidak tersedia");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil file");
    }
  };

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] px-5 py-4 hover:bg-white dark:hover:bg-white/5 transition-colors group">
      {/* Icon */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full ${typeStyle.bg} flex items-center justify-center`}>
        <FileText className={`h-5 w-5 ${typeStyle.text}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h3 className="font-bold text-[14px] text-gray-900 dark:text-white truncate">
            {attachment.title}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${typeStyle.bg} ${typeStyle.text}`}>
            {typeStyle.label}
          </span>
          <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">
            {new Date(attachment.created_at).getFullYear()}
          </span>
        </div>

        {attachment.description && (
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
            {attachment.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-[12px] text-gray-400 dark:text-gray-600 font-mono flex-wrap">
          <span className="truncate max-w-[200px]">{attachment.file_name}</span>
          {attachment.size && (
            <>
              <span>·</span>
              <span>{formatSize(attachment.size)}</span>
            </>
          )}
          <span>·</span>
          <span>{formatDate(attachment.created_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => navigate(`/materials/${lesson.slug}/${attachment.id}`)}
          className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-white dark:hover:bg-white/5 hover:text-[#1c81ff] hover:border-[#1c81ff]/30 transition-all">
          <Eye className="h-3.5 w-3.5" />
          Detail
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 bg-[#1c81ff]/10 border-[1.5px] border-[#1c81ff]/20 text-[#1c81ff] font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-[#1c81ff]/20 transition-all">
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#ff007b]/10 text-[#ff007b] hover:bg-[#ff007b]/20 disabled:opacity-40 transition-all"
          title="Hapus">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
