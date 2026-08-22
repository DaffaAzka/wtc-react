import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy } from "lucide-react";
import { ProfileInfoForm } from "@/features/auth/profile/profile-info-form";
import { AchievementsDisplay } from "@/features/auth/profile/activity-achievements";

export default function ProfilePage() {
  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">
          Kelola informasi profil dan lihat pencapaian Anda
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Pencapaian</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProfileInfoForm />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementsDisplay />
        </TabsContent>
      </Tabs>
    </div>
  );
}
