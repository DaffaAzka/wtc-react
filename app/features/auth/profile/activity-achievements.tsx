import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, AlertCircle, Award, Star } from "lucide-react";
import { useGetAchievements } from "@/hooks/profile";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function AchievementsDisplay() {
  const { data: achievements, isLoading, error } = useGetAchievements();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Pencapaian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Gagal memuat pencapaian</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Pencapaian
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!achievements || achievements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-1">Belum Ada Pencapaian</p>
            <p className="text-sm">
              Selesaikan challenge dan lesson untuk mendapatkan badge!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  {achievement.badge_url ? (
                    <img
                      src={achievement.badge_url}
                      alt={achievement.title}
                      className="h-16 w-16 object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      {achievement.icon ? (
                        <span className="text-3xl">{achievement.icon}</span>
                      ) : (
                        <Award className="h-8 w-8 text-white" />
                      )}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {achievement.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {format(new Date(achievement.earned_at), "dd MMM yyyy", {
                      locale: localeId,
                    })}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
