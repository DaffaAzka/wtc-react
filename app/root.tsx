import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./contexts/auth";
import { TooltipProvider } from "./components/ui/tooltip";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="flex h-screen items-center justify-center flex-col">
          <h1 className="text-4xl font-bold">404</h1>
          <p>Page not found.</p>
        </div>
      );
    }

    if (error.status === 403) {
      return (
        <div className="flex h-screen items-center justify-center flex-col">
          <h1 className="text-4xl font-bold">403</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      );
    }

    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <h1 className="text-4xl font-bold">{error.status}</h1>
        <p>{error.statusText}</p>
      </div>
    );
  }

  return <div>Something went wrong.</div>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </AuthProvider>
  );
}
