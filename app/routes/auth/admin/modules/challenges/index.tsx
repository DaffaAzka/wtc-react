import { useGetModule } from "@/hooks/modules";
import type { Route } from "./+types/index";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { ChallengeGridSkeleton } from "@/components/skeletons/challenge-card";
import ErrorState from "@/components/custom/error-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import ChallengeManager from "@/features/auth/challenges/challenge-manager";

export default function ModuleChallengePage({ params }: Route.ComponentProps) {
  // Build dynamic back URL based on route structure
  const backUrl = params.slug
    ? `/${params.slug}/modules`
    : `/modules`;

  const {
    module,
    loading,
    error,
    refresh,
  } = useGetModule(params.moduleSlug);

  if (loading) {
    return (
      <>
        <PageHeaderSkeleton />
        <ChallengeGridSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="mb-6">
          <Link to={backUrl}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
          </Link>
        </div>
        <ErrorState
          title="Unable to load module"
          message={
            error.message || "An error occurred while loading the module data."
          }
          onRetry={refresh}
        />
      </>
    );
  }

  if (!module) {
    return (
      <>
        <div className="mb-6">
          <Link to={backUrl}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
          </Link>
        </div>
        <ErrorState
          title="Module not found"
          message="The requested module could not be found."
        />
      </>
    );
  }

  return (
    <ChallengeManager
      context={{
        type: "module",
        id: module.id,
        slug: module.slug,
        title: module.title,
      }}
      backUrl={backUrl}
      backLabel="Back to Modules"
    />
  );
}
