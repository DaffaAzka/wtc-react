import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
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

  const findLessonBySlug = useCallback((lessonSlug: string): LessonWithState | null => {
    if (!trackOverview) return null;
    for (const module of trackOverview.modules) {
      const lesson = module.lessons.find((l) => l.slug === lessonSlug);
      if (lesson) return lesson;
    }
    return null;
  }, [trackOverview]);

  const getCurrentLesson = useCallback((): LessonWithState | null => {
    if (!trackOverview) return null;
    for (const module of trackOverview.modules) {
      const currentLesson = module.lessons.find((l) => l.state === "current");
      if (currentLesson) return currentLesson;
    }
    return null;
  }, [trackOverview]);

  const getNextLesson = useCallback((currentSlug: string): LessonWithState | null => {
    if (!trackOverview) return null;
    const allLessons: LessonWithState[] = [];
    for (const module of trackOverview.modules) {
      allLessons.push(...module.lessons);
    }
    const currentIndex = allLessons.findIndex((l) => l.slug === currentSlug);
    if (currentIndex === -1 || currentIndex === allLessons.length - 1) return null;
    return allLessons[currentIndex + 1];
  }, [trackOverview]);

  const refreshTrackOverview = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const value = useMemo(() => ({
    trackOverview: trackOverview ?? null,
    loading,
    error: error as Error | null,
    refreshTrackOverview,
    findLessonBySlug,
    getCurrentLesson,
    getNextLesson,
  }), [trackOverview, loading, error, refreshTrackOverview, findLessonBySlug, getCurrentLesson, getNextLesson]);

  return (
    <TrackContext.Provider value={value}>
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
