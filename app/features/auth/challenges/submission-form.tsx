import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { Challenge } from "@/types/model";

// Import all type-specific submission forms
import { MultipleChoiceForm } from "./submission-forms/MultipleChoiceForm";
import { FillBlankForm } from "./submission-forms/FillBlankForm";
import { EssayForm } from "./submission-forms/EssayForm";
import { CodeEditorForm } from "./submission-forms/CodeEditorForm";
import { FileUploadForm } from "./submission-forms/FileUploadForm";
import { GithubSubmissionForm } from "./submission-forms/GithubSubmissionForm";
import { DockerProjectForm } from "./submission-forms/DockerProjectForm";
import { TimedExamForm } from "./submission-forms/TimedExamForm";
import { QuizGroupForm } from "./submission-forms/QuizGroupForm";

interface SubmissionFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

/**
 * Main SubmissionForm component - routes to type-specific forms
 * based on challenge.type
 */
export function SubmissionForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: SubmissionFormProps) {
  // Route to the appropriate form based on challenge type
  switch (challenge.type) {
    case "multiple_choice": {
      // Defensive fallback: legacy challenges stored as multiple_choice
      // but actually contain multiple questions (old quiz_group format)
      const hasMultipleQuestions = (challenge.metadata?.questions?.length ?? 0) > 1;
      if (hasMultipleQuestions) {
        return (
          <QuizGroupForm
            challenge={challenge}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        );
      }
      return (
        <MultipleChoiceForm
          challenge={challenge}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );
    }

    case "fill_blank":
      return (
        <FillBlankForm
          challenge={challenge}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case "essay":
      return (
        <EssayForm
          challenge={challenge}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case "code_editor":
      return (
        <CodeEditorForm
          challenge={challenge}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case "file_upload":
      return (
        <FileUploadForm
          challenge={challenge}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case "github_submission":
      return (
        <GithubSubmissionForm
          challenge={challenge}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case "docker_project":
      return (
        <DockerProjectForm
          challenge={challenge}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case "timed_exam":
      return (
        <TimedExamForm
          challenge={challenge}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    case "quiz_group":
      return (
        <QuizGroupForm
          challenge={challenge}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      );

    default:
      // Fallback for unknown challenge types
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unsupported Challenge Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Challenge type "{challenge.type}" tidak didukung. Silakan hubungi instruktur.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
  }
}
