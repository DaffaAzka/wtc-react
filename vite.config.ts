import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "react-router"],
  },
  optimizeDeps: {
    include: [
      // Core
      "react",
      "react-dom",
      "react-dom/client",
      "react-router",
      // Data fetching
      "@tanstack/react-query",
      "axios",
      // UI utilities
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "sonner",
      "next-themes",
      "lucide-react",
      // Radix UI
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
      // Misc
      "date-fns",
      "lodash/debounce", // only debounce is used — don't pre-bundle the full CJS lodash
      "react-day-picker",
      "cmdk",
    ],
  },
});
