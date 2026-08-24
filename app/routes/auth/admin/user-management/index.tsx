import { api } from "@/lib/axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserCog, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Types based on API documentation
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
  id: string; // Profile ID
  user_id: string;
  study_class_id: number | null;
  display_name: string | null;
  points: number;
  last_login_at: string;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
  user: UserResource; // Embedded user data
  roles: RoleResource[]; // Profile roles
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
  data: {
    profiles: ProfileWithUser[];
    pagination: PaginationMeta;
  };
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
  // State management - now working with profiles instead of users
  const [profiles, setProfiles] = useState<ProfileWithUser[]>([]);
  const [allRoles, setAllRoles] = useState<RoleResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithUser | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [addingRole, setAddingRole] = useState(false);
  const [removingRoleId, setRemovingRoleId] = useState<number | null>(null);
  const [roleToRemove, setRoleToRemove] = useState<{ profileId: string; roleId: number; roleName: string } | null>(null);

  // Filters and pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      const response = await api.get<RolesResponse>("/roles");
      if (response.data.success) {
        setAllRoles(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      toast.error(error?.message || "Gagal memuat daftar role");
    }
  };

  // Fetch profiles with pagination and filters (NEW: single API call!)
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (search) {
        params.search = search;
      }

      if (roleFilter && roleFilter !== "all") {
        params.role = roleFilter;
      }

      // Single API call to get all profiles with user data and roles!
      const response = await api.get<ProfilesResponse>("/profiles", { params });

      if (response.data.success) {
        setProfiles(response.data.data.profiles);
        setPagination(response.data.data.pagination);
        console.log(`✅ Loaded ${response.data.data.profiles.length} profiles with roles`);
      }
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast.error(error?.message || "Gagal memuat daftar profiles");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile's current roles (for refresh after role changes)
  const fetchProfileRoles = async (profileId: string) => {
    try {
      const response = await api.get<ProfileResponse>(`/profiles/${profileId}`);
      if (response.data.success) {
        // Update the profile in the list
        setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, roles: response.data.data.roles } : p)));
        // Update selected profile
        if (selectedProfile && selectedProfile.id === profileId) {
          setSelectedProfile({ ...selectedProfile, roles: response.data.data.roles });
        }
      }
    } catch (error: any) {
      console.error("Error fetching profile roles:", error);
      toast.error(error?.message || "Gagal memuat role profile");
    }
  };

  // Assign role to profile
  const handleAssignRole = async (roleId: number) => {
    if (!selectedProfile?.id) return;

    try {
      setAddingRole(true);
      await api.post(`/profiles/${selectedProfile.id}/roles`, {
        role_id: roleId,
      });

      toast.success("Role berhasil ditambahkan");
      await fetchProfileRoles(selectedProfile.id);
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast.error(error?.message || "Gagal menambahkan role");
    } finally {
      setAddingRole(false);
    }
  };

  // Remove role from profile
  const handleRemoveRole = async (roleId: number) => {
    if (!selectedProfile?.id) return;

    try {
      setRemovingRoleId(roleId);
      await api.delete(`/profiles/${selectedProfile.id}/roles/${roleId}`);

      toast.success("Role berhasil dihapus");
      await fetchProfileRoles(selectedProfile.id);
      setRoleToRemove(null);
    } catch (error: any) {
      console.error("Error removing role:", error);
      toast.error(error?.message || "Gagal menghapus role");
    } finally {
      setRemovingRoleId(null);
    }
  };

  // Open role management dialog
  const openRoleDialog = (profile: ProfileWithUser) => {
    setSelectedProfile(profile);
    setRoleDialogOpen(true);
  };

  // Initial load
  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch profiles when filters change
  useEffect(() => {
    fetchProfiles();
  }, [currentPage, search, roleFilter]);

  // Get available roles for assignment (exclude already assigned)
  const getAvailableRoles = () => {
    if (!selectedProfile?.roles) return allRoles;
    const assignedRoleIds = selectedProfile.roles.map((r) => r.id);
    return allRoles.filter((role) => !assignedRoleIds.includes(role.id));
  };

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
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value);
            setCurrentPage(1); // Reset to first page on filter
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            {allRoles.map((role) => (
              <SelectItem key={role.id} value={role.name}>
                {role.name}
              </SelectItem>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-[60px]" />
                      <Skeleton className="h-6 w-[60px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-[100px] ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : profiles.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Tidak ada profile ditemukan
                </TableCell>
              </TableRow>
            ) : (
              // Actual profile data
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={typeof profile.user.avatar === 'string' ? profile.user.avatar : (profile.user.avatar as any)?.url ?? undefined} alt={profile.display_name ?? undefined} />
                        <AvatarFallback>{profile.display_name?.charAt(0).toUpperCase() ?? '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{profile.display_name}</div>
                        <div className="text-sm text-muted-foreground">Profile ID: {profile.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{profile.user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{profile.user.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {profile.roles && profile.roles.length > 0 ? (
                        profile.roles.map((role) => (
                          <Badge key={role.id} variant="secondary">
                            {role.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No roles</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openRoleDialog(profile)}>
                      <UserCog className="h-4 w-4 mr-2" />
                      Manage Roles
                    </Button>
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
          <div className="text-sm text-muted-foreground">
            Menampilkan {pagination.from} - {pagination.to} dari {pagination.total} profiles
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1 || loading}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {pagination.current_page} of {pagination.last_page}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))} disabled={currentPage === pagination.last_page || loading}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Role Management Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Profile Roles</DialogTitle>
            <DialogDescription>
              {selectedProfile && (
                <div className="flex items-center gap-3 mt-2">
                  <Avatar>
                    <AvatarImage src={typeof selectedProfile.user.avatar === 'string' ? selectedProfile.user.avatar : (selectedProfile.user.avatar as any)?.url ?? undefined} alt={selectedProfile.display_name ?? undefined} />
                    <AvatarFallback>{selectedProfile.display_name?.charAt(0).toUpperCase() ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{selectedProfile.display_name}</div>
                    <div className="text-sm">{selectedProfile.user.email}</div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Roles */}
            <div>
              <h4 className="text-sm font-medium mb-3">Current Roles</h4>
              <div className="space-y-2">
                {selectedProfile?.roles && selectedProfile.roles.length > 0 ? (
                  selectedProfile.roles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{role.name}</Badge>
                        <span className="text-sm text-muted-foreground">ID: {role.id}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setRoleToRemove({
                            profileId: selectedProfile.id,
                            roleId: role.id,
                            roleName: role.name,
                          })
                        }
                        disabled={removingRoleId === role.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">Profile belum memiliki role</div>
                )}
              </div>
            </div>

            {/* Add Role */}
            <div>
              <h4 className="text-sm font-medium mb-3">Add Role</h4>
              {getAvailableRoles().length > 0 ? (
                <Select onValueChange={(value) => handleAssignRole(Number(value))} disabled={addingRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role untuk ditambahkan" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRoles().map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{role.name}</Badge>
                          <span className="text-xs text-muted-foreground">ID: {role.id}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg">Semua role sudah di-assign ke user ini</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Role Removal Dialog */}
      <AlertDialog open={!!roleToRemove} onOpenChange={() => setRoleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus role <strong>{roleToRemove?.roleName}</strong> dari profile ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (roleToRemove) {
                  handleRemoveRole(roleToRemove.roleId);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
