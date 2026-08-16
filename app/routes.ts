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
        ]),

        // Progress/My Learning Page
        route("/progress", "routes/auth/student/my-learning/index.tsx"),
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

      // Track Routes
      ...prefix("/tracks", [
        index("routes/auth/admin/tracks/index.tsx"),
      ]),

      // Module Routes — /:slug? covers both /modules and /:trackSlug/modules
      route("/:slug?/modules", "routes/auth/admin/modules/index.tsx"),

      // Lesson Routes — /:slug? covers both /lessons and /:moduleSlug/lessons
      route("/:slug?/lessons", "routes/auth/admin/lessons/index.tsx"),
      route("/:slug?/lessons/create", "routes/auth/admin/lessons/create.tsx"),
      route("/:slug?/lessons/:lessonSlug/update", "routes/auth/admin/lessons/update.tsx"),
      route("/:slug?/lessons/:lessonSlug/view", "routes/auth/admin/lessons/view.tsx"),
      route("/:slug?/lessons/:lessonSlug/challenges", "routes/auth/admin/challenges/index.tsx"),
    ]),
  ]),
] satisfies RouteConfig;