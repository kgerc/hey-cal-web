# HeyCal - Calendar Management Made Effortless

A modern, full-stack web application for managing your calendar with seamless Google Calendar integration, Facebook Messenger, and email notifications.

## Project Status

**Phase 1 Complete** - Foundation & Setup ✅

The project foundation has been successfully set up with all core infrastructure in place.

## What's Been Built

### 1. Project Foundation
- ✅ Vite + React 18 + TypeScript setup
- ✅ Tailwind CSS with custom design tokens (teal-to-green gradient theme)
- ✅ Complete folder structure for scalable development
- ✅ Path aliases configured (`@/` for `src/`)
- ✅ ESLint and Prettier configuration

### 2. Dependencies Installed
- **UI Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand (lightweight, performant)
- **API State**: TanStack Query (React Query)
- **Backend**: Supabase client
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS
- **Utilities**: date-fns, axios, lucide-react
- **Notifications**: Sonner (toast notifications)

### 3. Authentication System
- ✅ Zustand auth store with Supabase integration
- ✅ `useAuth` hook for easy auth access
- ✅ Protected and public route components
- ✅ Login page with email/password and OAuth options
- ✅ Signup page with full validation
- ✅ OAuth callback handler
- ✅ Support for Google and Facebook OAuth

### 4. Core Pages
- ✅ Landing page with modern design
- ✅ Login page (split design with OAuth buttons)
- ✅ Signup page (split design with OAuth buttons)
- ✅ Dashboard page (placeholder with sidebar)
- ✅ Onboarding page (placeholder)
- ✅ Auth callback page

### 5. TypeScript Types
- ✅ User types (User, ConnectedAccount, UserPreferences)
- ✅ Calendar types (CalendarEvent, EventAttendee, Calendar)
- ✅ Notification types (NotificationLog, MessageTemplate)
- ✅ Automation types (AutomationRule, RuleCondition, RuleAction)

### 6. Utilities
- ✅ Date formatting utilities (formatEventDate, formatEventTime)
- ✅ Zod validation schemas (event form, login, signup, templates)
- ✅ Supabase client configuration

