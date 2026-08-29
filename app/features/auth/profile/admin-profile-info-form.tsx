import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, X, Camera } from "lucide-react";
import { useGetProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from "@/hooks/profile";

export function AdminProfileInfoForm() {
  const { data: profileData, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();

  const [formData, setFormData] = useState<{ display_name?: string }>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileData?.profile) {
      setFormData({ display_name: profileData.profile.display_name || "" });
    }
  }, [profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    uploadAvatar(file, {
      onSuccess: () => {
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  };

  const handleAvatarDelete = () => {
    deleteAvatar();
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#1c81ff]" />
          <p className="text-[14px] text-gray-500 dark:text-gray-400">Memuat profil…</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (!profileData) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
        <p className="text-[14px] text-red-600 dark:text-red-400">Gagal memuat data profile</p>
      </div>
    );
  }

  const user = profileData.user || profileData;
  const profile = profileData.profile;
  const avatarSrc = avatarPreview || user.avatar?.url || undefined;
  const displayName = profile.display_name || user.name || "?";

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7">
      {/* Avatar section */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className="h-20 w-20 ring-2 ring-[#1c81ff]/20">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="text-2xl font-extrabold bg-[#1c81ff]/10 text-[#1c81ff]">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Upload overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1c81ff] text-white flex items-center justify-center shadow-md hover:bg-[#2548d8] disabled:opacity-50 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={isUploading || isDeleting}
            className="hidden"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2
            className="text-xl font-extrabold text-gray-900 dark:text-white truncate"
            style={{ letterSpacing: "-0.02em" }}
          >
            {displayName}
          </h2>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {user.email}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
              className="text-[13px] font-bold text-[#1c81ff] hover:opacity-75 disabled:opacity-40 transition-opacity"
            >
              {isUploading ? "Uploading…" : "Change photo"}
            </button>
            {(user.avatar?.url || avatarPreview) && !isUploading && (
              <>
                <span className="text-gray-300 dark:text-white/20">·</span>
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  disabled={isDeleting}
                  className="text-[13px] font-bold text-red-500 hover:opacity-75 disabled:opacity-40 transition-opacity"
                >
                  {isDeleting ? "Removing…" : "Remove"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-white/5" />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-[14px] text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="text-[12px] text-gray-400 dark:text-gray-600">Email tidak dapat diubah</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="display_name" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
            Nama Tampilan
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            value={formData.display_name || ""}
            onChange={handleInputChange}
            placeholder="Nama yang ditampilkan"
            className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-6 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
