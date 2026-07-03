import {
  type RouteConfig,
  index,
  layout,
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
      route("/users", "routes/auth/admin/users.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
