import { useGetModule } from "@/hooks/modules";
import type { Route } from "./+types/index";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { ChallengeGridSkeleton } from "@/components/skeletons/challenge-card";
import { Link } from "react-router";
import { ArrowLeft, TriangleAlert, Inbox } from "lucide-react";
import ChallengeManager from "@/features/auth/challenges/challenge-manager";

export default function ModuleChallengePage({ params }: Route.ComponentProps) {
  const backUrl = params.slug ? `/${params.slug}/modules` : `/modules`;
  const { module, loading, error, refresh } = useGetModule(params.moduleSlug);

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
      <div className="space-y-6">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Modules
        </Link>
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6 flex items-start gap-3">
          <TriangleAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[14px] text-red-700 dark:text-red-400">Unable to load module</p>
            <p className="text-[14px] text-red-600 dark:text-red-400 mt-0.5">{error.message || "An error occurred."}</p>
            <button
              onClick={refresh}
              className="mt-3 text-[13px] font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="space-y-6">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Modules
        </Link>
        <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-14 flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-[14px] font-bold text-gray-900 dark:text-white">Module not found</p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">The requested module could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <ChallengeManager
      context={{ type: "module", id: module.id, slug: module.slug, title: module.title }}
      backUrl={backUrl}
      backLabel="Back to Modules"
    />
  );
}
