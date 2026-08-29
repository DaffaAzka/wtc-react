import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { ChallengeFormType } from "@/types/challenge";
import type { ChallengeContext } from "./challenge-manager";
import type { GeneratedChallenge } from "@/services/ai";
import {
  useGenerateChallengeForLesson,
  useGenerateChallengeForModule,
} from "@/hooks/ai";

type Props = {
  context: ChallengeContext;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (data: GeneratedChallenge) => void;
};

export default function GenerateChallengeModal({
  context,
  isOpen,
  onOpenChange,
  onGenerated,
}: Props) {
  const [type, setType] = useState<ChallengeFormType>("multiple_choice");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [maxScore, setMaxScore] = useState("100");
  const [mcqCount, setMcqCount] = useState("10");
  const [essayCount, setEssayCount] = useState("3");
  const [language, setLanguage] = useState<"id" | "en">("id");

  const generateForLesson = useGenerateChallengeForLesson(context.slug);
  const generateForModule = useGenerateChallengeForModule(context.slug);

  const mutation = context.type === "lesson" ? generateForLesson : generateForModule;

  const handleGenerate = () => {
    mutation.mutate(
      {
        type,
        difficulty,
        max_score: Number(maxScore),
        language,
        ...(type === "multiple_choice" || type === "mixed"
          ? { mcq_count: Number(mcqCount) }
          : {}),
        ...(type === "essay" || type === "mixed"
          ? { essay_count: Number(essayCount) }
          : {}),
      },
      {
        onSuccess: (data) => {
          onGenerated({ ...data, difficulty });
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Generate Challenge dengan AI
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 flex-wrap">
            Konfigurasi soal yang akan di-generate dari konten
            <Badge variant="outline" className="text-xs">
              {context.type === "lesson" ? "Lesson" : "Module"}: {context.title}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {mutation.error && (
            <Alert variant="destructive">
              <AlertDescription>{mutation.error.message}</AlertDescription>
            </Alert>
          )}

          {/* Tipe Soal */}
          <div className="space-y-2">
            <Label>
              Tipe Soal <span className="text-red-500">*</span>
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as ChallengeFormType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="mixed">Mixed (MCQ + Essay)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jumlah Soal */}
          <div className="grid grid-cols-2 gap-3">
            {(type === "multiple_choice" || type === "mixed") && (
              <div className="space-y-2">
                <Label>
                  Jumlah MCQ <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={mcqCount}
                  onChange={(e) => setMcqCount(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
            )}

            {(type === "essay" || type === "mixed") && (
              <div className="space-y-2">
                <Label>
                  Jumlah Essay <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={essayCount}
                  onChange={(e) => setEssayCount(e.target.value)}
                  placeholder="e.g. 3"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Difficulty & Max Score */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>
                Tingkat Kesulitan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={difficulty}
                onValueChange={(v) =>
                  setDifficulty(v as "easy" | "medium" | "hard")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Max Score <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>

          {/* Bahasa */}
          <div className="space-y-2">
            <Label>Bahasa Soal</Label>
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as "id" | "en")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={mutation.isPending}
          className="w-full gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sedang generate soal...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
