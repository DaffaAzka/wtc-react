import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy } from "lucide-react";
import { ProfileInfoForm } from "@/features/auth/profile/profile-info-form";
import { AchievementsDisplay } from "@/features/auth/profile/activity-achievements";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Akun</p>
        <h1
          className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Profil Saya
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Kelola informasi profil dan lihat pencapaian kamu.
        </p>
      </div>

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

        <TabsContent value="overview">
          <div className="max-w-2xl rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 md:p-8">
            <ProfileInfoForm />
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 md:p-8">
            <AchievementsDisplay />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
