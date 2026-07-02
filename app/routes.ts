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
  ]),

  layout("routes/auth/layout.tsx", [
    route("/dashboard", "routes/auth/dashboard.tsx"),
  ]),
] satisfies RouteConfig;
