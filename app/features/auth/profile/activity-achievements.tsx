import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, AlertCircle, Award, Star } from "lucide-react";
import { useGetAchievements } from "@/hooks/profile";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function AchievementsDisplay() {
  const { data: achievements, isLoading, error } = useGetAchievements();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-[#f6b60b]" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">
            Pencapaian
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <p className="text-[14px] text-red-600 dark:text-red-400">
          Gagal memuat pencapaian
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
          <Trophy className="h-4 w-4 text-[#f6b60b]" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">
          Pencapaian
        </span>
        {achievements && achievements.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
            {achievements.length}
          </span>
        )}
      </div>

      {/* Empty state */}
      {!achievements || achievements.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-14 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
          <div className="w-16 h-16 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-[#f6b60b]/50" />
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
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] p-5 flex flex-col items-center text-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              {/* Badge */}
              {achievement.badge_url ? (
                <img
                  src={achievement.badge_url}
                  alt={achievement.title}
                  className="h-14 w-14 object-contain"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#f6b60b] to-[#ff007b] flex items-center justify-center shadow-md">
                  {achievement.icon ? (
                    <span className="text-2xl">{achievement.icon}</span>
                  ) : (
                    <Award className="h-7 w-7 text-white" />
                  )}
                </div>
              )}

              {/* Info */}
              <div>
                <h4
                  className="font-extrabold text-[13px] text-gray-900 dark:text-white leading-tight mb-1"
                  style={{ letterSpacing: "-0.01em" }}>
                  {achievement.title}
                </h4>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2">
                  {achievement.description}
                </p>
              </div>

              {/* Date */}
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f6b60b]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#f6b60b]">
                <Star className="h-3 w-3" />
                {format(new Date(achievement.earned_at), "dd MMM yyyy", {
                  locale: localeId,
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
