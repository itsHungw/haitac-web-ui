# htth-web

Web frontend portal for Hải Tặc Tí Hon. Built with **Next.js 15**, **React 19**, and **TypeScript**. Deployed on Vercel and proxies API calls.

---

## Project Structure

```
web-frontend/
├── src/
│   ├── app/                      # Next.js App Router (pages & layouts)
│   │   ├── layout.tsx            # Global layout & HTML root
│   │   ├── page.tsx              # Portal Home page
│   │   ├── login/
│   │   │   └── page.tsx          # Login page route (/login)
│   │   └── register/
│   │       └── page.tsx          # Registration page route (/register)
│   ├── components/               # Shared & UI components
│   │   └── ui/
│   │       ├── Alert.tsx         # Status banner alerts
│   │       ├── Button.tsx        # Styled button with loading state
│   │       ├── Card.tsx          # Glassmorphism container card
│   │       └── Input.tsx         # Styled input field with label
│   ├── features/                 # Domain/Feature modules
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── AuthCard.tsx
│   │       │   ├── LoginForm.tsx
│   │       │   └── RegisterForm.tsx
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       ├── services/
│   │       │   └── auth.service.ts
│   │       └── types/
│   │           └── auth.types.ts
│   ├── lib/                      # Core utilities & networking
│   │   ├── api/
│   │   │   ├── api-client.ts     # Type-safe fetch client with CSRF support
│   │   │   └── errors.ts         # ApiError class & error extractor
│   │   └── utils/
│   │       └── cookies.ts        # Cookie extraction helpers
│   ├── styles/
│   │   └── globals.css           # Modern dark-theme design tokens & utilities
│   └── types/
│       └── api.types.ts          # Common API response interfaces
├── next.config.ts                # TypeScript Next.js configuration
├── tsconfig.json                 # Strict TypeScript configuration
└── package.json
```

---

## Architecture & Authentication Rules

### 1. API Rewrites & Session Cookies
The session cookie (`htth_token`) is configured with `Secure` + `SameSite=Lax` and is host-only. 
`next.config.ts` rewrites `/api/*` requests to the API origin (`API_ORIGIN` or `https://htthapi.aqueduct.me`). 
Because requests appear same-origin to the browser, session cookies and CSRF protection work seamlessly without manual token storage or CORS issues.

### 2. Client-side Validation Policy
Username and password constraints are enforced and validated by the backend server to match the game client constraints strictly (e.g. no uppercase in keypad input, restricted charset). The web frontend does not duplicate strict regex rules to avoid drift; it passes requests to the API and renders server feedback directly.

### 3. Route Compatibility
Legacy routes (`/dang-nhap` and `/dang-ky`) are permanently redirected to `/login` and `/register` respectively in `next.config.ts`.

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run type-check

# Production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