### 7. Design System
- ✅ Custom CSS variables for theming
- ✅ Light and dark mode support
- ✅ Teal-to-green gradient (#14B8A6 to #10B981)
- ✅ Navy dark sections (#1E3A8A)
- ✅ Custom shadows and gradients
- ✅ Animation utilities (fade-up, float, pulse-glow)
- ✅ Inter font family

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 (fast development and building)
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router v6
- **State Management**: Zustand
- **Server State**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend (To Be Configured)
- **Backend as a Service**: Supabase
  - PostgreSQL database
  - Authentication (email, Google OAuth, Facebook OAuth)
  - Row Level Security
  - Real-time subscriptions
  - Storage for file attachments
  - Edge Functions for serverless logic

### Planned Integrations
- **Google Calendar API**: Two-way sync
- **Facebook Messenger API**: Send notifications
- **SendGrid**: Email notifications
- **Stripe**: Subscription billing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (for backend)
- Google OAuth credentials (for Google Calendar integration)
- Facebook App credentials (for Messenger integration)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd cal_flow_web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:

   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google OAuth Configuration
   VITE_GOOGLE_CLIENT_ID=your_google_client_id

   # Facebook OAuth Configuration
   VITE_FACEBOOK_APP_ID=your_facebook_app_id

   # Stripe Configuration
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

   # App Configuration
   VITE_APP_URL=http://localhost:5173
   ```

4. **Set up Supabase** (see below)

5. **Start the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Get your project credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon public` key
   - Update `.env` file

3. **Set up authentication providers**:
   - Go to Authentication → Providers
   - Enable Google OAuth:
     - Add your Google Client ID and Secret
     - Add redirect URL: `https://<your-project>.supabase.co/auth/v1/callback`
   - Enable Facebook OAuth:
     - Add your Facebook App ID and Secret
     - Add redirect URL

4. **Create database schema** (see `docs/database-schema.sql` in the plan):
   - Go to SQL Editor
   - Run the SQL schema from the implementation plan
   - This creates all tables: profiles, connected_accounts, events, event_attendees, notification_logs, etc.

5. **Set up Row Level Security (RLS)**:
   - Enable RLS on all tables
   - Add policies for user-specific data access

## Project Structure

```
cal_flow_web/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (buttons, inputs, etc.)
│   │   ├── auth/            # Authentication components
│   │   ├── calendar/        # Calendar views and event cards
│   │   ├── events/          # Event creation and management
│   │   ├── notifications/   # Notification settings
│   │   ├── dashboard/       # Dashboard layout components
│   │   ├── settings/        # Settings pages
│   │   ├── onboarding/      # Onboarding wizard steps
│   │   ├── templates/       # Event templates
│   │   ├── automations/     # Automation rules
│   │   ├── analytics/       # Analytics dashboard
│   │   ├── contacts/        # Contact management
│   │   ├── billing/         # Subscription and billing
│   │   └── support/         # Help and support
│   ├── pages/
│   │   ├── Landing.tsx      # Landing page
│   │   ├── Login.tsx        # Login page
│   │   ├── Signup.tsx       # Signup page
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Onboarding.tsx   # Onboarding wizard
│   │   └── AuthCallback.tsx # OAuth callback handler
│   ├── hooks/
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── useCalendar.ts   # Calendar operations (to be built)
│   │   └── useNotifications.ts # Notifications (to be built)
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── google-calendar.ts # Google Calendar API (to be built)
│   │   └── api/             # API helpers
│   ├── stores/
│   │   ├── authStore.ts     # Authentication state
│   │   ├── calendarStore.ts # Calendar state (to be built)
│   │   └── uiStore.ts       # UI state (to be built)
│   ├── types/
│   │   ├── user.ts          # User types
│   │   ├── calendar.ts      # Calendar types
│   │   ├── notification.ts  # Notification types
│   │   └── automation.ts    # Automation types
│   ├── utils/
│   │   ├── date.ts          # Date utilities
│   │   └── validation.ts    # Zod schemas
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles with Tailwind
├── public/                  # Static assets
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Next Steps (Phase 2)

Based on the implementation plan, here's what's coming next:

### Phase 2: Complete Authentication & Onboarding (Week 1-2)
- [ ] Build onboarding wizard with steps:
  - [ ] Welcome screen
  - [ ] Google Calendar connection
  - [ ] Facebook Messenger connection (optional)
  - [ ] Email configuration
  - [ ] Import existing events
  - [ ] Interactive tutorial
- [ ] Set up Google OAuth consent screen
- [ ] Configure Facebook App for Messenger
- [ ] Create Supabase Edge Functions for OAuth callbacks
- [ ] Implement token refresh logic

### Phase 3: Main Dashboard (Week 2-3)
- [ ] Build three-column responsive layout
- [ ] Implement calendar views (Day, Week, Month)
- [ ] Add drag-and-drop event rescheduling
- [ ] Create event details panel
- [ ] Build sidebar navigation
- [ ] Add mini calendar for date navigation

### Phase 4: Event Creation Flow (Week 3-4)
- [ ] Multi-step event creation wizard
- [ ] Attendee management with Google Contacts integration
- [ ] Notification settings per attendee
- [ ] Review and send step
- [ ] Form validation with Zod

### Phase 5: Google Calendar Integration (Week 4-5)
- [ ] Fetch events from Google Calendar
- [ ] Two-way sync (create, update, delete)
- [ ] Handle recurring events
- [ ] Set up webhooks for real-time sync
- [ ] Conflict resolution

### Phase 6: Notification System (Week 5-6)
- [ ] Email notifications with SendGrid
- [ ] Facebook Messenger integration
- [ ] RSVP handling
- [ ] Notification queue and retry logic
- [ ] Track delivery and read receipts

See the full implementation plan at `~/.claude/plans/zippy-purring-conway.md`

## Design Philosophy

- **Mobile-first**: Responsive design that works on all devices
- **Performance**: Fast initial load, code splitting, lazy loading
- **Type-safe**: Full TypeScript coverage
- **Accessible**: WCAG 2.1 AA compliance
- **Modern**: Clean, gradient-based design with smooth animations
- **Scalable**: Well-organized folder structure for growth

## Design Tokens

The app uses a custom design system with these primary colors:

- **Primary (Teal)**: `hsl(174, 72%, 40%)` - #14B8A6
- **Secondary (Green)**: `hsl(160, 60%, 45%)` - #10B981
- **Navy (Dark)**: `hsl(220, 50%, 15%)` - #1E3A8A
- **Mint (Light)**: `hsl(160, 40%, 95%)`

Gradients:
- **Primary Gradient**: Teal to Green (135deg)
- **Hero Gradient**: Mint to White (180deg)
- **Dark Gradient**: Navy variations (180deg)

## Contributing

This is a production-ready application being built in phases. Follow the implementation plan for feature development.

## License

[Your License Here]

## Support

For issues or questions, please refer to the implementation plan or contact the development team.
