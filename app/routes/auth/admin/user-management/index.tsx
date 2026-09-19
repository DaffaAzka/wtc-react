import { api } from "@/lib/axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, ChevronLeft, ChevronRight, Trash2, ShieldCheck } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type UserResource = {
  id: string;
  puid: string | null;
  name: string;
  email: string;
  provider: string;
  avatar: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
};

type RoleResource = {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
};

type ProfileWithUser = {
  id: string;
  user_id: string;
  study_class_id: number | null;
  display_name: string | null;
  points: number;
  last_login_at: string;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
  user: UserResource;
  roles: RoleResource[];
};

type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
};

type ProfilesResponse = {
  success: boolean;
  message: string;
  data: { profiles: ProfileWithUser[]; pagination: PaginationMeta };
};

type RolesResponse = {
  success: boolean;
  message: string;
  data: RoleResource[];
};

type ProfileResponse = {
  success: boolean;
  message: string;
  data: ProfileWithUser;
};

export default function UserManagement() {
  const [profiles, setProfiles] = useState<ProfileWithUser[]>([]);
  const [allRoles, setAllRoles] = useState<RoleResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Role state
  const [addingRole, setAddingRole] = useState(false);
  const [removingRoleId, setRemovingRoleId] = useState<number | null>(null);
  const [roleToRemove, setRoleToRemove] = useState<{ profileId: string; roleId: number; roleName: string } | null>(null);

  // Delete state
  const [userToDelete, setUserToDelete] = useState<ProfileWithUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Filters and pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchRoles = async () => {
    try {
      const response = await api.get<RolesResponse>("/roles");
      if (response.data.success) setAllRoles(response.data.data);
    } catch (error: any) {
      toast.error(error?.message || "Gagal memuat daftar role");
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (roleFilter && roleFilter !== "all") params.role = roleFilter;

      const response = await api.get<ProfilesResponse>("/profiles", { params });
      if (response.data.success) {
        setProfiles(response.data.data.profiles);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      toast.error(error?.message || "Gagal memuat daftar profiles");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileRoles = async (profileId: string) => {
    try {
      const response = await api.get<ProfileResponse>(`/profiles/${profileId}`);
      if (response.data.success) {
        const updated = response.data.data;
        setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, roles: updated.roles } : p)));
        setSelectedProfile((prev) => (prev?.id === profileId ? { ...prev, roles: updated.roles } : prev));
      }
    } catch (error: any) {
      toast.error(error?.message || "Gagal memuat role profile");
    }
  };

  const handleAssignRole = async (roleId: number) => {
    if (!selectedProfile?.id) return;
    try {
      setAddingRole(true);
      await api.post(`/profiles/${selectedProfile.id}/roles`, { role_id: roleId });
      toast.success("Role berhasil ditambahkan");
      await fetchProfileRoles(selectedProfile.id);
    } catch (error: any) {
      toast.error(error?.message || "Gagal menambahkan role");
    } finally {
      setAddingRole(false);
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    if (!selectedProfile?.id) return;
    try {
      setRemovingRoleId(roleId);
      await api.delete(`/profiles/${selectedProfile.id}/roles/${roleId}`);
      toast.success("Role berhasil dihapus");
      await fetchProfileRoles(selectedProfile.id);
      setRoleToRemove(null);
    } catch (error: any) {
      toast.error(error?.message || "Gagal menghapus role");
    } finally {
      setRemovingRoleId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setDeletingUser(true);
      await api.delete(`/users/${userToDelete.user_id}`);
      toast.success(`User "${userToDelete.display_name ?? userToDelete.user.name}" berhasil dihapus`);
      setUserToDelete(null);
      setModalOpen(false);
      setSelectedProfile(null);
      await fetchProfiles();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Gagal menghapus user");
    } finally {
      setDeletingUser(false);
    }
  };

  const getAvailableRoles = () => {
    if (!selectedProfile?.roles) return allRoles;
    const assignedIds = selectedProfile.roles.map((r) => r.id);
    return allRoles.filter((r) => !assignedIds.includes(r.id));
  };

  const getAvatarSrc = (avatar: any) =>
    typeof avatar === "string" ? avatar : (avatar as any)?.url ?? undefined;

  useEffect(() => { fetchRoles(); }, []);
  useEffect(() => { fetchProfiles(); }, [currentPage, search, roleFilter]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Kelola users dan roles dalam aplikasi</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari user (nama atau email)..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setCurrentPage(1); }}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            {allRoles.map((role) => (
              <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Roles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-[60px]" />
                      <Skeleton className="h-6 w-[60px]" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Tidak ada profile ditemukan
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow
                  key={profile.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => { setSelectedProfile(profile); setModalOpen(true); }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={getAvatarSrc(profile.user.avatar)} alt={profile.display_name ?? undefined} />
                        <AvatarFallback>{profile.display_name?.charAt(0).toUpperCase() ?? "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{profile.display_name ?? profile.user.name}</div>
                        <div className="text-xs text-muted-foreground">{profile.user.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{profile.user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{profile.user.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap">
                      {profile.roles && profile.roles.length > 0 ? (
                        profile.roles.map((role) => (
                          <Badge key={role.id} variant="secondary">{role.name}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {pagination.from}–{pagination.to} dari {pagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium">
              {pagination.current_page} / {pagination.last_page}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))} disabled={currentPage === pagination.last_page || loading}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          {selectedProfile && (
            <>
              <DialogHeader>
                <DialogTitle>Detail User</DialogTitle>
              </DialogHeader>

              {/* User info card */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarImage src={getAvatarSrc(selectedProfile.user.avatar)} alt={selectedProfile.display_name ?? undefined} />
                  <AvatarFallback className="text-xl font-semibold">
                    {selectedProfile.display_name?.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{selectedProfile.display_name ?? selectedProfile.user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedProfile.user.email}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs">{selectedProfile.user.provider}</Badge>
                    <span className="text-xs text-muted-foreground">{selectedProfile.points} poin</span>
                    <span className="text-xs text-muted-foreground">
                      Bergabung {new Date(selectedProfile.user.created_at).toLocaleDateString("id-ID", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Management */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Role Management</p>
                </div>

                {/* Current roles */}
                <div className="space-y-2">
                  {selectedProfile.roles && selectedProfile.roles.length > 0 ? (
                    selectedProfile.roles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between px-3 py-2 rounded-md border bg-card">
                        <Badge variant="secondary">{role.name}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setRoleToRemove({ profileId: selectedProfile.id, roleId: role.id, roleName: role.name })}
                          disabled={removingRoleId === role.id}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-3 border rounded-md">
                      Belum ada role
                    </p>
                  )}
                </div>

                {/* Add role dropdown */}
                {getAvailableRoles().length > 0 && (
                  <Select onValueChange={(value) => handleAssignRole(Number(value))} disabled={addingRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={addingRole ? "Menambahkan..." : "Tambah role..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableRoles().map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Danger Zone */}
              <div className="space-y-2 pt-1 border-t">
                <p className="text-xs font-semibold text-destructive uppercase tracking-wide pt-2">Danger Zone</p>
                <Button
                  variant="outline"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setUserToDelete(selectedProfile)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus User Ini
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Role Removal */}
      <AlertDialog open={!!roleToRemove} onOpenChange={() => setRoleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Hapus role <strong>{roleToRemove?.roleName}</strong> dari user ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (roleToRemove) handleRemoveRole(roleToRemove.roleId); }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete User */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => { if (!open && !deletingUser) setUserToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User Secara Permanen?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Anda akan menghapus <strong>{userToDelete?.display_name ?? userToDelete?.user.name}</strong> secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
                <p className="font-medium text-foreground">Yang akan dihapus:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Akun &amp; profil (nama, email, poin, role)</li>
                  <li>Semua submission beserta nilainya</li>
                  <li>Semua sertifikat beserta PDF-nya</li>
                  <li>Riwayat belajar (enrollment, lesson completion, point log)</li>
                  <li>Achievement &amp; badge</li>
                  <li>File yang tersimpan (avatar, file submission, dan PDF sertifikat)</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUser}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deletingUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingUser ? "Menghapus..." : "Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
