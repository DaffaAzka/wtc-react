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
  if (!creator) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
          A
        </div>
        <p className="truncate text-xs font-medium leading-none text-foreground">Admin</p>
      </div>
    );
  }

  const avatarUrl = resolveAvatarUrl(creator.avatar);
  const primaryRole =
    creator.roles?.[0]?.display_name ?? creator.roles?.[0]?.name ?? null;
  const initials =
    creator.display_name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex items-center gap-2 min-w-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-6 w-6 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium leading-none text-foreground">
          {creator.display_name ?? "—"}
        </p>
        {primaryRole && (
          <p className="truncate text-[10px] text-muted-foreground">
            {primaryRole}
          </p>
        )}
      </div>
    </div>
  );
}
