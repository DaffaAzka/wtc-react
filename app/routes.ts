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

      // Certificates
      route("/certificates", "routes/auth/student/certificates/index.tsx"),
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
      route("/:slug/challenges", "routes/auth/admin/modules/challenges/index.tsx"),

      // Submissions
      route("/submissions/:challengeId", "routes/auth/admin/submissions/$challengeId.tsx"),

      // Recycle Bin
      route("/recycle-bin", "routes/auth/admin/recycle-bin.tsx"),

      // Student Progress
      ...prefix("/student-progress", [
        index("routes/auth/admin/student-progress/index.tsx"),
        route("/tracks/:slug", "routes/auth/admin/student-progress/tracks.$slug.tsx"),
      ]),

      // Certificates & Achievements
      route("/admin/certificates", "routes/auth/admin/certificates/index.tsx"),
      route("/admin/certificate-template", "routes/auth/admin/certificate-template/index.tsx"),
      route("/admin/achievements", "routes/auth/admin/achievements/index.tsx"),
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
      // Nested content: /:slug/lessons, /:slug/challenges, etc.
      route("/:slug/modules", "routes/auth/teacher/content/modules.tsx"),
      route("/:slug/lessons", "routes/auth/teacher/content/lessons.tsx"),
      route("/:slug/challenges", "routes/auth/teacher/content/module-challenges.tsx"),
      route("/:slug/lessons/create", "routes/auth/teacher/content/lessons.create.tsx"),
      route("/:slug/lessons/:lessonSlug/update", "routes/auth/teacher/content/lessons.update.tsx"),
      route("/:slug/lessons/:lessonSlug/view", "routes/auth/teacher/content/lessons.view.tsx"),
      route("/:slug/lessons/:lessonSlug/challenges", "routes/auth/teacher/content/lesson-challenges.tsx"),
      route("/challenges/:id", "routes/auth/teacher/content/challenge.$id.tsx"),
      route("/challenges/:id/edit", "routes/auth/teacher/content/challenge.$id.edit.tsx"),
      ...prefix("/submissions", [
        index("routes/auth/teacher/submissions/index.tsx"),
        route("/:id", "routes/auth/teacher/submissions/$id.tsx"),
      ]),
      route("/leaderboard", "routes/auth/teacher/leaderboard.tsx"),
      ...prefix("/student-progress", [
        index("routes/auth/teacher/student-progress/index.tsx"),
        route("/tracks/:slug", "routes/auth/teacher/student-progress/tracks.$slug.tsx"),
      ]),
      route("/audit-logs", "routes/auth/teacher/audit-logs.tsx"),
      route("/certificates", "routes/auth/teacher/certificates/index.tsx"),

      route("/admin/challenges/:id", "routes/auth/admin/challenges/$id.tsx"),
      route("/admin/challenges/:id/edit", "routes/auth/admin/challenges/$id.edit.tsx"),
      route("/admin/submissions/:challengeId", "routes/auth/admin/submissions/$challengeId.tsx"),
    ]),
  ]),
  // Public certificate verification — no auth, no layout
  route("/verify/:code", "routes/public/verify.$code.tsx"),
] satisfies RouteConfig;
