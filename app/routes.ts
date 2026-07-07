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
        route("/add", "routes/auth/admin/tracks/add.tsx"),
        route("/:id/edit", "routes/auth/admin/tracks/edit.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
