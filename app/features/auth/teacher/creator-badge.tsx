import type { ProfileAvatar } from "@/types/model";

export type Creator = {
  display_name: string | null;
  roles: { name: string; display_name?: string }[];
  avatar: ProfileAvatar;
};

function resolveAvatarUrl(avatar: ProfileAvatar): string | null {
  if (!avatar) return null;
  if (typeof avatar === "string") return avatar;
  return avatar.url;
}

export default function CreatorBadge({
  creator,
}: {
  creator?: Creator | null;
}) {
  const avatarUrl = creator ? resolveAvatarUrl(creator.avatar) : null;
  const displayName = creator?.display_name ?? "Admin";
  const initial = displayName.charAt(0).toUpperCase();
  const primaryRole =
    creator?.roles?.[0]?.display_name ?? creator?.roles?.[0]?.name ?? null;

  return (
    <div className="flex items-center gap-2 min-w-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-gray-200 dark:ring-white/10"
        />
      ) : (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1c81ff]/10 text-[11px] font-extrabold text-[#1c81ff]">
          {initial}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-gray-900 dark:text-white leading-tight">
          {displayName}
        </p>
        {primaryRole && (
          <p className="truncate text-[11px] text-gray-400 dark:text-gray-600 capitalize">
            {primaryRole}
          </p>
        )}
      </div>
    </div>
  );
}
