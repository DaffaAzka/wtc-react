import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  UserCog,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import type {
  ProfileWithUser,
  RoleResource,
  PaginationMeta,
  ProfilesResponse,
  RolesResponse,
  ProfileResponse,
} from "./_types";
import { RoleBadge } from "./_role-badge";

// ── Main page ───────────────────────────────────────────────────────────────

export default function UserManagement() {
  const [profiles, setProfiles] = useState<ProfileWithUser[]>([]);
  const [allRoles, setAllRoles] = useState<RoleResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithUser | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [addingRole, setAddingRole] = useState(false);
  const [removingRoleId, setRemovingRoleId] = useState<number | null>(null);
  const [roleToRemove, setRoleToRemove] = useState<{ profileId: string; roleId: number; roleName: string } | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchRoles = async () => {
    try {
      const res = await api.get<RolesResponse>("/roles");
      if (res.data.success) setAllRoles(res.data.data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load roles");
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      const res = await api.get<ProfilesResponse>("/profiles", { params });
      if (res.data.success) {
        setProfiles(res.data.data.profiles);
        setPagination(res.data.data.pagination);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileRoles = async (profileId: string) => {
    try {
      const res = await api.get<ProfileResponse>(`/profiles/${profileId}`);
      if (res.data.success) {
        setProfiles((prev) =>
          prev.map((p) => p.id === profileId ? { ...p, roles: res.data.data.roles } : p)
        );
        if (selectedProfile?.id === profileId)
          setSelectedProfile((p) => p ? { ...p, roles: res.data.data.roles } : p);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to reload roles");
    }
  };

  const handleAssignRole = async (roleId: number) => {
    if (!selectedProfile?.id) return;
    try {
      setAddingRole(true);
      await api.post(`/profiles/${selectedProfile.id}/roles`, { role_id: roleId });
      toast.success("Role assigned");
      await fetchProfileRoles(selectedProfile.id);
    } catch (e: any) {
      toast.error(e?.message || "Failed to assign role");
    } finally {
      setAddingRole(false);
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    if (!selectedProfile?.id) return;
    try {
      setRemovingRoleId(roleId);
      await api.delete(`/profiles/${selectedProfile.id}/roles/${roleId}`);
      toast.success("Role removed");
      await fetchProfileRoles(selectedProfile.id);
      setRoleToRemove(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to remove role");
    } finally {
      setRemovingRoleId(null);
    }
  };

  const openRoleDialog = (profile: ProfileWithUser) => {
    setSelectedProfile(profile);
    setRoleDialogOpen(true);
  };

  const getAvailableRoles = () => {
    if (!selectedProfile?.roles) return allRoles;
    const assigned = selectedProfile.roles.map((r) => r.id);
    return allRoles.filter((r) => !assigned.includes(r.id));
  };

  useEffect(() => { fetchRoles(); }, []);
  useEffect(() => { fetchProfiles(); }, [currentPage, search, roleFilter]);
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const avatarSrc = (avatar: any) =>
    typeof avatar === "string" ? avatar : avatar?.url ?? undefined;

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            Admin
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            User Management
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Manage users, profiles and their roles.
          </p>
        </div>
        {pagination && (
          <div className="hidden lg:flex items-center gap-2 bg-[#1c81ff]/10 rounded-2xl px-4 py-2.5 mt-1">
            <div className="w-7 h-7 rounded-full bg-[#1c81ff]/20 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-[#1c81ff]" />
            </div>
            <span className="font-extrabold text-[#1c81ff]">{pagination.total}</span>
            <span className="text-[12px] font-bold text-[#1c81ff]/70">users</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 pl-10 pr-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Roles</SelectItem>
            {allRoles.map((role) => (
              <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
              {["User", "Email", "Provider", "Roles", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 ${i >= 4 ? "text-right" : "text-left"} ${i === 1 ? "hidden md:table-cell" : ""} ${i === 2 ? "hidden sm:table-cell" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-32 rounded-md" />
                        <Skeleton className="h-2.5 w-20 rounded-md" />
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-5 py-3.5"><Skeleton className="h-3.5 w-44 rounded-md" /></td>
                  <td className="hidden sm:table-cell px-5 py-3.5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                  <td className="px-5 py-3.5"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="px-5 py-3.5 text-right"><Skeleton className="ml-auto h-8 w-28 rounded-xl" /></td>
                </tr>
              ))
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400">No profiles found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-1 ring-gray-200 dark:ring-white/10">
                        <AvatarImage src={avatarSrc(profile.user.avatar)} alt={profile.display_name ?? undefined} />
                        <AvatarFallback className="text-xs font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                          {profile.display_name?.charAt(0).toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-[14px] text-gray-900 dark:text-white">
                          {profile.display_name ?? "—"}
                        </div>
                        <div className="text-[12px] text-gray-400 dark:text-gray-600 font-mono">
                          {profile.id.slice(0, 8)}…
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-5 py-3.5 text-[14px] text-gray-600 dark:text-gray-300">
                    {profile.user.email}
                  </td>
                  <td className="hidden sm:table-cell px-5 py-3.5">
                    <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
                      {profile.user.provider}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {profile.roles?.length > 0 ? (
                        profile.roles.map((r) => <RoleBadge key={r.id} name={r.name} />)
                      ) : (
                        <span className="text-[13px] text-gray-400 dark:text-gray-600 italic">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => openRoleDialog(profile)}
                      className="inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <UserCog className="h-3.5 w-3.5" />
                      Manage Roles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500 dark:text-gray-400">
            {pagination.from}–{pagination.to}{" "}
            <span className="text-gray-400 dark:text-gray-600">of</span>{" "}
            {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="tabular-nums text-[13px] font-bold text-gray-500 dark:text-gray-400 px-1">
              {pagination.current_page} / {pagination.last_page}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={currentPage === pagination.last_page || loading}
              className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Role Management Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle
              className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              Manage Roles
            </DialogTitle>
            <DialogDescription asChild>
              {selectedProfile ? (
                <div className="flex items-center gap-3 mt-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3">
                  <Avatar className="h-10 w-10 ring-1 ring-gray-200 dark:ring-white/10">
                    <AvatarImage src={avatarSrc(selectedProfile.user.avatar)} alt={selectedProfile.display_name ?? undefined} />
                    <AvatarFallback className="text-sm font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                      {selectedProfile.display_name?.charAt(0).toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-[14px] text-gray-900 dark:text-white">
                      {selectedProfile.display_name}
                    </div>
                    <div className="text-[13px] text-gray-500 dark:text-gray-400">
                      {selectedProfile.user.email}
                    </div>
                  </div>
                </div>
              ) : <span />}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Current roles */}
            <div>
              <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Current Roles
              </p>
              {selectedProfile?.roles?.length ? (
                <div className="space-y-2">
                  {selectedProfile.roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        <RoleBadge name={role.name} />
                      </div>
                      <button
                        onClick={() => setRoleToRemove({ profileId: selectedProfile.id, roleId: role.id, roleName: role.name })}
                        disabled={removingRoleId === role.id}
                        className="flex items-center gap-1 text-[13px] font-bold text-red-500 hover:text-red-600 disabled:opacity-40 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-gray-400 dark:text-gray-600 italic py-2">
                  No roles assigned yet.
                </p>
              )}
            </div>

            {/* Add role */}
            <div>
              <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Add Role
              </p>
              {getAvailableRoles().length > 0 ? (
                <Select onValueChange={(v) => handleAssignRole(Number(v))} disabled={addingRole}>
                  <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                    <SelectValue placeholder="Select a role to add…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {getAvailableRoles().map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Plus className="h-3.5 w-3.5 text-gray-400" />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-4 text-center">
                  <p className="text-[13px] text-gray-400 dark:text-gray-600">
                    All roles already assigned.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm remove dialog */}
      <AlertDialog open={!!roleToRemove} onOpenChange={() => setRoleToRemove(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              Remove role?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-gray-500 dark:text-gray-400">
              This will remove the{" "}
              <span className="font-bold text-gray-900 dark:text-white">{roleToRemove?.roleName}</span>{" "}
              role from this profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-[1.5px] border-gray-200 dark:border-white/20 font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleToRemove && handleRemoveRole(roleToRemove.roleId)}
              className="bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
