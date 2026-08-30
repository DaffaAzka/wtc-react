import { AdminProfileInfoForm } from "@/features/auth/profile/admin-profile-info-form";
import { useEffect, useState } from "react";

export default function AdminProfilePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
          Account
        </p>
        <h1
          className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          My Profile
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Manage your profile information and preferences.
        </p>
      </div>

      {/* Form card */}
      <div className="max-w-2xl rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 md:p-8">
        <AdminProfileInfoForm />
      </div>
    </div>
  );
}
