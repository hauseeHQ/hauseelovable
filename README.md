# Hausee Navigator

A home buying platform designed to help users **evaluate, compare, and organize** their home search journey through structured tools and guidance.

> ⚠️ **Important – AI / Contributor Notice**
> This README describes a **mix of implemented features, partially implemented flows, and planned capabilities defined in specs**.
>
> Not all features listed below are complete or fully enforced in code.
> When extending this project (especially using AI tools like Lovable), **verify behavior against the source code and linked specification documents before making changes**.

---

## Product Capabilities (Implemented + In Progress)

### Evaluate

The Evaluate experience supports structured home evaluation and comparison.

Current capabilities include:

* **Home Management**: Add and track multiple homes with associated details
* **Rating System**: Rate homes across multiple categories (e.g. exterior, interior, location, practical considerations)
* **Photo Uploads**: Attach photos to evaluation categories
* **Voice Notes**: Record audio notes during home visits
* **Comparison Tool**: Compare multiple homes side-by-side using visual indicators
* **Ratings Summary**: View overall and category-level scores

> Some evaluation logic and analytics are defined in specs and may be partially implemented.

---

### Plan

The Plan area is intended to help users clarify goals and assess readiness for home buying.

Planning modules include:

* **My Dream Home**: Capture preferences, priorities, and ideal features
* **Self-Assessment**: Assess readiness across financial, emotional, and practical dimensions
* **Mortgage Checklist**: Track mortgage-related steps and documents
* **Budget Planning**: Capture income, expenses, savings, and affordability inputs
* **Down Payment Tracking**: Monitor progress toward savings goals
* **Moving Tasks**: Organize moving-related to-dos

> These modules vary in completeness and enforcement. Some behavior is defined primarily in documentation.

---

### Guide

The Guide experience is designed to provide educational support throughout the home buying journey.

Capabilities include:

* **Educational Modules**: Step-by-step guidance content
* **Progress Tracking**: Track completion status of guide content

---

### Select

The Select experience is intended to support **agent selection and matching** based on buyer needs and preferences.

> Matching logic and workflows may be evolving.

---

### AI Assistant

An AI-assisted experience intended to help users:

* Ask home-buying questions
* Interpret information
* Navigate decisions with guidance

> AI behavior and scope are intentionally constrained and evolving.

---

## Tech Stack

### Frontend

* **React 18** with TypeScript
* **Vite** for development and build tooling
* **React Router** for navigation
* **Tailwind CSS** for styling
* **Lucide React** for icons

### Backend

* **Supabase** for database, authentication, and storage
* **PostgreSQL** with Row Level Security
* **Supabase Edge Functions** for serverless APIs

---

## Getting Started

### Prerequisites

* Node.js 18+
* npm or yarn
* Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd hauseenavigator
```

2. Install dependencies:

```bash
npm install
```

3. Environment setup:
   Copy `.env.example` to `.env.local` and provide required values:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Database setup:
   Database migrations live in `supabase/migrations/`.
   Refer to `SUPABASE_SETUP.md` for details.

5. Start development:

```bash
npm run dev
```

App runs at `http://localhost:5173`.

### Production build

```bash
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── evaluate/
│   ├── evaluation/
│   ├── homedetail/
│   ├── inspection/
│   ├── plan/
│   └── select/
├── contexts/
├── data/
├── hooks/
├── lib/
├── pages/
├── types/
└── utils/

supabase/
├── functions/
└── migrations/
```

---

## Implementation Notes (Non-Exhaustive)

### Authentication

* Uses **Supabase Auth**
* Email-based authentication is supported
* Phone / OTP and passwordless flows are evolving and may not be fully enforced

### Workspaces

* Supports a multi-user workspace model
* Invitations, membership, and roles exist with varying enforcement levels

### Data Persistence

* User data stored in Supabase PostgreSQL
* Row Level Security is enabled
* Some real-time behaviors may be experimental or partial

### File Storage

* Photos and voice notes are **currently stored using Supabase Storage**
* Storage structure and organization may change as the product evolves

---

## Scripts

* `npm run dev`
* `npm run build`
* `npm run preview`
* `npm run lint`
* `npm run typecheck`

---

## Database Schema

The schema includes tables related to:

* Users and workspaces
* Homes and evaluations
* Inspection data
* Planning modules
* Guide progress
* Agent requests

Refer to `supabase/migrations/` for authoritative definitions.

---

## Documentation (Source of Truth)

Before making logic changes, review:

* `SUPABASE_SETUP.md`
* `EVALUATION_SYSTEM_SPEC.md`
* `EVALUATE_SCHEMA_SUMMARY.md`
* `DIY_HOME_INSPECTION_COMPLETE.md`
* `RATE_HOME_IMPLEMENTATION.md`
* `COMPARE_VIEW_IMPLEMENTATION.md`

---

## Instructions for Lovable / AI Tools

When continuing this project with Lovable or other AI systems:

1. Treat this README as **descriptive, not authoritative**
2. Read the linked spec documents before modifying logic
3. Summarize what is:

   * Fully implemented
   * Partially implemented
   * Spec-only
4. Ask for confirmation before:

   * Refactoring
   * Renaming files or folders
   * Changing authentication flows
   * Modifying data models or storage behavior

**Do not infer missing logic.**

---

## License

Private and proprietary.

---

## Support

Contact the development team for questions or issues.
