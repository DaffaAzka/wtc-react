import { Button } from "@/components/ui/button";
import type { ChallengeAttachment, Lesson } from "@/types/model";
import { Download, Edit, Eye, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface MaterialCardProps {
  attachment: ChallengeAttachment;
  lesson: Lesson;
  onDelete: () => void;
}



export default function MaterialCard({
  attachment,
  lesson,
  onDelete,
}: MaterialCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Format file size
  const formatSize = (bytes: string | number) => {
    const size = typeof bytes === "string" ? parseInt(bytes) : bytes;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "material":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "reference":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "slides":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "document":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "download":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "material":
        return "Materi";
      case "reference":
        return "Referensi";
      case "slides":
        return "Slide Presentasi";
      case "document":
        return "Dokumen";
      case "download":
        return "Download";
      default:
        return type;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Get year from date
  const getYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  // Handle delete
  const handleDelete = async () => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus materi "${attachment.title}"?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // Call delete API
      const response = await fetch(
        `https://wtc-api.pinat.nl/api/lessons/${lesson.slug}/attachments/${attachment.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus materi");
      }

      toast.success("Materi berhasil dihapus");
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus materi");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `https://wtc-api.pinat.nl/api/attachments/${attachment.id}/file`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil file");
      }

      const result = await response.json();
      const fileUrl = result.data?.file?.url;

      if (fileUrl) {
        window.open(fileUrl, "_blank");
        toast.success("Download dimulai");
      } else {
        toast.error("File tidak tersedia");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil file");
    }
  };

  const handleView = () => {
    navigate(`/materials/${lesson.slug}/${attachment.id}`);
  };
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Left side - Content */}
        <div className="flex-1">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(
                attachment.type,
              )}`}
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              {getTypeLabel(attachment.type)}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground border border-border">
              {getYear(attachment.created_at)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground mb-2">
            {attachment.title}
          </h3>

          {/* Description */}
          {attachment.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {attachment.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>File: {attachment.file_name}</span>
            {attachment.size && (
              <>
                <span>•</span>
                <span>Ukuran: {formatSize(attachment.size)}</span>
              </>
            )}
            <span>•</span>
            <span>Ditambahkan: {formatDate(attachment.created_at)}</span>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col items-end gap-3 ml-6">
          {/* Icon Actions */}
          <div className="flex items-center gap-2">
            {/* Edit - Amber */}
            <button
              onClick={() => toast.info("Fitur edit akan segera hadir")}
              className="p-2 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>

            {/* Delete - Destructive */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-md bg-destructive/15 hover:bg-destructive/25 text-destructive border border-destructive/30 transition-colors disabled:opacity-50"
              title="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Button Actions */}
          <div className="flex flex-col gap-2 w-40">
            {/* Detail Button */}
            <Button onClick={handleView} size="sm" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              Detail
            </Button>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              size="sm"
              variant="secondary"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
