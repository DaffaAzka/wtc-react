import { AdminProfileInfoForm } from "@/features/auth/profile/admin-profile-info-form";

export default function AdminProfilePage() {
  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">
          Kelola informasi profil Anda
        </p>
      </div>

      <AdminProfileInfoForm />
    </div>
  );
}
