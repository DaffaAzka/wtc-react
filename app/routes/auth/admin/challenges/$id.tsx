import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetChallenge } from "@/hooks/challenges";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import ErrorState from "@/components/custom/error-state";

export default function ViewChallengePage() {
  const { id } = useParams<{ id: string }>();
  const challengeId = parseInt(id || "0", 10);

  const { challenge, loading, error } = useGetChallenge(challengeId);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <ErrorState
        title="Unable to load challenge"
        message={error?.message || "Challenge not found"}
        actionLabel="Back to Challenges"
        onAction={() => window.history.back()}
      />
    );
  }

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-600 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    hard: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/all-challenges">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {challenge.slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/admin/challenges/${challenge.id}/edit`}>
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <div className="mt-1">
                <Badge variant="outline">{challenge.type}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
              <div className="mt-1">
                <Badge className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}>
                  {challenge.difficulty}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Max Score</label>
              <p className="mt-1 text-sm">{challenge.max_score}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Points (EXP)</label>
              <p className="mt-1 text-sm">{challenge.points}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Allowed Attempts</label>
              <p className="mt-1 text-sm">
                {challenge.allowed_attempts === null || challenge.allowed_attempts === -1
                  ? "Unlimited"
                  : challenge.allowed_attempts}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Context</label>
              <p className="mt-1 text-sm">
                {challenge.lesson_id
                  ? `Lesson #${challenge.lesson_id}`
                  : challenge.module_id
                    ? `Module #${challenge.module_id}`
                    : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description Card */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: challenge.content || "No description provided." }}
          />
        </CardContent>
      </Card>

      {/* Questions/Metadata Card */}
      {challenge.metadata && typeof challenge.metadata === "object" && (
        <Card>
          <CardHeader>
            <CardTitle>Questions & Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {(challenge.metadata as any).questions && Array.isArray((challenge.metadata as any).questions) ? (
              <div className="space-y-4">
                {(challenge.metadata as any).questions.map((question: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <Badge variant="outline" className="text-xs">
                        {question.type || "unknown"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {question.question || question.text || "No question text"}
                    </p>
                    {question.options && Array.isArray(question.options) && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Options:</p>
                        {question.options.map((option: any, optIndex: number) => (
                          <div key={optIndex} className="text-sm flex items-center gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{typeof option === "string" ? option : option.text || option.value}</span>
                            {(typeof option === "object" && option.isCorrect) && (
                              <Badge variant="default" className="text-xs ml-auto">Correct</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Score: {question.score || question.points || "—"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                {JSON.stringify(challenge.metadata, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Card */}
      {challenge.settings && (
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(challenge.settings, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
