/**
 * Pure Vitest tests for teacher service query key factories and function signatures.
 * No DOM, no React, no real network calls — axios is mocked at module level.
 */

import { describe, expect, test, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock axios client — hoisted so the factory closure resolves correctly
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@/lib/axios", () => ({
  api: {
    get: mocks.get,
    post: mocks.post,
    put: mocks.put,
    patch: mocks.patch,
    delete: mocks.delete,
  },
}));

// Import after mock is established
import {
  teacherDashboard,
  teacherSubmissions,
  teacherSubmission,
  gradeSubmission,
  leaderboard,
  auditLogs,
  trackList,
  trackCreate,
  trackUpdate,
  trackDelete,
  moduleList,
  moduleCreate,
  moduleUpdate,
  moduleDelete,
  lessonList,
  lessonCreate,
  lessonUpdate,
  lessonDelete,
  challengeList,
  challengeCreate,
  challengeUpdate,
  challengeDelete,
} from "@/services/teacher";

import { teacherKeys } from "@/hooks/teacher";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal paginated response envelope */
function paginatedEnvelope<T>(items: T[] = []) {
  return {
    data: items,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: 1,
      last_page: 1,
      from: null,
      to: null,
      total: 0,
      per_page: 15,
    },
  };
}

/** Build a minimal ApiResponse envelope */
function apiEnvelope<T>(payload: T) {
  return { data: payload };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Query key factory tests
// ---------------------------------------------------------------------------

describe("teacherKeys", () => {
  test("all is a stable tuple", () => {
    expect(teacherKeys.all).toEqual(["teacher"]);
  });

  test("dashboard() includes all prefix and discriminator", () => {
    expect(teacherKeys.dashboard()).toEqual(["teacher", "dashboard"]);
  });

  test("submissions() with no args returns default empty filters", () => {
    const key = teacherKeys.submissions();
    expect(key[0]).toBe("teacher");
    expect(key[1]).toBe("submissions");
    expect(key[2]).toEqual({});
  });

  test("submissions() with filters embeds them in the key", () => {
    const key = teacherKeys.submissions({ status: "submitted", page: 2 });
    expect(key[2]).toEqual({ status: "submitted", page: 2 });
  });

  test("submission(id) encodes the id", () => {
    expect(teacherKeys.submission(42)).toEqual(["teacher", "submission", 42]);
  });

  test("leaderboard() with params embeds params", () => {
    const key = teacherKeys.leaderboard({ page: 3 });
    expect(key[1]).toBe("leaderboard");
    expect(key[2]).toEqual({ page: 3 });
  });

  test("leaderboard() without params defaults to {}", () => {
    expect(teacherKeys.leaderboard()[2]).toEqual({});
  });

  test("auditLogs() with params embeds params", () => {
    const key = teacherKeys.auditLogs({ action: "created" });
    expect(key[1]).toBe("audit-logs");
    expect(key[2]).toEqual({ action: "created" });
  });

  test("content keys include resource discriminator and params", () => {
    expect(teacherKeys.tracks({ page: 1 })[1]).toBe("tracks");
    expect(teacherKeys.modules()[1]).toBe("modules");
    expect(teacherKeys.lessons()[1]).toBe("lessons");
    expect(teacherKeys.challenges()[1]).toBe("challenges");
  });

  test("different params produce different keys for same resource", () => {
    const k1 = teacherKeys.submissions({ page: 1 });
    const k2 = teacherKeys.submissions({ page: 2 });
    expect(JSON.stringify(k1)).not.toBe(JSON.stringify(k2));
  });
});

// ---------------------------------------------------------------------------
// Service function — URL and method tests
// ---------------------------------------------------------------------------

describe("teacherDashboard", () => {
  test("calls GET /teacher/dashboard and unwraps data", async () => {
    const payload = { stats: {}, pending_submissions: [], leaderboard_preview: [] };
    mocks.get.mockResolvedValueOnce({ data: apiEnvelope(payload) });

    const result = await teacherDashboard();

    expect(mocks.get).toHaveBeenCalledOnce();
    expect(mocks.get).toHaveBeenCalledWith("/teacher/dashboard");
    expect(result).toBe(payload);
  });
});

describe("teacherSubmissions", () => {
  test("calls GET /teacher/submissions with no params", async () => {
    const envelope = paginatedEnvelope();
    mocks.get.mockResolvedValueOnce({ data: envelope });

    const result = await teacherSubmissions();

    expect(mocks.get).toHaveBeenCalledWith("/teacher/submissions", { params: undefined });
    expect(result).toBe(envelope);
  });

  test("forwards filters as query params", async () => {
    mocks.get.mockResolvedValueOnce({ data: paginatedEnvelope() });
    const filters = { status: "submitted" as const, page: 2 };

    await teacherSubmissions(filters);

    expect(mocks.get).toHaveBeenCalledWith("/teacher/submissions", { params: filters });
  });

  test("response preserves meta pagination object", async () => {
    const envelope = paginatedEnvelope([{ id: 1 }]);
    mocks.get.mockResolvedValueOnce({ data: envelope });

    const result = await teacherSubmissions();

    expect(result.meta).toBeDefined();
    expect(result.meta.current_page).toBe(1);
  });
});

describe("teacherSubmission", () => {
  test("calls GET /submissions/:id and unwraps data", async () => {
    const sub = { id: 7 };
    mocks.get.mockResolvedValueOnce({ data: apiEnvelope(sub) });

    const result = await teacherSubmission(7);

    expect(mocks.get).toHaveBeenCalledWith("/submissions/7");
    expect(result).toBe(sub);
  });
});

describe("gradeSubmission", () => {
  test("calls PATCH /submissions/:id with grade data and unwraps", async () => {
    const sub = { id: 5, score: 90 };
    mocks.patch.mockResolvedValueOnce({ data: apiEnvelope(sub) });

    const result = await gradeSubmission(5, { score: 90, status: "graded" });

    expect(mocks.patch).toHaveBeenCalledWith("/submissions/5", { score: 90, status: "graded" });
    expect(result).toBe(sub);
  });
});

describe("leaderboard", () => {
  test("calls GET /leaderboard and returns paginated response", async () => {
    const envelope = paginatedEnvelope();
    mocks.get.mockResolvedValueOnce({ data: envelope });

    const result = await leaderboard();

    expect(mocks.get).toHaveBeenCalledWith("/leaderboard", { params: undefined });
    expect(result).toBe(envelope);
  });

  test("forwards params to GET /leaderboard", async () => {
    mocks.get.mockResolvedValueOnce({ data: paginatedEnvelope() });
    await leaderboard({ page: 2, study_class_id: 3 });

    expect(mocks.get).toHaveBeenCalledWith("/leaderboard", {
      params: { page: 2, study_class_id: 3 },
    });
  });
});

describe("auditLogs", () => {
  test("calls GET /audits and returns paginated response", async () => {
    const envelope = paginatedEnvelope();
    mocks.get.mockResolvedValueOnce({ data: envelope });

    const result = await auditLogs();

    expect(mocks.get).toHaveBeenCalledWith("/audits", { params: undefined });
    expect(result).toBe(envelope);
  });

  test("forwards filter params", async () => {
    mocks.get.mockResolvedValueOnce({ data: paginatedEnvelope() });
    await auditLogs({ action: "deleted", page: 1 });

    expect(mocks.get).toHaveBeenCalledWith("/audits", {
      params: { action: "deleted", page: 1 },
    });
  });
});

// ---------------------------------------------------------------------------
// Content CRUD — URL and method assertions
// ---------------------------------------------------------------------------

describe("track CRUD", () => {
  test("trackList calls GET /tracks with pagination flag", async () => {
    mocks.get.mockResolvedValueOnce({ data: paginatedEnvelope() });
    await trackList({ page: 1 });

    expect(mocks.get).toHaveBeenCalledWith("/tracks", {
      params: { page: 1, pagination: true },
    });
  });

  test("trackCreate calls POST /tracks and unwraps", async () => {
    const track = { id: 1, slug: "intro" };
    mocks.post.mockResolvedValueOnce({ data: apiEnvelope(track) });

    const result = await trackCreate({
      slug: "intro",
      title: "Intro",
      image_url: "",
      description: "",
      order: null,
    });

    expect(mocks.post).toHaveBeenCalledWith("/tracks", expect.objectContaining({ slug: "intro" }));
    expect(result).toBe(track);
  });

  test("trackUpdate calls PUT /tracks/:slug and unwraps", async () => {
    const track = { id: 1, slug: "intro" };
    mocks.put.mockResolvedValueOnce({ data: apiEnvelope(track) });

    await trackUpdate("intro", {
      slug: "intro",
      title: "Intro",
      image_url: "",
      description: "",
      order: null,
    });

    expect(mocks.put).toHaveBeenCalledWith("/tracks/intro", expect.any(Object));
  });

  test("trackDelete calls DELETE /tracks/:slug", async () => {
    mocks.delete.mockResolvedValueOnce({});
    await trackDelete("intro");

    expect(mocks.delete).toHaveBeenCalledWith("/tracks/intro");
  });
});

describe("module CRUD", () => {
  test("moduleList calls GET /modules with pagination flag", async () => {
    mocks.get.mockResolvedValueOnce({ data: paginatedEnvelope() });
    await moduleList();

    expect(mocks.get).toHaveBeenCalledWith("/modules", {
      params: { pagination: true },
    });
  });

  test("moduleCreate calls POST /modules", async () => {
    const mod = { id: 1, slug: "mod-1" };
    mocks.post.mockResolvedValueOnce({ data: apiEnvelope(mod) });

    await moduleCreate({ track_id: 1, slug: "mod-1", title: "Mod 1", order: null });

    expect(mocks.post).toHaveBeenCalledWith("/modules", expect.objectContaining({ slug: "mod-1" }));
  });

  test("moduleUpdate calls PUT /modules/:slug", async () => {
    mocks.put.mockResolvedValueOnce({ data: apiEnvelope({ id: 1 }) });
    await moduleUpdate("mod-1", { track_id: 1, slug: "mod-1", title: "Mod 1", order: null });

    expect(mocks.put).toHaveBeenCalledWith("/modules/mod-1", expect.any(Object));
  });

  test("moduleDelete calls DELETE /modules/:slug", async () => {
    mocks.delete.mockResolvedValueOnce({});
    await moduleDelete("mod-1");

    expect(mocks.delete).toHaveBeenCalledWith("/modules/mod-1");
  });
});

describe("lesson CRUD", () => {
  test("lessonList calls GET /lessons with pagination flag", async () => {
    mocks.get.mockResolvedValueOnce({ data: paginatedEnvelope() });
    await lessonList();

    expect(mocks.get).toHaveBeenCalledWith("/lessons", {
      params: { pagination: true },
    });
  });

  test("lessonCreate calls POST /lessons", async () => {
    mocks.post.mockResolvedValueOnce({ data: apiEnvelope({ id: 1 }) });
    await lessonCreate({
      module_id: 1,
      title: "Lesson 1",
      slug: "lesson-1",
      content: "",
      video_url: null,
      order: null,
    });

    expect(mocks.post).toHaveBeenCalledWith("/lessons", expect.objectContaining({ slug: "lesson-1" }));
  });

  test("lessonUpdate calls PUT /lessons/:slug", async () => {
    mocks.put.mockResolvedValueOnce({ data: apiEnvelope({ id: 1 }) });
    await lessonUpdate("lesson-1", {
      module_id: 1,
      title: "Lesson 1",
      slug: "lesson-1",
      content: "",
      video_url: null,
      order: null,
    });

    expect(mocks.put).toHaveBeenCalledWith("/lessons/lesson-1", expect.any(Object));
  });

  test("lessonDelete calls DELETE /lessons/:slug", async () => {
    mocks.delete.mockResolvedValueOnce({});
    await lessonDelete("lesson-1");

    expect(mocks.delete).toHaveBeenCalledWith("/lessons/lesson-1");
  });
});

describe("challenge CRUD", () => {
  test("challengeList calls GET /challenges with pagination flag", async () => {
    mocks.get.mockResolvedValueOnce({ data: paginatedEnvelope() });
    await challengeList();

    expect(mocks.get).toHaveBeenCalledWith("/challenges", {
      params: { pagination: true },
    });
  });

  test("challengeCreate calls POST /challenges", async () => {
    mocks.post.mockResolvedValueOnce({ data: apiEnvelope({ id: 1 }) });
    await challengeCreate({
      module_id: null,
      lesson_id: null,
      title: "Q1",
      slug: "q1",
      type: "essay",
      content: "",
      settings: null,
      metadata: null,
      max_score: 100,
      allowed_attempts: null,
    });

    expect(mocks.post).toHaveBeenCalledWith("/challenges", expect.objectContaining({ slug: "q1" }));
  });

  test("challengeUpdate calls PUT /challenges/:id", async () => {
    mocks.put.mockResolvedValueOnce({ data: apiEnvelope({ id: 3 }) });
    await challengeUpdate(3, {
      module_id: null,
      lesson_id: null,
      title: "Q1",
      slug: "q1",
      type: "essay",
      content: "",
      settings: null,
      metadata: null,
      max_score: 100,
      allowed_attempts: null,
    });

    expect(mocks.put).toHaveBeenCalledWith("/challenges/3", expect.any(Object));
  });

  test("challengeDelete calls DELETE /challenges/:id", async () => {
    mocks.delete.mockResolvedValueOnce({});
    await challengeDelete(3);

    expect(mocks.delete).toHaveBeenCalledWith("/challenges/3");
  });
});
