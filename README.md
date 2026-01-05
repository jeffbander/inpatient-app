# NoteForge

AI-powered clinical documentation tool. Paste patient data, select note type, generate structured clinical notes.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Clerk

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys

### 3. Set up Convex

```bash
npx convex dev
```

This will prompt you to log in and create a new project.

### 4. Configure environment variables

Create `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Configure Clerk JWT for Convex

In Clerk Dashboard > JWT Templates, create a new template:
- Name: `convex`
- Claims: `{}`

Then in `convex/auth.config.ts`, update the domain to your Clerk JWT issuer.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 14 (App Router)
- Clerk (Authentication)
- Convex (Backend/Database)
- Anthropic Claude API (AI)
- Tailwind CSS (Styling)
