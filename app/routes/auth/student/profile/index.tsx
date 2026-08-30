import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, Pin, Star } from "lucide-react";
import { ProfileInfoForm } from "@/features/auth/profile/profile-info-form";
import { useGetProfile } from "@/hooks/profile";
import {
  useProfileAchievements,
  useProfileBadges,
  usePinBadge,
  useUnpinBadge,
} from "@/hooks/achievement";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const { data: profileData } = useGetProfile();
  const profileId: string = (profileData as any)?.profile?.id ?? "";

  const { achievements, loading: loadingAchievements } =
    useProfileAchievements(profileId);
  const { badges, loading: loadingBadges } = useProfileBadges(profileId);
  const { mutate: pinBadge, isPending: pinning } = usePinBadge(profileId);
  const { mutate: unpinBadge, isPending: unpinning } = useUnpinBadge(profileId);

  const pinnedIds = new Set(badges.map((b) => b.achievement_id));

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* ── Page header ── */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
          Akun
        </p>
        <h1
          className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Profil Saya
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Kelola informasi profil dan lihat pencapaian kamu.
        </p>

        {/* Pinned badges row — shown whenever there is at least one pinned badge */}
        {badges.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5" aria-label="Pinned badges">
            <TooltipProvider delayDuration={200}>
              {badges.map((badge) => (
                <Tooltip key={badge.achievement_id}>
                  <TooltipTrigger asChild>
                    <span
                      className="text-2xl cursor-default select-none leading-none"
                      role="img"
                      aria-label={badge.achievement.name}
                    >
                      {badge.achievement.badge_emoji}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-[12px] font-bold">{badge.achievement.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1215] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400"
          >
            <User className="h-3.5 w-3.5" />
            Profil
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="flex items-center gap-2 rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1215] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400"
          >
            <Trophy className="h-3.5 w-3.5" />
            Pencapaian
          </TabsTrigger>
        </TabsList>

        {/* ── Profile tab ── */}
        <TabsContent value="overview">
          <div className="max-w-2xl rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 md:p-8">
            <ProfileInfoForm />
          </div>
        </TabsContent>

        {/* ── Achievements tab ── */}
        <TabsContent value="achievements">
          <div className="space-y-8">
            {/* My Achievements */}
            <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#f6b60b]/10 flex items-center justify-center shrink-0">
                  <Trophy className="h-4 w-4 text-[#f6b60b]" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  Pencapaian Saya
                </span>
                {achievements.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    {achievements.length}
                  </span>
                )}
              </div>

              {loadingAchievements ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 rounded-2xl" />
                  ))}
                </div>
              ) : achievements.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                  <div className="w-14 h-14 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
                    <Trophy className="h-7 w-7 text-[#f6b60b]/50" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900 dark:text-white">
                      Belum Ada Pencapaian
                    </p>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
                      Selesaikan challenge dan lesson untuk mendapatkan badge!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((ea) => (
                    <div
                      key={ea.id}
                      className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] p-5 flex flex-col items-center text-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span className="text-4xl leading-none" role="img" aria-label={ea.achievement.name}>
                        {ea.achievement.badge_emoji}
                      </span>
                      <div>
                        <h4
                          className="font-extrabold text-[13px] text-gray-900 dark:text-white leading-tight mb-1"
                          style={{ letterSpacing: "-0.01em" }}
                        >
                          {ea.achievement.name}
                        </h4>
                        {ea.achievement.description && (
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2">
                            {ea.achievement.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f6b60b]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#f6b60b]">
                          <Star className="h-3 w-3" />
                          {format(new Date(ea.earned_at), "dd MMM yyyy", { locale: localeId })}
                        </span>
                        {ea.achievement.points_reward > 0 && (
                          <span className="inline-flex items-center rounded-full bg-[#1c81ff]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1c81ff]">
                            +{ea.achievement.points_reward} pts
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Badges — pin/unpin */}
            <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center shrink-0">
                  <Pin className="h-4 w-4 text-[#1c81ff]" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  Badge Saya
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  {badges.length}/5
                </span>
              </div>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5 ml-11">
                Pin hingga 5 badge untuk ditampilkan di profil kamu.
              </p>

              {loadingBadges || loadingAchievements ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              ) : achievements.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                  <p className="text-[14px] text-gray-500 dark:text-gray-400">
                    Raih pencapaian dulu untuk bisa pin badge.
                  </p>
                </div>
              ) : (
                <TooltipProvider delayDuration={200}>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {achievements.map((ea) => {
                      const isPinned = pinnedIds.has(ea.achievement_id);
                      const maxReached = badges.length >= 5 && !isPinned;
                      const busy = pinning || unpinning;

                      return (
                        <Tooltip key={ea.id}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled={maxReached || busy}
                              onClick={() => {
                                if (isPinned) unpinBadge(ea.achievement_id);
                                else pinBadge(ea.achievement_id);
                              }}
                              aria-label={
                                isPinned
                                  ? `Unpin ${ea.achievement.name}`
                                  : `Pin ${ea.achievement.name}`
                              }
                              className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1c81ff]
                                ${
                                  isPinned
                                    ? "border-[#1c81ff]/40 bg-[#1c81ff]/5 dark:bg-[#1c81ff]/10"
                                    : maxReached
                                      ? "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] opacity-40 cursor-not-allowed"
                                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] hover:border-[#1c81ff]/30 hover:bg-[#1c81ff]/5 cursor-pointer"
                                }`}
                            >
                              <span
                                className="text-3xl leading-none"
                                role="img"
                                aria-hidden="true"
                              >
                                {ea.achievement.badge_emoji}
                              </span>
                              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-tight line-clamp-2">
                                {ea.achievement.name}
                              </span>
                              {isPinned && (
                                <span className="absolute top-1.5 right-1.5">
                                  <Pin className="h-3 w-3 text-[#1c81ff]" />
                                </span>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-[12px]">
                              {maxReached
                                ? "Maximum 5 badges"
                                : isPinned
                                  ? "Unpin badge"
                                  : "Pin badge"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
