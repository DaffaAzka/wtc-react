import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, X, Camera, Clock, CheckCircle2, Trophy, Award } from "lucide-react";
import { useGetProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from "@/hooks/profile";
import { useAllMySubmissions } from "@/hooks/submission";
import type { ProfileUpdateRequest } from "@/services/profile";

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  submitted: { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]", dot: "bg-[#f6b60b]" },
  graded:    { bg: "bg-[#00E676]/10", text: "text-[#00E676]", dot: "bg-[#00E676]" },
  returned:  { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]", dot: "bg-[#1c81ff]" },
  draft:     { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
};

export function ProfileInfoForm() {
  const { data: profileData, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();
  const { data: submissions, isLoading: isLoadingSubmissions } = useAllMySubmissions();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.name === "study_class_id"
        ? e.target.value ? parseInt(e.target.value) : undefined
        : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = () => {
    if (!avatarFile) return;
    uploadAvatar(avatarFile, {
      onSuccess: () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  };

  const handleAvatarDelete = () => {
    deleteAvatar();
    setAvatarFile(null);
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

  // Last submission
  const lastSubmission = (() => {
    if (isLoadingSubmissions || !submissions?.length) return null;
    const submitted = submissions
      .filter((s) => { const sub = s.submission || s; return sub.submitted_at; })
      .sort((a, b) => {
        const aT = new Date((a.submission || a).submitted_at || 0).getTime();
        const bT = new Date((b.submission || b).submitted_at || 0).getTime();
        return bT - aT;
      });
    if (!submitted.length) return null;
    const last = submitted[0];
    return {
      submission: last.submission || last,
      challenge: last.challenge || (last.submission || last).challenge,
    };
  })();

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7">
      {/* Avatar + name section */}
      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <Avatar className="h-20 w-20 ring-2 ring-[#1c81ff]/20">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="text-2xl font-extrabold bg-[#1c81ff]/10 text-[#1c81ff]">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1c81ff] text-white flex items-center justify-center shadow-md hover:bg-[#2548d8] disabled:opacity-50 transition-colors"
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} disabled={isUploading || isDeleting} className="hidden" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white truncate" style={{ letterSpacing: "-0.02em" }}>
            {displayName}
          </h2>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{user.email}</p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {avatarFile && !isUploading && (
              <button onClick={handleAvatarUpload} disabled={isUploading}
                className="flex items-center gap-1.5 bg-[#1c81ff] text-white font-bold rounded-xl py-1.5 px-3 text-[13px] shadow-sm shadow-blue-500/20 hover:scale-[1.02] transition-transform">
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
            )}
            {isUploading && (
              <span className="flex items-center gap-1.5 text-[13px] text-[#1c81ff]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
              </span>
            )}
            {(user.avatar?.url || avatarPreview) && !isUploading && (
              <button onClick={handleAvatarDelete} disabled={isDeleting}
                className="flex items-center gap-1.5 text-[13px] font-bold text-red-500 hover:opacity-75 disabled:opacity-40 transition-opacity">
                <X className="h-3.5 w-3.5" />
                {isDeleting ? "Removing…" : "Remove photo"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Poin", value: profile.points.toLocaleString("id-ID"), icon: Trophy, color: "text-[#f6b60b]", bg: "bg-[#f6b60b]/10" },
          { label: "Pencapaian", value: profile.achievements?.length || 0, icon: Award, color: "text-[#31c7c8]", bg: "bg-[#31c7c8]/10" },
          { label: "Kelas", value: profile.study_class?.name || "—", icon: null, color: "", bg: "" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4">
            {Icon && (
              <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
            )}
            <div className="text-xl font-extrabold text-gray-900 dark:text-white truncate" style={{ letterSpacing: "-0.02em" }}>
              {value}
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Last submission */}
      {lastSubmission && (() => {
        const { submission, challenge } = lastSubmission;
        const s = STATUS_STYLE[submission.status ?? "draft"] ?? STATUS_STYLE.draft;
        return (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <div className="w-7 h-7 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-[#1c81ff]" />
              </div>
              <span className="font-bold text-[14px] text-gray-900 dark:text-white">Pengumpulan Terakhir</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>
                    {challenge?.title || "Challenge"}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {submission.status}
                    </span>
                    {submission.submitted_at && (
                      <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400 tabular-nums">
                        <Clock className="h-3 w-3" />
                        {new Date(submission.submitted_at).toLocaleString("id-ID")}
                      </span>
                    )}
                    {submission.score !== null && submission.score !== undefined && challenge?.max_score && (
                      <span className="flex items-center gap-1 text-[12px] font-bold text-[#1c81ff] tabular-nums">
                        <CheckCircle2 className="h-3 w-3" />
                        {submission.score}/{challenge.max_score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {submission.feedback && (
                <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3">
                  <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    <span className="font-bold text-gray-700 dark:text-gray-200">Feedback: </span>
                    {submission.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Achievements list */}
      {profile.achievements && profile.achievements.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="w-7 h-7 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
              <Trophy className="h-3.5 w-3.5 text-[#f6b60b]" />
            </div>
            <span className="font-bold text-[14px] text-gray-900 dark:text-white">Pencapaian</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {profile.achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f6b60b] to-[#ff007b] flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[14px] text-gray-900 dark:text-white">{achievement.title}</p>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{achievement.description}</p>
                  <p className="text-[12px] text-gray-400 dark:text-gray-600 mt-1 tabular-nums">
                    {new Date(achievement.earned_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-gray-100 dark:bg-white/5" />

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">Email</label>
          <input id="email" type="email" value={user.email} disabled
            className="w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-[14px] text-gray-500 dark:text-gray-400 cursor-not-allowed" />
          <p className="text-[12px] text-gray-400 dark:text-gray-600">Email tidak dapat diubah</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="display_name" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">Nama Tampilan</label>
          <input id="display_name" name="display_name" type="text"
            value={formData.display_name || ""}
            onChange={handleInputChange}
            placeholder="Nama yang ditampilkan"
            className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="study_class_id" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
            Kelas Studi <span className="font-normal text-gray-400 dark:text-gray-600">(opsional)</span>
          </label>
          <input id="study_class_id" name="study_class_id" type="number"
            value={formData.study_class_id || ""}
            onChange={handleInputChange}
            placeholder="ID Kelas Studi"
            className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
          />
          {profile.study_class && (
            <p className="text-[12px] text-gray-400 dark:text-gray-600">
              Kelas saat ini: {profile.study_class.name} ({profile.study_class.code})
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isUpdating}
            className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-6 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
            {isUpdating ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan…</> : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
