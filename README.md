# Inpatient App - Progress Notes

A clinical progress notes management system built with Next.js and Convex, featuring proper EMR-style formatting.

## Features

- **Proper Clinical Note Layout**: Matches real EMR/Epic-style progress notes with:
  - Patient demographics header (Name, DOB, MRN, Contact, PCP, Age, Gender)
  - History of Present Illness
  - Past Medical History (with dates and notes)
  - Past Surgical History (with laterality and dates)
  - Family History
  - Social History (Tobacco, Alcohol, Drugs, Support System)
  - Allergies (with reactions)
  - Current Medications (with doses and frequency)
  - Review of Systems
  - Physical Exam (with vitals)
  - Diagnostics (Labs, EKG, Imaging)
  - Assessment and Plan (problem-based)
  - Orders Placed
  - Visit Diagnoses
  - Provider Attestation

- **Copy to Clipboard**: One-click copy of the full note text
- **Sample Data**: Includes two sample progress notes (Cardiology and Electrophysiology)

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Convex** - Backend-as-a-service for real-time data
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd inpatient-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev --once --configure=new
```

4. Copy the environment variables:
```bash
cp .env.example .env.local
# Update NEXT_PUBLIC_CONVEX_URL with your Convex deployment URL
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
inpatient-app/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   └── ProgressNote.tsx  # Main progress note display
│   ├── lib/              # Utilities and sample data
│   │   └── sampleData.ts
│   └── types/            # TypeScript types
│       └── progressNote.ts
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── patients.ts       # Patient queries/mutations
│   └── progressNotes.ts  # Note queries/mutations
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your `NEXT_PUBLIC_CONVEX_URL` environment variable
4. Deploy

### Convex

Run `npx convex deploy` to deploy your Convex functions to production.

## License

MIT
