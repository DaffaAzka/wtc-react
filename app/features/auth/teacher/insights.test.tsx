/**
 * Teacher insights tests — leaderboard and audit-log components.
 *
 * These tests exercise the pure utility functions exported from
 * leaderboard-table.tsx and audit-log-table.tsx. No DOM or React is needed
 * because all display/filter/pagination logic is expressed as plain functions.
 */

import { describe, expect, test } from "vitest";

import {
  rankBadgeConfig,
  formatPeriodLabel,
  buildLeaderboardParams,
} from "@/features/auth/teacher/leaderboard-table";

import {
  actionBadgeConfig,
  roleBadgeVariant,
  formatChangedFields,
  formatTimestamp,
} from "@/features/auth/teacher/audit-log-table";

// ---------------------------------------------------------------------------
// Leaderboard — rankBadgeConfig
// ---------------------------------------------------------------------------

describe("rankBadgeConfig", () => {
  test("rank 1 gets gold-yellow styling and #1 label", () => {
    const cfg = rankBadgeConfig(1);
    expect(cfg.label).toBe("#1");
    expect(cfg.className).toMatch(/yellow/);
  });

  test("rank 2 gets silver-slate styling and #2 label", () => {
    const cfg = rankBadgeConfig(2);
    expect(cfg.label).toBe("#2");
    expect(cfg.className).toMatch(/slate/);
  });

  test("rank 3 gets bronze-amber styling and #3 label", () => {
    const cfg = rankBadgeConfig(3);
    expect(cfg.label).toBe("#3");
    expect(cfg.className).toMatch(/amber/);
  });

  test("rank 4+ uses neutral muted styling with #N label", () => {
    const cfg4 = rankBadgeConfig(4);
    expect(cfg4.label).toBe("#4");
    expect(cfg4.className).toMatch(/muted/);

    const cfg99 = rankBadgeConfig(99);
    expect(cfg99.label).toBe("#99");
  });

  test("rank badge label always matches the input rank", () => {
    for (const n of [1, 2, 3, 10, 50, 100]) {
      expect(rankBadgeConfig(n).label).toBe(`#${n}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Leaderboard — formatPeriodLabel
// ---------------------------------------------------------------------------

describe("formatPeriodLabel", () => {
  test("all-time returns 'All Time'", () => {
    expect(formatPeriodLabel("all-time")).toBe("All Time");
  });

  test("monthly returns 'Monthly'", () => {
    expect(formatPeriodLabel("monthly")).toBe("Monthly");
  });

  test("weekly returns 'Weekly'", () => {
    expect(formatPeriodLabel("weekly")).toBe("Weekly");
  });
});

// ---------------------------------------------------------------------------
// Leaderboard — buildLeaderboardParams
// ---------------------------------------------------------------------------

describe("buildLeaderboardParams", () => {
  test("period is forwarded into params", () => {
    expect(buildLeaderboardParams({ period: "weekly", classId: null, page: 1 }).period).toBe("weekly");
    expect(buildLeaderboardParams({ period: "monthly", classId: null, page: 1 }).period).toBe("monthly");
    expect(buildLeaderboardParams({ period: "all-time", classId: null, page: 1 }).period).toBe("all-time");
  });

  test("page is forwarded into params", () => {
    const p = buildLeaderboardParams({ period: "weekly", classId: null, page: 3 });
    expect(p.page).toBe(3);
  });

  test("study_class_id is set when classId is not null", () => {
    const p = buildLeaderboardParams({ period: "all-time", classId: 5, page: 1 });
    expect(p.study_class_id).toBe(5);
  });

  test("study_class_id is absent when classId is null (no spurious key)", () => {
    const p = buildLeaderboardParams({ period: "all-time", classId: null, page: 1 });
    expect("study_class_id" in p).toBe(false);
  });

  test("default per_page is 15", () => {
    const p = buildLeaderboardParams({ period: "all-time", classId: null, page: 1 });
    expect(p.per_page).toBe(15);
  });

  test("custom perPage overrides the default", () => {
    const p = buildLeaderboardParams({ period: "all-time", classId: null, page: 1, perPage: 25 });
    expect(p.per_page).toBe(25);
  });

  test("different pages produce distinct param objects", () => {
    const p1 = buildLeaderboardParams({ period: "weekly", classId: null, page: 1 });
    const p2 = buildLeaderboardParams({ period: "weekly", classId: null, page: 2 });
    expect(JSON.stringify(p1)).not.toBe(JSON.stringify(p2));
  });
});

// ---------------------------------------------------------------------------
// Audit logs — actionBadgeConfig
// ---------------------------------------------------------------------------

describe("actionBadgeConfig", () => {
  test("created action gets green styling", () => {
    const cfg = actionBadgeConfig("created");
    expect(cfg.label).toBe("created");
    expect(cfg.className).toMatch(/green/);
  });

  test("updated action gets blue styling", () => {
    const cfg = actionBadgeConfig("updated");
    expect(cfg.label).toBe("updated");
    expect(cfg.className).toMatch(/blue/);
  });

  test("deleted action gets red styling", () => {
    const cfg = actionBadgeConfig("deleted");
    expect(cfg.label).toBe("deleted");
    expect(cfg.className).toMatch(/red/);
  });

  test("restored action gets purple styling", () => {
    const cfg = actionBadgeConfig("restored");
    expect(cfg.label).toBe("restored");
    expect(cfg.className).toMatch(/purple/);
  });

  test("unknown action gets muted styling with original label preserved", () => {
    const cfg = actionBadgeConfig("archived");
    expect(cfg.label).toBe("archived");
    expect(cfg.className).toMatch(/muted/);
  });

  test("action matching is case-insensitive", () => {
    expect(actionBadgeConfig("CREATED").className).toMatch(/green/);
    expect(actionBadgeConfig("Deleted").className).toMatch(/red/);
  });
});

// ---------------------------------------------------------------------------
// Audit logs — roleBadgeVariant
// ---------------------------------------------------------------------------

describe("roleBadgeVariant", () => {
  test("admin role returns default variant", () => {
    expect(roleBadgeVariant("admin")).toBe("default");
    expect(roleBadgeVariant("ADMIN")).toBe("default");
  });

  test("teacher role returns secondary variant", () => {
    expect(roleBadgeVariant("teacher")).toBe("secondary");
    expect(roleBadgeVariant("Teacher")).toBe("secondary");
  });

  test("student and other roles return outline variant", () => {
    expect(roleBadgeVariant("student")).toBe("outline");
    expect(roleBadgeVariant("moderator")).toBe("outline");
    expect(roleBadgeVariant("")).toBe("outline");
  });
});

// ---------------------------------------------------------------------------
// Audit logs — formatChangedFields
// ---------------------------------------------------------------------------

describe("formatChangedFields", () => {
  test("null changed_fields returns em-dash", () => {
    expect(formatChangedFields(null)).toBe("—");
  });

  test("empty object returns em-dash", () => {
    expect(formatChangedFields({})).toBe("—");
  });

  test("single field returns that field name", () => {
    expect(formatChangedFields({ title: "old title" })).toBe("title");
  });

  test("multiple fields returns comma-separated key names", () => {
    const result = formatChangedFields({ title: "x", description: "y", order: 1 });
    expect(result).toContain("title");
    expect(result).toContain("description");
    expect(result).toContain("order");
    expect(result.split(",")).toHaveLength(3);
  });

  test("does not expose field values — only key names in output", () => {
    const result = formatChangedFields({ password: "secret123" });
    expect(result).toBe("password");
    expect(result).not.toContain("secret123");
  });
});

// ---------------------------------------------------------------------------
// Audit logs — formatTimestamp
// ---------------------------------------------------------------------------

describe("formatTimestamp", () => {
  test("returns a non-empty string for valid ISO timestamps", () => {
    const result = formatTimestamp("2026-08-27T10:30:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("includes the year for valid timestamps", () => {
    const result = formatTimestamp("2026-08-27T10:30:00.000Z");
    expect(result).toContain("2026");
  });

  test("returns the raw string unchanged for invalid input", () => {
    expect(formatTimestamp("not-a-date")).toBe("not-a-date");
  });

  test("two different timestamps produce different output", () => {
    const t1 = formatTimestamp("2026-01-01T00:00:00.000Z");
    const t2 = formatTimestamp("2026-12-31T23:59:00.000Z");
    expect(t1).not.toBe(t2);
  });
});

// ---------------------------------------------------------------------------
// Exclusion assertions — fields that must NOT appear in the teacher UI
// ---------------------------------------------------------------------------

describe("teacher insights — excluded fields guard", () => {
  test("leaderboard buildLeaderboardParams never includes email, ip, user_agent, or restore", () => {
    const params = buildLeaderboardParams({ period: "weekly", classId: 1, page: 1 });
    const keys = Object.keys(params);
    expect(keys).not.toContain("email");
    expect(keys).not.toContain("ip");
    expect(keys).not.toContain("user_agent");
    expect(keys).not.toContain("restore");
  });

  test("audit log formatChangedFields output never contains email or ip values from changed data", () => {
    // The function only exposes key names, never values — this guards against
    // accidentally rendering PII field values.
    const result = formatChangedFields({ email: "secret@example.com", ip: "192.168.1.1" });
    expect(result).not.toContain("secret@example.com");
    expect(result).not.toContain("192.168.1.1");
    // key names themselves (email, ip) appear — that's acceptable metadata
    expect(result).toContain("email");
    expect(result).toContain("ip");
  });
});

// ---------------------------------------------------------------------------
// Pagination boundary conditions
// ---------------------------------------------------------------------------

describe("leaderboard pagination params", () => {
  test("page 1 is the minimum and is passed through", () => {
    const p = buildLeaderboardParams({ period: "all-time", classId: null, page: 1 });
    expect(p.page).toBe(1);
  });

  test("large page numbers are passed through without clamping", () => {
    const p = buildLeaderboardParams({ period: "all-time", classId: null, page: 999 });
    expect(p.page).toBe(999);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  test("rankBadgeConfig always returns an object with label and className", () => {
    for (const n of [0, 1, 2, 3, 4, 100, -1]) {
      const cfg = rankBadgeConfig(n);
      expect(typeof cfg.label).toBe("string");
      expect(typeof cfg.className).toBe("string");
    }
  });

  test("actionBadgeConfig always returns label and className for any string", () => {
    for (const a of ["", "CREATED", "foo", "updated", "123"]) {
      const cfg = actionBadgeConfig(a);
      expect(typeof cfg.label).toBe("string");
      expect(typeof cfg.className).toBe("string");
    }
  });

  test("formatChangedFields handles objects with numeric and boolean values", () => {
    const result = formatChangedFields({ order: 5, active: true });
    expect(result).toContain("order");
    expect(result).toContain("active");
  });
});
