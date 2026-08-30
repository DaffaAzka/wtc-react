/**
 * Teacher Content CRUD tests
 *
 * Asserts that the teacher content page renders tabs for tracks, modules,
 * lessons, and challenges with create/edit/delete controls, compact creator
 * metadata, explicit soft-delete confirmation, and no restore controls.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

vi.mock("react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={String(to)} {...(props as object)}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

// ---------------------------------------------------------------------------
// Hooks mocks
// ---------------------------------------------------------------------------
vi.mock("@/hooks/tracks", () => ({
  useGetTracks: vi.fn(() => ({
    tracks: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
  })),
  useGetTracksPaginated: vi.fn(() => ({
    tracks: [],
    pagination: undefined,
    loading: false,
    error: null,
    refresh: vi.fn(),
  })),
  useStoreTrack: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useUpdateTrack: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useDeleteTrack: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  })),
}));

vi.mock("@/hooks/modules", () => ({
  useGetModules: vi.fn(() => ({
    modules: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
  })),
  useGetModulesPaginated: vi.fn(() => ({
    modules: [],
    pagination: undefined,
    loading: false,
    error: null,
    refresh: vi.fn(),
  })),
  useStoreModule: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useUpdateModule: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useDeleteModule: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  })),
}));

vi.mock("@/hooks/lessons", () => ({
  useGetLessons: vi.fn(() => ({
    lessons: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
  })),
  useGetLessonsPaginated: vi.fn(() => ({
    lessons: [],
    pagination: undefined,
    loading: false,
    error: null,
    refresh: vi.fn(),
  })),
  useStoreLesson: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useUpdateLesson: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useDeleteLesson: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  })),
}));

vi.mock("@/hooks/challenges", () => ({
  useGetChallenges: vi.fn(() => ({
    challenges: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
  })),
  useGetChallengesPaginated: vi.fn(() => ({
    challenges: [],
    pagination: undefined,
    loading: false,
    error: null,
    refresh: vi.fn(),
  })),
  useStoreChallenge: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useUpdateChallenge: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useDeleteChallenge: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  })),
  useGetChallengesByLesson: vi.fn(() => ({
    challenges: [],
    loading: false,
    error: null,
  })),
  useGetChallengesByModule: vi.fn(() => ({
    challenges: [],
    loading: false,
    error: null,
  })),
}));

vi.mock("@/utils/global", () => ({
  generateSlug: (s: string) => s.toLowerCase().replace(/\s+/g, "-"),
  getFieldError: () => undefined,
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Import mocked hooks at module level for use in beforeEach
// ---------------------------------------------------------------------------
import { useGetTracks, useDeleteTrack } from "@/hooks/tracks";
import { useGetModules } from "@/hooks/modules";
import { useGetLessons } from "@/hooks/lessons";
import { useGetChallenges } from "@/hooks/challenges";

// ---------------------------------------------------------------------------
// Component under test
// ---------------------------------------------------------------------------
import TeacherContentPage from "@/routes/auth/teacher/content";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleTrack = {
  id: 1,
  slug: "web-fundamentals",
  title: "Web Fundamentals",
  description: "A track",
  image_url: "",
  order: 1,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  creator: {
    display_name: "Jane Doe",
    roles: [{ name: "teacher", display_name: "Teacher" }],
    avatar: null,
  },
};

const sampleModule = {
  id: 1,
  track_id: 1,
  slug: "html-basics",
  title: "HTML Basics",
  order: 1,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  creator: {
    display_name: "Jane Doe",
    roles: [{ name: "teacher", display_name: "Teacher" }],
    avatar: null,
  },
};

const sampleLesson = {
  id: 1,
  module_id: 1,
  slug: "intro-html",
  title: "Intro to HTML",
  content: "Some content",
  video_url: null,
  order: 1,
  deleted_at: null,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  creator: {
    display_name: "Jane Doe",
    roles: [{ name: "teacher", display_name: "Teacher" }],
    avatar: null,
  },
};

const sampleChallenge = {
  id: 1,
  module_id: null,
  lesson_id: 1,
  slug: "quiz-1",
  title: "Quiz 1",
  type: "multiple_choice" as const,
  difficulty: "easy" as const,
  content: "Test yourself",
  settings: null,
  metadata: null,
  max_score: 100,
  points: 10,
  allowed_attempts: 3,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  creator: {
    display_name: "Jane Doe",
    roles: [{ name: "teacher", display_name: "Teacher" }],
    avatar: null,
  },
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function renderPage() {
  return render(<TeacherContentPage />);
}

// ===========================================================================
// Tab structure
// ===========================================================================
describe("TeacherContentPage – tab structure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetTracks).mockReturnValue({
      tracks: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetModules).mockReturnValue({
      modules: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetLessons).mockReturnValue({
      lessons: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetChallenges).mockReturnValue({
      challenges: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("renders four resource tabs", () => {
    renderPage();
    expect(screen.getByRole("tab", { name: /tracks/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /modules/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /lessons/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /challenges/i }),
    ).toBeInTheDocument();
  });

  it("shows Add Track button in Tracks tab (default)", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /add track/i }),
    ).toBeInTheDocument();
  });

  it("shows Add Module button after switching to Modules tab", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("tab", { name: /modules/i }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add module/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows Add Lesson button after switching to Lessons tab", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("tab", { name: /lessons/i }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add lesson/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows Add Challenge button after switching to Challenges tab", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("tab", { name: /challenges/i }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add challenge/i }),
      ).toBeInTheDocument();
    });
  });

  it("never renders a Restore button or text", () => {
    renderPage();
    expect(
      screen.queryByRole("button", { name: /restore/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/restore/i)).not.toBeInTheDocument();
  });
});

// ===========================================================================
// Tracks tab – data, creator cell, soft-delete
// ===========================================================================
describe("Tracks tab – data, creator cell, and soft-delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetTracks).mockReturnValue({
      tracks: [sampleTrack] as any,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useDeleteTrack).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any);
    vi.mocked(useGetModules).mockReturnValue({
      modules: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetLessons).mockReturnValue({
      lessons: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetChallenges).mockReturnValue({
      challenges: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("renders the track title in the table", () => {
    renderPage();
    expect(screen.getByText("Web Fundamentals")).toBeInTheDocument();
  });

  it("renders creator display_name in the Tracks table", () => {
    renderPage();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("soft-delete confirmation button is labelled 'Soft delete'", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText("Web Fundamentals"));

    // hover to reveal the action menu button
    const row = screen.getByText("Web Fundamentals").closest("tr")!;
    await user.hover(row);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("menuitem", { name: /delete/i }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("menuitem", { name: /delete/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /soft delete/i }),
      ).toBeInTheDocument();
    });
  });

  it("delete confirmation does not offer a Restore action", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText("Web Fundamentals"));

    const row = screen.getByText("Web Fundamentals").closest("tr")!;
    await user.hover(row);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("menuitem", { name: /delete/i }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("menuitem", { name: /delete/i }));

    await waitFor(() => screen.getByRole("button", { name: /soft delete/i }));

    expect(
      screen.queryByRole("button", { name: /restore/i }),
    ).not.toBeInTheDocument();
  });

  it("confirming soft-delete calls deleteTrack.mutate with the track slug", async () => {
    const mutate = vi.fn();
    vi.mocked(useDeleteTrack).mockReturnValue({
      mutate,
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any);

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText("Web Fundamentals"));

    const row = screen.getByText("Web Fundamentals").closest("tr")!;
    await user.hover(row);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("menuitem", { name: /delete/i }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("menuitem", { name: /delete/i }));

    await waitFor(() => screen.getByRole("button", { name: /soft delete/i }));
    await user.click(screen.getByRole("button", { name: /soft delete/i }));

    expect(mutate).toHaveBeenCalledWith(sampleTrack.slug, expect.any(Object));
  });
});

// ===========================================================================
// Modules tab
// ===========================================================================
describe("Modules tab – data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetTracks).mockReturnValue({
      tracks: [sampleTrack] as any,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetModules).mockReturnValue({
      modules: [sampleModule] as any,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetLessons).mockReturnValue({
      lessons: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetChallenges).mockReturnValue({
      challenges: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("renders module title after switching to Modules tab", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("tab", { name: /modules/i }));
    await waitFor(() => {
      expect(screen.getByText("HTML Basics")).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// Lessons tab
// ===========================================================================
describe("Lessons tab – data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetTracks).mockReturnValue({
      tracks: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetModules).mockReturnValue({
      modules: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetLessons).mockReturnValue({
      lessons: [sampleLesson] as any,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetChallenges).mockReturnValue({
      challenges: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("renders lesson title after switching to Lessons tab", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("tab", { name: /lessons/i }));
    await waitFor(() => {
      expect(screen.getByText("Intro to HTML")).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// Challenges tab
// ===========================================================================
describe("Challenges tab – data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetTracks).mockReturnValue({
      tracks: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetModules).mockReturnValue({
      modules: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetLessons).mockReturnValue({
      lessons: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.mocked(useGetChallenges).mockReturnValue({
      challenges: [sampleChallenge] as any,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("renders challenge title after switching to Challenges tab", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("tab", { name: /challenges/i }));
    await waitFor(() => {
      expect(screen.getByText("Quiz 1")).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// CreatorBadge unit tests
// ===========================================================================
describe("CreatorBadge component", () => {
  it("renders display_name and role label", async () => {
    const { default: CreatorBadge } =
      await import("@/features/auth/teacher/creator-badge");
    render(
      <CreatorBadge
        creator={{
          display_name: "Alice Smith",
          roles: [{ name: "teacher", display_name: "Teacher" }],
          avatar: null,
        }}
      />,
    );
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Teacher")).toBeInTheDocument();
  });

  it("renders a dash when creator is null", async () => {
    const { default: CreatorBadge } =
      await import("@/features/auth/teacher/creator-badge");
    render(<CreatorBadge creator={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders initial avatar when no avatar URL is provided", async () => {
    const { default: CreatorBadge } =
      await import("@/features/auth/teacher/creator-badge");
    render(
      <CreatorBadge
        creator={{ display_name: "Bob Builder", roles: [], avatar: null }}
      />,
    );
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
