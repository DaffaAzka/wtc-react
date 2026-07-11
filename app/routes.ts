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
  ]),

  layout("routes/auth/layout.tsx", [
    route("/dashboard", "routes/auth/dashboard.tsx"),

    layout("routes/auth/admin/layout.tsx", [
      // Track Routes
      ...prefix("/tracks", [
        index("routes/auth/admin/tracks/index.tsx"),
        route("/:slug/modules", "routes/auth/admin/tracks/modules/index.tsx"),
        route(
          "/:slug/modules/:moduleSlug/lessons",
          "routes/auth/admin/tracks/modules/lessons/index.tsx",
        ),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
