import {
  Card,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaBook, FaArrowRight, FaUserGraduate } from "react-icons/fa";
import { Link } from "react-router";

interface StudyClass {
  id: string | number;
  name: string;
  description: string;
  slug?: string;
  image_url?: string;
  modules_count?: number;
}

export default function StudyClassCard({ data }: { data: StudyClass }) {
  const slug = data.slug || `${data.id}`;
  const imageUrl = data.image_url || "/images/default-class.png";

  return (
    <Link to={`/student/study-classes/${slug}`}>
      <Card className="overflow-hidden group cursor-pointer border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        {/* Class Image with Overlay */}
        <div className="relative h-48 overflow-hidden bg-muted">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{
              backgroundImage: `url(${imageUrl})`,
            }}
          >
            {/* Gradient Overlay for Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Title Overlay on Image */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Badge className="mb-2 bg-primary/90 backdrop-blur-sm border-white/20">
              <FaUserGraduate className="h-3 w-3 mr-1" />
              Study Class
            </Badge>
            <h3 className="text-white font-bold text-lg line-clamp-2 drop-shadow-lg">
              {data.name}
            </h3>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="flex-1 flex flex-col p-4 space-y-3">
          {/* Description */}
          <CardDescription className="text-sm line-clamp-2 flex-1">
            {data.description}
          </CardDescription>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FaBook className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{data.modules_count || 0}</span>
              <span>Modules</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
              <span>Open</span>
              <FaArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
