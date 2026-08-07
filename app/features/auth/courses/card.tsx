import type { Track } from "@/types/model";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book, BookText } from "lucide-react";
import { Link } from "react-router";

export default function CourseCard({ data }: { data: Track }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-row justify-between items-end">
        <Link to={`${data.slug}`}>
          <p className="hover:underline text-sm text-primary">Lihat Selengkapnya</p>
        </Link>
        <div className="flex flex-row gap-1 items-center text-muted-foreground">
          <Book size={18} />
          <p className="font-medium">{data.modules_count} Modules</p>
        </div>
      </CardContent>
    </Card>
  );
}
