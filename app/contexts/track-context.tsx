import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { TrackOverview, LessonWithState } from "@/types/model";
import { useGetTrackOverview } from "@/hooks/tracks";

interface TrackContextValue {
  trackOverview: TrackOverview | null;
  loading: boolean;
  error: Error | null;
  refreshTrackOverview: () => Promise<void>;
  findLessonBySlug: (lessonSlug: string) => LessonWithState | null;
  getCurrentLesson: () => LessonWithState | null;
  getNextLesson: (currentSlug: string) => LessonWithState | null;
}

const TrackContext = createContext<TrackContextValue | null>(null);

interface TrackProviderProps {
  children: ReactNode;
  trackSlug: string;
}

export function TrackProvider({ children, trackSlug }: TrackProviderProps) {
  const { trackOverview, loading, error, refresh } = useGetTrackOverview(trackSlug);

  // Helper: Find lesson by slug across all modules
  const findLessonBySlug = (lessonSlug: string): LessonWithState | null => {
    if (!trackOverview) return null;

    for (const module of trackOverview.modules) {
      const lesson = module.lessons.find((l) => l.slug === lessonSlug);
      if (lesson) return lesson;
    }

    return null;
  };

  // Helper: Get the current lesson (state === "current")
  const getCurrentLesson = (): LessonWithState | null => {
    if (!trackOverview) return null;

    for (const module of trackOverview.modules) {
      const currentLesson = module.lessons.find((l) => l.state === "current");
      if (currentLesson) return currentLesson;
    }

    return null;
  };

  // Helper: Get the next lesson after the given slug
  const getNextLesson = (currentSlug: string): LessonWithState | null => {
    if (!trackOverview) return null;

    // Flatten all lessons in order
    const allLessons: LessonWithState[] = [];
    for (const module of trackOverview.modules) {
      allLessons.push(...module.lessons);
    }

    // Find current lesson index
    const currentIndex = allLessons.findIndex((l) => l.slug === currentSlug);
    if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
      return null; // Not found or is last lesson
    }

    return allLessons[currentIndex + 1];
  };

  const refreshTrackOverview = async () => {
    await refresh();
  };

  return (
    <TrackContext.Provider
      value={{
        trackOverview: trackOverview ?? null,
        loading,
        error: error as Error | null,
        refreshTrackOverview,
        findLessonBySlug,
        getCurrentLesson,
        getNextLesson,
      }}
    >
      {children}
    </TrackContext.Provider>
  );
}

export function useTrackContext() {
  const context = useContext(TrackContext);
  if (!context) {
    throw new Error("useTrackContext must be used within a TrackProvider");
  }
  return context;
}
