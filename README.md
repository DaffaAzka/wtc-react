# WTC LMS — React Frontend

A Learning Management System frontend built with **React Router v7** (Framework Mode), **TypeScript**, **TailwindCSS**, and **Shadcn UI**.

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file and configure API URL
cp .env.example .env

# Start development server
npm run dev
```

## Project Structure

```
app/
├── routes.ts                    # Route definitions (entry point)
├── root.tsx                     # Root layout, providers (Auth, Tooltip)
├── app.css                      # Global styles
│
├── routes/                      # Route pages (mapped in routes.ts)
│   ├── home.tsx                 # Landing page (/)
│   ├── guest/                   # Public routes (login, register)
│   │   ├── layout.tsx           # Guest guard — redirects to /dashboard if logged in
│   │   ├── login.tsx            # Login page (/login)
│   │   └── register.tsx         # Register page (/register)
│   └── auth/                    # Protected routes (requires authentication)
│       ├── layout.tsx           # Auth guard — redirects to /login if not logged in
│       ├── dashboard.tsx        # Dashboard page (/dashboard)
│       └── admin/               # Admin-only routes
│           ├── layout.tsx       # Admin layout
│           └── users.tsx        # User management
│
├── features/                    # Feature-specific components
│   └── auth/
│       ├── login/form.tsx       # Login form component
│       └── register/form.tsx    # Register form component
│
├── components/                  # Shared components
│   ├── ui/                      # Shadcn UI primitives (Button, Card, Input, etc.)
│   ├── custom/                  # Custom reusable components (LoadingButton)
│   ├── app-sidebar.tsx          # Application sidebar
│   ├── nav-main.tsx             # Main navigation
│   ├── nav-modules.tsx          # Module navigation
│   ├── nav-secondary.tsx        # Secondary navigation
│   └── nav-user.tsx             # User navigation (avatar, logout)
│
├── contexts/                    # React Context providers
│   └── auth.tsx                 # AuthContext (user state, login/logout)
│
├── hooks/                       # Custom React hooks
│   ├── auth.ts                  # useLogin, useRegister hooks
│   └── use-mobile.ts            # Mobile breakpoint detection
│
├── services/                    # API service layer
│   └── auth.ts                  # Auth API calls (login, register)
│
├── types/                       # TypeScript type definitions
│   ├── auth.ts                  # Auth request/response types
│   ├── model.ts                 # Data model types (User)
│   └── response.ts              # API response wrapper types
│
├── lib/                         # Library configurations
│   ├── axios.ts                 # Axios instance with interceptors
│   └── utils.ts                 # Utility functions (cn)
│
└── utils/                       # General utilities
    └── global.ts                # String helpers
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run typecheck` | Run TypeScript type checking |

## Tech Stack

- **React 19** + **React Router 7** (Framework Mode, SSR)
- **TypeScript**
- **TailwindCSS 4** + **Shadcn UI**
- **Axios** for HTTP requests
- **Vite 8** for bundling
