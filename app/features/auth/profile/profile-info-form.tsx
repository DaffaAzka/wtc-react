import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X } from "lucide-react";
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

  const user = profileData.user || profileData;
  const profile = profileData.profile;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile Header */}
      <div className="border-b pb-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={avatarPreview || user.avatar?.url || undefined}
              alt={profile.display_name || user.name}
            />
            <AvatarFallback className="text-2xl">
              {(profile.display_name || user.name).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-1">
              {profile.display_name || user.name}
            </h1>
            <p className="text-muted-foreground mb-3">{user.email}</p>

            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploading || isDeleting}
                className="max-w-xs"
              />
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
                    variant="outline"
                    onClick={handleAvatarDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 py-6 border-b">
        <div>
          <div className="text-2xl font-semibold">{profile.points.toLocaleString('id-ID')}</div>
          <div className="text-sm text-muted-foreground">Poin</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{profile.achievements?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Pencapaian</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{profile.study_class?.name || '-'}</div>
          <div className="text-sm text-muted-foreground">Kelas</div>
        </div>
      </div>

      {/* Achievements */}
      {profile.achievements && profile.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pencapaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                  <div className="flex-1">
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(achievement.earned_at).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
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
                placeholder="Nama yang ditampilkan"
              />
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

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isUpdating}
              >
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
    </div>
  );
}
