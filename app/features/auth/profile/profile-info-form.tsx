import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X, User } from "lucide-react";
import {
  useGetProfile,
  useUpdateProfile,
  useUploadAvatar,
  useDeleteAvatar,
} from "@/hooks/profile";
import type { ProfileUpdateRequest } from "@/services/profile";

export function ProfileInfoForm() {
  const { data: profileData, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();

  const [formData, setFormData] = useState<ProfileUpdateRequest>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when profile loads
  useEffect(() => {
    if (profileData?.profile) {
      setFormData({
        display_name: profileData.profile.display_name || "",
        study_class_id: profileData.profile.study_class_id || undefined,
      });
    }
  }, [profileData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.name === "study_class_id"
      ? (e.target.value ? parseInt(e.target.value) : undefined)
      : e.target.value;

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = () => {
    if (avatarFile) {
      uploadAvatar(avatarFile, {
        onSuccess: () => {
          setAvatarFile(null);
          setAvatarPreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      });
    }
  };

  const handleAvatarDelete = () => {
    deleteAvatar();
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!profileData) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Gagal memuat data profile</AlertDescription>
      </Alert>
    );
  }

  // Handle both possible API response structures:
  // 1. { user: {...}, profile: {...} }
  // 2. { ...userFields, profile: {...} }
  const user = profileData.user || profileData;
  const profile = profileData.profile;

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || user.avatar?.url || undefined} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploading || isDeleting}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG, atau GIF. Maksimal 2MB.
              </p>
              <div className="flex gap-2">
                {avatarFile && (
                  <Button
                    size="sm"
                    onClick={handleAvatarUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                )}
                {user.avatar?.url && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleAvatarDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email tidak dapat diubah
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Nama Tampilan</Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name || ""}
                onChange={handleInputChange}
                placeholder="Nama yang akan ditampilkan"
              />
              <p className="text-xs text-muted-foreground">
                Nama yang akan ditampilkan di platform
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="study_class_id">Kelas Studi (Opsional)</Label>
              <Input
                id="study_class_id"
                name="study_class_id"
                type="number"
                value={formData.study_class_id || ""}
                onChange={handleInputChange}
                placeholder="ID Kelas Studi"
              />
              {profile.study_class && (
                <p className="text-xs text-muted-foreground">
                  Kelas saat ini: {profile.study_class.name} ({profile.study_class.code})
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Profile Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Total Poin</span>
            <span className="font-semibold">{profile.points}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Login Terakhir</span>
            <span className="text-sm">
              {new Date(profile.last_login_at).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Sinkronisasi Terakhir</span>
            <span className="text-sm">
              {new Date(profile.last_synced_at).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Bergabung Sejak</span>
            <span className="text-sm">
              {new Date(user.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
