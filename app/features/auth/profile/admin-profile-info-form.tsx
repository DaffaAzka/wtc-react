import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X } from "lucide-react";
import { useGetProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from "@/hooks/profile";

export function AdminProfileInfoForm() {
  const { data: profileData, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();

  const [formData, setFormData] = useState<{ display_name?: string }>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileData?.profile) {
      setFormData({
        display_name: profileData.profile.display_name || "",
      });
    }
  }, [profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
    <div className="space-y-6 w-full">
      {/* Profile Header */}
      <div className="border-b pb-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarPreview || user.avatar?.url || undefined} alt={profile.display_name || user.name} />
            <AvatarFallback className="text-2xl">{(profile.display_name || user.name).charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-1">{profile.display_name || user.name}</h1>
            <p className="text-muted-foreground mb-3">{user.email}</p>

            <div className="space-y-2">
              <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} disabled={isUploading || isDeleting} className="max-w-xs" />
              <div className="flex gap-2">
                {avatarFile && (
                  <Button size="sm" onClick={handleAvatarUpload} disabled={isUploading}>
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
                  <Button size="sm" variant="outline" onClick={handleAvatarDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Nama Tampilan</Label>
              <Input id="display_name" name="display_name" value={formData.display_name || ""} onChange={handleInputChange} placeholder="Nama yang ditampilkan" />
            </div>

            <div className="flex justify-end pt-4">
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
    </div>
  );
}
