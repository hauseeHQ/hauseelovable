# Hausee Navigator

A comprehensive home buying platform that helps users evaluate, compare, and organize their home search journey.

## Features

### Evaluate
- **Home Management**: Add and track multiple homes with detailed information
- **Rating System**: Rate homes across multiple categories including exterior, interior, location, and practical considerations
- **Photo Upload**: Document homes with photos organized by evaluation category
- **Voice Notes**: Record audio notes during home visits
- **Comparison Tool**: Side-by-side comparison of multiple homes with visual indicators
- **Detailed Analytics**: View overall ratings and category-specific scores

### Plan
- **My Dream Home**: Define ideal home preferences, features, and priorities
- **Self Assessment**: Evaluate home buying readiness across financial, emotional, and practical dimensions
- **Mortgage Checklist**: Track mortgage application progress and required documents
- **Budget Planner**: Plan and manage home buying budget with income, expenses, and savings tracking
- **Down Payment Tracker**: Monitor savings progress toward down payment goals
- **Moving Todo List**: Organize moving tasks by timeline and category

### Guide
- **Educational Modules**: Step-by-step guidance through the home buying process
- **Progress Tracking**: Track completion of guide modules and lessons

### Select
- **Agent Matching**: Connect with real estate agents based on preferences and needs

### AI Assistant
- AI-powered assistance for home buying questions and guidance

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Supabase** for database, authentication, and storage
- **PostgreSQL** database with Row Level Security
- **Supabase Edge Functions** for serverless API endpoints

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Supabase account

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

3. Set up environment variables:
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run database migrations:
The database schema is located in `supabase/migrations/`. See `SUPABASE_SETUP.md` for detailed setup instructions.

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── evaluate/       # Evaluate tab components
│   ├── evaluation/     # Home evaluation modal components
│   ├── homedetail/     # Home detail page components
│   ├── inspection/     # Inspection checklist components
│   ├── plan/           # Planning module components
│   └── select/         # Agent matching components
├── contexts/           # React contexts (Auth, etc.)
├── data/              # Static data and configuration
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries and services
├── pages/             # Main page components
├── types/             # TypeScript type definitions
└── utils/             # Helper functions

supabase/
├── functions/         # Edge Functions
└── migrations/        # Database migrations
```

## Key Features Implementation

### Authentication
- Email/password authentication via Supabase Auth
- Protected routes with authentication guards
- OTP verification for phone authentication

### Workspaces
- Multi-user workspace support
- Workspace invitations and member management
- Role-based access control

### Data Persistence
- All user data stored in Supabase PostgreSQL
- Row Level Security policies for data isolation
- Real-time subscriptions for live updates

### File Storage
- Photo uploads stored in Supabase Storage
- Voice note recordings stored in Supabase Storage
- Organized by user and evaluation ID

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Database Schema

The database includes tables for:
- User profiles and workspaces
- Homes and evaluations
- Inspection checklists
- Planning modules (budget, mortgage, moving)
- Guide progress tracking
- Agent requests

See migration files in `supabase/migrations/` for detailed schema.

## Documentation

- `SUPABASE_SETUP.md` - Supabase configuration guide
- `EVALUATION_SYSTEM_SPEC.md` - Evaluation system specification
- `EVALUATE_SCHEMA_SUMMARY.md` - Evaluate section schema details
- `DIY_HOME_INSPECTION_COMPLETE.md` - Inspection feature documentation
- `RATE_HOME_IMPLEMENTATION.md` - Home rating system documentation
- `COMPARE_VIEW_IMPLEMENTATION.md` - Comparison feature documentation

## Security

- Row Level Security enabled on all tables
- Authentication required for sensitive operations
- Secure file upload with access controls
- Environment variables for sensitive configuration

## License

Private and proprietary.

## Support

For questions or issues, please contact the development team.
