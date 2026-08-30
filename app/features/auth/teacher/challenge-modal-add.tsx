import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SelectForm from "@/components/custom/select-form";
import { useGetLessons } from "@/hooks/lessons";
import { useGetModules } from "@/hooks/modules";
import ChallengeModalAdd from "@/features/auth/challenges/modal-add";
import type { ChallengeContext } from "@/features/auth/challenges/challenge-manager";

type ContextType = "lesson" | "module";

export default function TeacherChallengeModalAdd() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [contextType, setContextType] = useState<ContextType>("lesson");
  const [targetId, setTargetId] = useState("");

  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeContext, setChallengeContext] =
    useState<ChallengeContext | null>(null);

  const { lessons } = useGetLessons();
  const { modules } = useGetModules();

  const handleContinue = () => {
    if (!targetId) return;
    const id = Number(targetId);
    let ctx: ChallengeContext;
    if (contextType === "lesson") {
      const lesson = lessons.find((l) => l.id === id);
      if (!lesson) return;
      ctx = {
        type: "lesson",
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
      };
    } else {
      const mod = modules.find((m) => m.id === id);
      if (!mod) return;
      ctx = { type: "module", id: mod.id, slug: mod.slug, title: mod.title };
    }
    setChallengeContext(ctx);
    setPickerOpen(false);
    setChallengeOpen(true);
  };

  return (
    <>
      {/* Picker dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogTrigger asChild>
          <Button>Add Challenge</Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add Challenge</DialogTitle>
            <DialogDescription>
              Choose where to attach the challenge.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <SelectForm
              name="contextType"
              text="Context type"
              items={[
                { id: "lesson", name: "Lesson" },
                { id: "module", name: "Module" },
              ]}
              handleChange={(v) => {
                setContextType(v as ContextType);
                setTargetId("");
              }}
              value={contextType}
            />

            {contextType === "lesson" ? (
              <SelectForm
                name="lessonId"
                text="Lesson"
                items={lessons.map((l) => ({ id: l.id, name: l.title }))}
                handleChange={setTargetId}
                value={targetId}
              />
            ) : (
              <SelectForm
                name="moduleId"
                text="Module"
                items={modules.map((m) => ({ id: m.id, name: m.title }))}
                handleChange={setTargetId}
                value={targetId}
              />
            )}

            <Button onClick={handleContinue} disabled={!targetId}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full challenge add modal, opened after context selection */}
      {challengeContext && (
        <ChallengeModalAdd
          context={challengeContext}
          isOpen={challengeOpen}
          onOpenChange={(open) => {
            setChallengeOpen(open);
            if (!open) setChallengeContext(null);
          }}
        />
      )}
    </>
  );
}
