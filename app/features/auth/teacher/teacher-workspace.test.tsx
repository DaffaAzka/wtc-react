/**
 * Teacher workspace component tests — Task 7
 *
 * Tests cover: loading / error / empty / populated states for the dashboard,
 * submissions index, and submission detail pages; stat cards; pending queue;
 * grading form validation; mutation success flow; absence of restore controls.
 *
 * Strategy: mock @/hooks/teacher at module level; mock react-router
 * primitives (Link, useParams, useSearchParams); render with a minimal
 * QueryClientProvider wrapper.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => ({
  useTeacherDashboard: vi.fn(),
  useTeacherSubmissions: vi.fn(),
  useTeacherSubmission: vi.fn(),
  useGradeSubmission: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
  navigate: vi.fn(),
  searchParams: new URLSearchParams(),
  setSearchParams: vi.fn(),
}));

vi.mock("@/hooks/teacher", () => ({
  useTeacherDashboard: mocks.useTeacherDashboard,
  useTeacherSubmissions: mocks.useTeacherSubmissions,
  useTeacherSubmission: mocks.useTeacherSubmission,
  useGradeSubmission: mocks.useGradeSubmission,
}));

vi.mock("sonner", () => ({
  toast: mocks.toast,
}));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    Link: ({ to, children, ...props }: { to: string; children: ReactNode; [k: string]: unknown }) => (
      <a href={String(to)} {...props}>
        {children}
      </a>
    ),
    useParams: () => ({ id: "42" }),
    useSearchParams: () => [mocks.searchParams, mocks.setSearchParams],
    useNavigate: () => mocks.navigate,
  };
});

// ---------------------------------------------------------------------------
// Imports — after mocks
// ---------------------------------------------------------------------------

import { DashboardStats, DashboardStatsSkeleton, STAT_ITEMS } from "./dashboard-stats";
import { SubmissionQueue, SubmissionQueueSkeleton } from "./submission-queue";
import { GradingPanel } from "./grading-panel";
import TeacherDashboardPage from "@/routes/auth/teacher/dashboard";
import TeacherSubmissionsIndexPage from "@/routes/auth/teacher/submissions/index";
import TeacherSubmissionDetailPage from "@/routes/auth/teacher/submissions/$id";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const STATS = {
  total_students: 42,
  total_tracks: 5,
  total_lessons: 30,
  total_challenges: 20,
  pending_submissions: 7,
};

const makeSub = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  status: "submitted" as const,
  score: null,
  feedback: null,
  submitted_at: "2026-08-01T10:00:00Z",
  created_at: "2026-07-31T08:00:00Z",
  updated_at: "2026-08-01T10:00:00Z",
  challenge: { id: 10, title: "Intro Essay", slug: "intro-essay", type: "essay", max_score: 100 },
  profile: { id: 3, display_name: "Alice", avatar: null, roles: [{ name: "student" }] },
  ...overrides,
});

const SUBMISSION = makeSub();

const GRADED_SUB = makeSub({ id: 2, status: "graded", score: 85, feedback: "Well done." });

const LEADERBOARD_ENTRY = {
  rank: 1,
  profile_id: 3,
  display_name: "Alice",
  avatar: null,
  points: 500,
  study_class_id: null,
};

const DASHBOARD_DATA = {
  stats: STATS,
  pending_submissions: [SUBMISSION],
  leaderboard_preview: [LEADERBOARD_ENTRY],
};

const PAGINATED = (items: unknown[]) => ({
  data: items,
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, last_page: 1, from: 1, to: items.length, total: items.length, per_page: 20 },
});

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function renderWith(ui: ReactNode) {
  return render(<Wrapper>{ui}</Wrapper>);
}

// ---------------------------------------------------------------------------
// Reset mocks
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mocks.searchParams = new URLSearchParams();
});

// ===========================================================================
// DashboardStats unit
// ===========================================================================

describe("DashboardStats", () => {
  test("renders all five stat values", () => {
    renderWith(<DashboardStats stats={STATS} />);

    expect(screen.getByText("42")).toBeInTheDocument(); // total_students
    expect(screen.getByText("5")).toBeInTheDocument();  // total_tracks
    expect(screen.getByText("30")).toBeInTheDocument(); // total_lessons
    expect(screen.getByText("20")).toBeInTheDocument(); // total_challenges
    expect(screen.getByText("7")).toBeInTheDocument();  // pending_submissions
  });

  test("renders expected stat labels", () => {
    renderWith(<DashboardStats stats={STATS} />);
    STAT_ITEMS.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test("skeleton renders five placeholder cards", () => {
    const { container } = renderWith(<DashboardStatsSkeleton />);
    // Each card has 3 skeletons → 15 total
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBe(15);
  });
});

// ===========================================================================
// SubmissionQueue unit
// ===========================================================================

describe("SubmissionQueue", () => {
  test("shows empty message when no submissions", () => {
    renderWith(<SubmissionQueue submissions={[]} />);
    expect(screen.getByText(/no pending submissions/i)).toBeInTheDocument();
  });

  test("renders student name, challenge title, and score columns", () => {
    renderWith(<SubmissionQueue submissions={[SUBMISSION]} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Intro Essay")).toBeInTheDocument();
    // Score: null → "— / 100"
    expect(screen.getByText(/—\s*\/\s*100/)).toBeInTheDocument();
  });

  test("links each row to /teacher/submissions/:id", () => {
    renderWith(<SubmissionQueue submissions={[SUBMISSION]} />);
    const links = screen.getAllByRole("link");
    const subLinks = links.filter((l) => l.getAttribute("href") === "/teacher/submissions/1");
    expect(subLinks.length).toBeGreaterThan(0);
  });

  test("preview mode limits to 5 rows", () => {
    const subs = Array.from({ length: 10 }, (_, i) => makeSub({ id: i + 1 }));
    renderWith(<SubmissionQueue submissions={subs} preview />);

    const rows = screen.getAllByRole("row");
    // 1 header row + 5 data rows
    expect(rows.length).toBe(6);
  });

  test("displays formatted submitted date", () => {
    renderWith(<SubmissionQueue submissions={[SUBMISSION]} />);
    // Date is locale-formatted; just assert it's not "—"
    const cells = screen.getAllByRole("cell");
    const dateCells = cells.filter((c) => c.textContent && /2026/.test(c.textContent));
    expect(dateCells.length).toBeGreaterThan(0);
  });

  test("does NOT render any restore button", () => {
    renderWith(<SubmissionQueue submissions={[SUBMISSION]} />);
    expect(screen.queryByRole("button", { name: /restore/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/restore/i)).not.toBeInTheDocument();
  });

  test("skeleton renders expected row count", () => {
    renderWith(<SubmissionQueueSkeleton rows={4} />);
    const rows = screen.getAllByRole("row");
    // 1 header + 4 skeleton rows
    expect(rows.length).toBe(5);
  });
});

// ===========================================================================
// GradingPanel unit
// ===========================================================================

describe("GradingPanel", () => {
  function setupMutation(options: { isPending?: boolean; error?: unknown } = {}) {
    const mutate = vi.fn();
    mocks.useGradeSubmission.mockReturnValue({
      mutate,
      isPending: options.isPending ?? false,
      error: options.error ?? null,
    });
    return mutate;
  }

  test("renders score, status, and feedback controls", () => {
    setupMutation();
    renderWith(<GradingPanel submission={SUBMISSION} />);

    expect(screen.getByLabelText(/score/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/feedback/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save grade/i })).toBeInTheDocument();
  });

  test("pre-fills score and feedback from graded submission", () => {
    setupMutation();
    renderWith(<GradingPanel submission={GRADED_SUB} />);

    const scoreInput = screen.getByLabelText(/score/i) as HTMLInputElement;
    expect(scoreInput.value).toBe("85");

    const feedbackField = screen.getByLabelText(/feedback/i) as HTMLTextAreaElement;
    expect(feedbackField.value).toBe("Well done.");
  });

  test("shows validation error for score above max", () => {
    setupMutation();
    renderWith(<GradingPanel submission={SUBMISSION} />);

    const scoreInput = screen.getByLabelText(/score/i);
    fireEvent.change(scoreInput, { target: { value: "999" } });

    expect(screen.getByText(/score must be between 0 and 100/i)).toBeInTheDocument();
  });

  test("disables submit button while pending", () => {
    setupMutation({ isPending: true });
    renderWith(<GradingPanel submission={SUBMISSION} />);

    expect(screen.getByRole("button", { name: /save grade/i })).toBeDisabled();
  });

  test("calls mutate with correct payload on submit", async () => {
    const mutate = setupMutation();
    renderWith(<GradingPanel submission={SUBMISSION} />);

    const scoreInput = screen.getByLabelText(/score/i);
    fireEvent.change(scoreInput, { target: { value: "90" } });

    fireEvent.submit(screen.getByRole("button", { name: /save grade/i }).closest("form")!);

    expect(mutate).toHaveBeenCalledWith(
      { id: 1, data: expect.objectContaining({ score: 90, status: "graded" }) },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  test("displays server error message", () => {
    setupMutation({ error: { message: "Unauthorized", errors: null } });
    renderWith(<GradingPanel submission={SUBMISSION} />);

    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });

  test("mutation onSuccess fires toast.success", async () => {
    let capturedCallbacks: { onSuccess?: (r: unknown) => void; onError?: (e: unknown) => void } = {};
    mocks.useGradeSubmission.mockReturnValue({
      mutate: (_args: unknown, cbs: typeof capturedCallbacks) => { capturedCallbacks = cbs; },
      isPending: false,
      error: null,
    });

    renderWith(<GradingPanel submission={SUBMISSION} />);
    fireEvent.submit(screen.getByRole("button", { name: /save grade/i }).closest("form")!);

    capturedCallbacks.onSuccess?.({});
    expect(mocks.toast.success).toHaveBeenCalled();
  });

  test("mutation onError fires toast.error", async () => {
    let capturedCallbacks: { onSuccess?: (r: unknown) => void; onError?: (e: unknown) => void } = {};
    mocks.useGradeSubmission.mockReturnValue({
      mutate: (_args: unknown, cbs: typeof capturedCallbacks) => { capturedCallbacks = cbs; },
      isPending: false,
      error: null,
    });

    renderWith(<GradingPanel submission={SUBMISSION} />);
    fireEvent.submit(screen.getByRole("button", { name: /save grade/i }).closest("form")!);

    capturedCallbacks.onError?.({ message: "Server error" });
    expect(mocks.toast.error).toHaveBeenCalled();
  });

  test("does NOT render any restore button", () => {
    setupMutation();
    renderWith(<GradingPanel submission={SUBMISSION} />);
    expect(screen.queryByRole("button", { name: /restore/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/restore/i)).not.toBeInTheDocument();
  });
});

// ===========================================================================
// TeacherDashboardPage
// ===========================================================================

describe("TeacherDashboardPage", () => {
  test("shows loading skeletons while pending", () => {
    mocks.useTeacherDashboard.mockReturnValue({ data: undefined, isPending: true, isError: false });
    const { container } = renderWith(<TeacherDashboardPage />);
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("shows error alert on failure", () => {
    mocks.useTeacherDashboard.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: { message: "Network error" },
    });
    renderWith(<TeacherDashboardPage />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  test("renders stat cards when loaded", () => {
    mocks.useTeacherDashboard.mockReturnValue({
      data: DASHBOARD_DATA,
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherDashboardPage />);

    expect(screen.getByText("42")).toBeInTheDocument(); // students
    expect(screen.getByText("7")).toBeInTheDocument();  // pending
  });

  test("renders pending queue preview rows", () => {
    mocks.useTeacherDashboard.mockReturnValue({
      data: DASHBOARD_DATA,
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherDashboardPage />);
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Intro Essay").length).toBeGreaterThan(0);
  });

  test("renders leaderboard preview", () => {
    mocks.useTeacherDashboard.mockReturnValue({
      data: DASHBOARD_DATA,
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherDashboardPage />);
    expect(screen.getByText("500")).toBeInTheDocument(); // points
  });

  test("shows 'No leaderboard data' when preview is empty", () => {
    mocks.useTeacherDashboard.mockReturnValue({
      data: { ...DASHBOARD_DATA, leaderboard_preview: [] },
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherDashboardPage />);
    expect(screen.getByText(/no leaderboard data/i)).toBeInTheDocument();
  });

  test("does NOT render any restore control", () => {
    mocks.useTeacherDashboard.mockReturnValue({
      data: DASHBOARD_DATA,
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherDashboardPage />);
    expect(screen.queryByRole("button", { name: /restore/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/restore/i)).not.toBeInTheDocument();
  });
});

// ===========================================================================
// TeacherSubmissionsIndexPage
// ===========================================================================

describe("TeacherSubmissionsIndexPage", () => {
  test("shows skeleton while loading", () => {
    mocks.useTeacherSubmissions.mockReturnValue({ data: undefined, isPending: true, isError: false });
    const { container } = renderWith(<TeacherSubmissionsIndexPage />);
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("shows error alert on failure", () => {
    mocks.useTeacherSubmissions.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: { message: "Forbidden" },
    });
    renderWith(<TeacherSubmissionsIndexPage />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/forbidden/i)).toBeInTheDocument();
  });

  test("shows empty state when no results", () => {
    mocks.useTeacherSubmissions.mockReturnValue({
      data: PAGINATED([]),
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherSubmissionsIndexPage />);
    expect(screen.getByText(/no submissions match/i)).toBeInTheDocument();
  });

  test("renders submission rows with student, challenge, and score", () => {
    mocks.useTeacherSubmissions.mockReturnValue({
      data: PAGINATED([SUBMISSION]),
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherSubmissionsIndexPage />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Intro Essay")).toBeInTheDocument();
    expect(screen.getByText(/—\s*\/\s*100/)).toBeInTheDocument();
  });

  test("row challenge title links to detail page", () => {
    mocks.useTeacherSubmissions.mockReturnValue({
      data: PAGINATED([SUBMISSION]),
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherSubmissionsIndexPage />);

    const link = screen.getByRole("link", { name: "Intro Essay" });
    expect(link.getAttribute("href")).toBe("/teacher/submissions/1");
  });

  test("renders filter controls (status, challenge id, profile id)", () => {
    mocks.useTeacherSubmissions.mockReturnValue({
      data: PAGINATED([]),
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherSubmissionsIndexPage />);

    expect(screen.getAllByText(/status/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/challenge id/i)).toBeInTheDocument();
    expect(screen.getByText(/profile id/i)).toBeInTheDocument();
  });

  test("does NOT render any restore control", () => {
    mocks.useTeacherSubmissions.mockReturnValue({
      data: PAGINATED([SUBMISSION]),
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherSubmissionsIndexPage />);
    expect(screen.queryByRole("button", { name: /restore/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/restore/i)).not.toBeInTheDocument();
  });

  test("passes filters from URL search params to hook", () => {
    mocks.searchParams = new URLSearchParams("status=submitted&page=2");
    mocks.useTeacherSubmissions.mockReturnValue({
      data: PAGINATED([]),
      isPending: false,
      isError: false,
    });
    renderWith(<TeacherSubmissionsIndexPage />);

    expect(mocks.useTeacherSubmissions).toHaveBeenCalledWith(
      expect.objectContaining({ status: "submitted", page: 2 })
    );
  });
});

// ===========================================================================
// TeacherSubmissionDetailPage
// ===========================================================================

describe("TeacherSubmissionDetailPage", () => {
  function setupGrade(options: { isPending?: boolean; error?: unknown } = {}) {
    mocks.useGradeSubmission.mockReturnValue({
      mutate: vi.fn(),
      isPending: options.isPending ?? false,
      error: options.error ?? null,
    });
  }

  test("shows loading skeleton while pending", () => {
    mocks.useTeacherSubmission.mockReturnValue({ data: undefined, isPending: true, isError: false });
    setupGrade();
    const { container } = renderWith(<TeacherSubmissionDetailPage />);
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("shows error alert on failure", () => {
    mocks.useTeacherSubmission.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: { message: "Not found" },
    });
    setupGrade();
    renderWith(<TeacherSubmissionDetailPage />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  test("renders submission info fields when loaded", () => {
    mocks.useTeacherSubmission.mockReturnValue({
      data: SUBMISSION,
      isPending: false,
      isError: false,
    });
    setupGrade();
    renderWith(<TeacherSubmissionDetailPage />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Intro Essay")).toBeInTheDocument();
    // score — / 100 appears in the info card
    expect(screen.getAllByText(/—\s*\/\s*100/).length).toBeGreaterThan(0);
  });

  test("renders grading form controls", () => {
    mocks.useTeacherSubmission.mockReturnValue({
      data: SUBMISSION,
      isPending: false,
      isError: false,
    });
    setupGrade();
    renderWith(<TeacherSubmissionDetailPage />);

    expect(screen.getByLabelText(/score/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/feedback/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save grade/i })).toBeInTheDocument();
  });

  test("displays existing feedback when present", () => {
    mocks.useTeacherSubmission.mockReturnValue({
      data: GRADED_SUB,
      isPending: false,
      isError: false,
    });
    setupGrade();
    renderWith(<TeacherSubmissionDetailPage />);
    // "Well done." appears in both current feedback panel and pre-filled textarea
    const els = screen.getAllByText(/well done/i);
    expect(els.length).toBeGreaterThan(0);
  });

  test("uses submission id from URL params", () => {
    mocks.useTeacherSubmission.mockReturnValue({
      data: SUBMISSION,
      isPending: false,
      isError: false,
    });
    setupGrade();
    renderWith(<TeacherSubmissionDetailPage />);
    // useParams returns { id: "42" } → hook called with 42
    expect(mocks.useTeacherSubmission).toHaveBeenCalledWith(42);
  });

  test("does NOT render any restore control", () => {
    mocks.useTeacherSubmission.mockReturnValue({
      data: SUBMISSION,
      isPending: false,
      isError: false,
    });
    setupGrade();
    renderWith(<TeacherSubmissionDetailPage />);
    expect(screen.queryByRole("button", { name: /restore/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/restore/i)).not.toBeInTheDocument();
  });

  test("renders back link to submissions index", () => {
    mocks.useTeacherSubmission.mockReturnValue({
      data: SUBMISSION,
      isPending: false,
      isError: false,
    });
    setupGrade();
    renderWith(<TeacherSubmissionDetailPage />);
    const backLink = screen.getByRole("link", { name: /all submissions/i });
    expect(backLink.getAttribute("href")).toBe("/teacher/submissions");
  });
});
