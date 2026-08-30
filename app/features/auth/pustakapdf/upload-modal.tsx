import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Lesson } from "@/types/model";
import { FileUp, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
  onSuccess: () => void;
}

export default function UploadMaterialModal({
  isOpen,
  onClose,
  lessons,
  onSuccess,
}: UploadMaterialModalProps) {
  const [selectedLessonSlug, setSelectedLessonSlug] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("material");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error("Hanya file PDF yang diperbolehkan");
        return;
      }

      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast.error("Ukuran file maksimal 50MB");
        return;
      }

      setSelectedFile(file);

      if (!title) {
        const filename = file.name.replace(/\.pdf$/i, "");
        setTitle(filename);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedLessonSlug("");
    setSelectedFile(null);
    setTitle("");
    setType("material");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLessonSlug) {
      toast.error("Pilih lesson terlebih dahulu");
      return;
    }

    if (!selectedFile) {
      toast.error("Pilih file PDF terlebih dahulu");
      return;
    }

    if (!title.trim()) {
      toast.error("Judul materi tidak boleh kosong");
      return;
    }

    if (!type) {
      toast.error("Pilih tipe materi terlebih dahulu");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title.trim());
      formData.append("type", type);
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      const response = await fetch(
        `https://wtc-api.pinat.nl/api/lessons/${selectedLessonSlug}/attachments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Gagal mengupload materi");
      }

      toast.success("Materi berhasil diupload");
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupload materi");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) {
      return;
    }
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Upload className="h-6 w-6 text-blue-600" />
            Upload Materi Pembelajaran
          </DialogTitle>
          <DialogDescription>
            Tambahkan materi pembelajaran baru dalam bentuk PDF untuk lesson
            tertentu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Lesson Selection */}
          <div className="space-y-2">
            <Label htmlFor="lesson" className="text-sm font-medium">
              Lesson <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedLessonSlug}
              onValueChange={setSelectedLessonSlug}
              disabled={isUploading}>
              <SelectTrigger id="lesson" className="h-11">
                <SelectValue placeholder="Pilih lesson untuk materi ini" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.slug} value={lesson.slug}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium">
              File PDF <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="h-11"
              />
              {selectedFile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
                  <FileUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-gray-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Format: PDF • Ukuran maksimal: 50MB
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Judul Materi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Masukkan judul materi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="h-11"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Tipe Materi <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={setType} disabled={isUploading}>
              <SelectTrigger id="type" className="h-11">
                <SelectValue placeholder="Pilih tipe materi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material">Materi</SelectItem>
                <SelectItem value="reference">Referensi</SelectItem>
                <SelectItem value="slides">Slide Presentasi</SelectItem>
                <SelectItem value="document">Dokumen</SelectItem>
                <SelectItem value="download">Download</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Deskripsi (Opsional)
            </Label>
            <Textarea
              id="description"
              placeholder="Masukkan deskripsi atau catatan untuk materi ini"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                isUploading ||
                !selectedFile ||
                !selectedLessonSlug ||
                !title.trim()
              }
              className="bg-blue-600 hover:bg-blue-700 text-white">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Materi
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
