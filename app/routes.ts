import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/guest/layout.tsx", [
    index("routes/home.tsx"),
    route("/login", "routes/guest/login.tsx"),
    route("/register", "routes/guest/register.tsx"),
    route("/auth/callback", "routes/auth/callback.tsx"),
  ]),

  layout("routes/auth/student/layout.tsx", [
    ...prefix("/student", [
      route("/dashboard", "routes/auth/student/dashboard.tsx"),

      // Track/Class Routes (URL: /classes, API: /tracks)
      ...prefix("/classes", [
        index("routes/auth/student/tracks/index.tsx"),
        route("/:slug", "routes/auth/student/tracks/$slug.tsx"),
        route(
          "/:slug/:moduleSlug/:lessonSlug?",
          "routes/auth/student/lessons/$slug.tsx",
        ),
      ]),

      route("/tracks/:slug", "routes/auth/student/tracks/$slug.tsx", {
        id: "student-track-alias",
      }),

      // Progress/My Learning Page
      route("/progress", "routes/auth/student/my-learning/index.tsx"),

      // Profile Management
      route("/profile", "routes/auth/student/profile/index.tsx"),

      // Submissions & Challenges
      route("/submissions", "routes/auth/student/submissions/index.tsx"),
      route("/challenges/:id", "routes/auth/student/challenges/$id.tsx"),
      route(
        "/challenges/:id/take",
        "routes/auth/student/challenges/$id.take.tsx",
      ),
    ]),
  ]),
  layout("routes/auth/layout.tsx", [
    route("/dashboard", "routes/auth/dashboard.tsx"),
    route("/courses", "routes/auth/courses/index.tsx"),

    layout("routes/auth/admin/layout.tsx", [
      route("/user-management", "routes/auth/admin/user-management/index.tsx"),
      route(
        "/course-management",
        "routes/auth/admin/course-management/index.tsx",
      ),

      // Profile Management
      route("/admin/profile", "routes/auth/admin/profile/index.tsx"),

      // Pustaka PDF / Materials Management Routes
      route("/materials", "routes/auth/admin/pustakaPdf/index.tsx"),
      route(
        "/materials/:lessonSlug/:attachmentId",
        "routes/auth/admin/pustakaPdf/show.tsx",
      ),

      // Track Routes
      ...prefix("/tracks", [index("routes/auth/admin/tracks/index.tsx")]),

      // Module Routes — /:slug? covers both /modules and /:trackSlug/modules
      route("/:slug?/modules", "routes/auth/admin/modules/index.tsx"),
      route(
        "/:slug?/modules/:moduleSlug/challenges",
        "routes/auth/admin/modules/challenges/index.tsx",
      ),

      // Lesson Routes — /:slug? covers both /lessons and /:moduleSlug/lessons
      route("/:slug?/lessons", "routes/auth/admin/lessons/index.tsx"),
      route("/:slug?/lessons/create", "routes/auth/admin/lessons/create.tsx"),
      route(
        "/:slug?/lessons/:lessonSlug/update",
        "routes/auth/admin/lessons/update.tsx",
      ),
      route(
        "/:slug?/lessons/:lessonSlug/view",
        "routes/auth/admin/lessons/view.tsx",
      ),
      route(
        "/:slug?/lessons/:lessonSlug/challenges",
        "routes/auth/admin/challenges/index.tsx",
      ),

      // Global Challenges Routes
      route("/challenges", "routes/auth/admin/all-challenges/index.tsx"),

      // Recycle Bin
      route("/recycle-bin", "routes/auth/admin/recycle-bin.tsx"),
    ]),
  ]),

  // Teacher workspace
  layout("routes/auth/teacher/layout.tsx", [
    ...prefix("/teacher", [
      route("/dashboard", "routes/auth/teacher/dashboard.tsx"),
      route("/tracks", "routes/auth/teacher/tracks.tsx"),
      route("/modules", "routes/auth/teacher/modules.tsx"),
      route("/lessons", "routes/auth/teacher/lessons.tsx"),
      route("/challenges", "routes/auth/teacher/challenges.tsx"),
      ...prefix("/submissions", [
        index("routes/auth/teacher/submissions/index.tsx"),
        route("/:id", "routes/auth/teacher/submissions/$id.tsx"),
      ]),
      route("/leaderboard", "routes/auth/teacher/leaderboard.tsx"),
      route("/audit-logs", "routes/auth/teacher/audit-logs.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
