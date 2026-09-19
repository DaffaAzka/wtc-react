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
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/theme";
import { ErrorPage } from "./components/error-page";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "WTC - Webtech Training Camp" },
    { name: "description", content: "Webtech Training Camp - Master Web Development" },
  ];
};

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/brand-pack/icon-2.svg", type: "image/svg+xml" },
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
        <ErrorPage
          code="404"
          title="Page Not Found"
          description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Please check the URL or go back to the homepage."
        />
      );
    }

    if (error.status === 403) {
      return (
        <ErrorPage
          code="403"
          title="Access Denied"
          description="You do not have permission to access this page. If you believe this is an error, please contact the administrator."
        />
      );
    }

    if (error.status === 500) {
      return (
        <ErrorPage
          code="500"
          title="Server Error"
          description="There's something wrong on our end. Our team has been notified. Please try again in a few minutes."
        />
      );
    }

    return (
      <ErrorPage
        code={String(error.status)}
        title={error.statusText || "An Error Occurred"}
        description="An unexpected error occurred. Please go back to the homepage."
      />
    );
  }

  return (
    <ErrorPage
      code="Oops"
      title="Terjadi Kesalahan"
      description="Ada sesuatu yang tidak berjalan dengan benar. Coba muat ulang halaman atau kembali ke beranda."
    />
  );
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
      <body className="overflow-x-hidden">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Outlet />
          </TooltipProvider>

          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
