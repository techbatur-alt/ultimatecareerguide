# Ultimate Career Guide (eUCG) — Website Design Document

**Version:** 1.1  
**Date:** 7 March 2026  
**Owner:** IBATUR Education CC  
**Published URL:** https://ultimatecareerguide.lovable.app  
**Platform:** Lovable (React + Vite + Supabase)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Design System](#4-design-system)
5. [Database Schema](#5-database-schema)
6. [Authentication & Authorisation](#6-authentication--authorisation)
7. [Page-by-Page Specification](#7-page-by-page-specification)
8. [Shared Components](#8-shared-components)
9. [Business Logic & Data Flows](#9-business-logic--data-flows)
10. [Security & DRM](#10-security--drm)
11. [Storage & Assets](#11-storage--assets)
12. [Dependencies](#12-dependencies)
13. [Environment Variables](#13-environment-variables)
14. [Maintenance Procedures](#14-maintenance-procedures)
15. [Troubleshooting Guide](#15-troubleshooting-guide)

---

## 1. Executive Summary

The eUCG platform is a subscription-based web application that delivers 13 volumes of the Ultimate Career Guide — South Africa's most comprehensive career guidance resource — in digital format. The platform provides:

- **Public access** to volume extracts (sample PDFs) for all visitors
- **Authenticated access** for registered users to manage profiles and purchase subscriptions
- **Subscription management** with a 1-year access model (initial ZAR 3,415 / renewal ZAR 500)
- **Sub-profile management** for student/learner dependants
- **Sponsorship tracking** for the Careers4Africa-SA26 initiative
- **DRM protection** to prevent content piracy

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | ^18.3.1 | UI framework (SPA) |
| **TypeScript** | ^5.8.3 | Type-safe JavaScript |
| **Vite** | ^5.4.19 | Build tool & dev server |
| **Tailwind CSS** | ^3.4.17 | Utility-first CSS framework |
| **React Router DOM** | ^6.30.1 | Client-side routing |
| **TanStack React Query** | ^5.83.0 | Server state management & caching |
| **shadcn/ui** (Radix UI) | Various | Accessible UI component primitives |
| **Lucide React** | ^0.462.0 | Icon library |
| **Sonner** | ^1.7.4 | Toast notifications |
| **Recharts** | ^2.15.4 | Data visualisation/charts |

### Backend (Lovable Cloud / Supabase)

| Service | Purpose |
|---|---|
| **Supabase Auth** | User authentication (email/password, email verification) |
| **Supabase Database** | PostgreSQL database with RLS policies |
| **Supabase Storage** | File storage (profile pictures, evolumes bucket) |
| **Supabase Edge Functions** | Serverless backend functions |
| **Row-Level Security (RLS)** | Data access control at database level |

### Build & Dev Tools

| Tool | Version | Purpose |
|---|---|---|
| **Bun** | Runtime | Package manager & runtime |
| **Vitest** | ^3.2.4 | Unit testing framework |
| **ESLint** | ^9.32.0 | Code linting |
| **PostCSS** | ^8.5.6 | CSS processing |
| **Autoprefixer** | ^10.4.21 | CSS vendor prefixing |

### Languages

- **TypeScript / TSX** — All frontend code
- **CSS** — Tailwind utilities + custom CSS in `src/index.css`
- **SQL** — Database migrations, RLS policies, triggers
- **HTML** — Single `index.html` entry point

---

## 3. Project Structure

```
├── public/
│   ├── documents/
│   │   └── volume-extract.pdf          # Sample PDF shown for all volumes
│   ├── images/
│   │   ├── covers/
│   │   │   └── volume-01.jpg ... volume-10.jpg  # Volume cover images
│   │   ├── hero-graduates.jpg          # Hero background photo
│   │   ├── alba-picture.jpg            # Publisher photo
│   │   ├── ibatur-logo.jpg             # IBATUR logo
│   │   └── ucg-logo.png               # UCG logo
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── App.tsx                         # Root component with routing
│   ├── App.css                         # Minimal app styles
│   ├── main.tsx                        # Entry point (renders <App />)
│   ├── index.css                       # Design tokens & global styles
│   ├── vite-env.d.ts                   # Vite type declarations
│   ├── components/
│   │   ├── Layout.tsx                  # Global layout (header, footer, nav)
│   │   ├── DRMProtection.tsx           # Content protection component
│   │   ├── NavLink.tsx                 # Custom NavLink wrapper
│   │   └── ui/                         # shadcn/ui component library (~50 files)
│   ├── hooks/
│   │   ├── useAuth.tsx                 # Auth context provider & hook
│   │   ├── use-mobile.tsx              # Mobile viewport detection
│   │   └── use-toast.ts               # Toast hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts              # Supabase client (AUTO-GENERATED)
│   │       └── types.ts               # Database types (AUTO-GENERATED)
│   ├── lib/
│   │   ├── utils.ts                   # Utility functions (cn helper)
│   │   └── volumes.ts                 # Volume data definitions (13 volumes)
│   ├── pages/
│   │   ├── Index.tsx                  # Homepage
│   │   ├── Volumes.tsx                # Volume library listing
│   │   ├── VolumeViewer.tsx           # PDF viewer for volume extracts
│   │   ├── About.tsx                  # About page (tabs: eUCG, IBATUR, Contact, T&Cs)
│   │   ├── Login.tsx                  # Sign-in page
│   │   ├── Signup.tsx                 # 3-step registration flow
│   │   ├── Profile.tsx                # Profile management (tabs)
│   │   ├── Payment.tsx                # Subscription purchase page
│   │   ├── ResetPassword.tsx          # Password reset page
│   │   ├── Partners.tsx               # Partners page (tabs: NPOs, PBOs, DBE, Sponsors)
│   │   ├── Testimonials.tsx           # Testimonials & Why UCG
│   │   ├── Sponsorship.tsx            # Sponsorship tiers & CTA
│   │   ├── SponsorshipTracker.tsx     # Live sponsorship tracker
│   │   ├── UCGProject.tsx             # Careers4Africa-SA26 project page
│   │   ├── AdminData.tsx              # CSV upload admin panel
│   │   └── NotFound.tsx               # 404 page
│   └── test/
│       ├── example.test.ts            # Example test
│       └── setup.ts                   # Test setup (jsdom)
├── supabase/
│   ├── config.toml                    # Supabase project config (AUTO-GENERATED)
│   └── migrations/                    # SQL migration files
├── tailwind.config.ts                 # Tailwind configuration
├── vite.config.ts                     # Vite build configuration
├── tsconfig.json                      # TypeScript config (root)
├── tsconfig.app.json                  # TypeScript config (app)
├── tsconfig.node.json                 # TypeScript config (node)
├── vitest.config.ts                   # Vitest test config
├── postcss.config.js                  # PostCSS plugins
├── components.json                    # shadcn/ui config
├── eslint.config.js                   # ESLint config
└── package.json                       # Dependencies & scripts
```

---

## 4. Design System

### 4.1 Typography

| Usage | Font | Weight | Notes |
|---|---|---|---|
| All text | **Source Sans 3** | 300–900 | Loaded via Google Fonts CDN |
| Headings (h1–h6) | Source Sans 3 | 700–900 (bold/black) | `font-display` class |
| Body text | Source Sans 3 | 400 (regular) | `font-sans` class |
| Both `font-display` and `font-sans` map to `"Source Sans 3", sans-serif` |

### 4.2 Colour Palette (HSL)

#### Light Mode (`:root`)

| Token | HSL Value | Hex Approx. | Usage |
|---|---|---|---|
| `--background` | 0 0% 97% | #F7F7F7 | Page background |
| `--foreground` | 0 0% 8% | #141414 | Primary text |
| `--card` | 0 0% 100% | #FFFFFF | Card backgrounds |
| `--card-foreground` | 0 0% 8% | #141414 | Card text |
| `--primary` | 0 85% 45% | #D41414 | **Brand red** — buttons, links, accents |
| `--primary-foreground` | 0 0% 100% | #FFFFFF | Text on primary |
| `--secondary` | 0 0% 12% | #1F1F1F | Dark backgrounds (footer, IBATUR sections) |
| `--secondary-foreground` | 0 0% 100% | #FFFFFF | Text on secondary |
| `--muted` | 0 0% 92% | #EBEBEB | Subtle backgrounds |
| `--muted-foreground` | 0 0% 40% | #666666 | Subdued text |
| `--accent` | 45 100% 51% | #FFB800 | **Gold/yellow** accent |
| `--accent-foreground` | 0 0% 8% | #141414 | Text on accent |
| `--destructive` | 0 84.2% 60.2% | #EF4444 | Error states |
| `--border` | 0 0% 88% | #E0E0E0 | Borders |
| `--ring` | 0 85% 45% | #D41414 | Focus rings |
| `--success` | 142 72% 40% | #1DAA5A | Success states |
| `--warning` | 38 92% 50% | #F59E0B | Warning states |

#### Dark Mode (`.dark`)

| Token | HSL Value | Change from Light |
|---|---|---|
| `--background` | 0 0% 6% | Dark (#0F0F0F) |
| `--foreground` | 0 0% 95% | Light text |
| `--primary` | 0 85% 50% | Slightly brighter red |
| `--secondary` | 0 0% 18% | Slightly lighter dark |
| `--muted` | 0 0% 18% | Darker muted |
| `--border` | 0 0% 18% | Darker borders |

### 4.3 Custom Gradients & Utilities

```css
.gradient-hero    → linear-gradient(135deg, hsl(0 0% 8%) → hsl(0 0% 15%) → hsl(0 85% 25%))
.gradient-brand   → linear-gradient(135deg, hsl(0 85% 45%) → hsl(0 85% 35%))
.text-gradient-brand → Same as gradient-brand but applied to text
.no-select        → Prevents text selection (DRM)
```

### 4.4 Layout Constants

| Property | Value |
|---|---|
| Container max-width | 1400px (`2xl` breakpoint) |
| Container padding | 2rem |
| Border radius (base) | 0.5rem |
| Border radius (lg) | 0.5rem |
| Border radius (md) | calc(0.5rem - 2px) |
| Border radius (sm) | calc(0.5rem - 4px) |

### 4.5 Animations

| Name | Duration | Effect |
|---|---|---|
| `fade-in` | 0.5s ease-out | translateY(10px→0) + opacity(0→1) |
| `slide-in` | 0.4s ease-out | translateX(-20px→0) + opacity(0→1) |
| `accordion-down` | 0.2s ease-out | height(0→content) |
| `accordion-up` | 0.2s ease-out | height(content→0) |

### 4.6 Page Layout Pattern

Every page follows a consistent structure:
1. **Hero section** — Full-width with `hero-graduates.jpg` background, dark overlay (`bg-gradient-to-r from-secondary/90 to-primary/80`), centred white text
2. **Content section(s)** — Container-constrained, with tabbed interfaces where applicable
3. **CTA section** (where applicable) — `gradient-brand` background with white text

---

## 5. Database Schema

### 5.1 Tables

#### `profiles`
Primary user data table. Created automatically via trigger when a user signs up.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | No | — | **PK**, matches `auth.users.id` |
| `email` | text | No | `''` | Primary email (username, immutable in UI) |
| `secondary_email` | text | Yes | `''` | Editable alternative email |
| `salutation` | text | No | `''` | Mr/Mrs/Ms/Dr/Prof/Rev/Other |
| `first_name` | text | No | `''` | |
| `last_name` | text | No | `''` | |
| `nickname` | text | No | `''` | |
| `id_number` | text | No | `''` | SA ID number (13 digits) |
| `mobile_1` | text | No | `''` | Primary mobile |
| `mobile_2` | text | Yes | `''` | Secondary mobile |
| `telephone_home` | text | Yes | `''` | |
| `telephone_work` | text | Yes | `''` | |
| `home_address` | text | No | `''` | |
| `work_address` | text | Yes | `''` | |
| `date_of_birth` | date | Yes | — | Must be 18+ to register |
| `role` | text | No | `'account_holder'` | User role |
| `profile_picture_url` | text | Yes | `''` | |
| `created_at` | timestamptz | No | `now()` | |
| `updated_at` | timestamptz | No | `now()` | |

**RLS Policies:**
- SELECT: `auth.uid() = id` (users see only own profile)
- INSERT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`
- DELETE: **Not allowed**

#### `sub_profiles`
Student/learner profiles linked to an account holder.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | **PK** |
| `account_holder_id` | uuid | No | — | **FK → profiles.id** |
| `profile_type` | text | No | `'student'` | |
| `first_name` | text | No | `''` | |
| `last_name` | text | No | `''` | |
| `nickname` | text | Yes | `''` | |
| `email` | text | Yes | `''` | |
| `mobile_1` | text | Yes | `''` | |
| `mobile_2` | text | Yes | `''` | |
| `telephone_home` | text | Yes | `''` | |
| `telephone_work` | text | Yes | `''` | Not used in UI (labelled "school tel") |
| `home_address` | text | Yes | `''` | |
| `work_address` | text | Yes | `''` | Not used in sub-profile UI |
| `school_name` | text | Yes | `''` | |
| `school_address` | text | Yes | `''` | |
| `school_telephone` | text | Yes | `''` | |
| `grade` | text | Yes | `''` | Grade 7–12, Post-Matric, Other |
| `subjects` | jsonb | Yes | `'[]'::jsonb` | Array of up to 10 subject strings |
| `profile_picture_url` | text | Yes | `''` | |
| `created_at` | timestamptz | No | `now()` | |
| `updated_at` | timestamptz | No | `now()` | |

**RLS Policies:** Full CRUD restricted to `auth.uid() = account_holder_id`

**Business Rule:** Standard accounts limited to 1 sub-profile (enforced in UI, not DB).

#### `subscriptions`
Tracks user subscription purchases.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | **PK** |
| `user_id` | uuid | No | — | **FK → profiles.id** |
| `order_number` | text | No | `''` | |
| `status` | text | No | `'active'` | active/expired/cancelled |
| `start_date` | timestamptz | No | `now()` | |
| `end_date` | timestamptz | No | — | 1 year from start |
| `amount_paid` | numeric | No | `0` | |
| `payment_method` | text | Yes | `''` | card/eft |
| `created_at` | timestamptz | No | `now()` | |

**RLS Policies:**
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE/DELETE: **Not allowed**

#### `device_sessions`
Tracks active device sessions (2-device limit enforcement).

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` |
| `user_id` | uuid | No | — |
| `device_fingerprint` | text | No | `''` |
| `user_agent` | text | Yes | `''` |
| `created_at` | timestamptz | No | `now()` |
| `last_active` | timestamptz | No | `now()` |

**RLS Policies:** SELECT, INSERT, DELETE restricted to `auth.uid() = user_id`. No UPDATE.

#### `sponsors`
Sponsorship data for the Careers4Africa-SA26 tracker.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | `''` |
| `email` | text | No | `''` |
| `phone` | text | Yes | `''` |
| `organization` | text | Yes | `''` |
| `amount_pledged` | numeric | No | `0` |
| `amount_paid` | numeric | No | `0` |
| `tier` | text | No | `'bronze'` |
| `status` | text | No | `'pending'` |
| `notes` | text | Yes | `''` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**RLS Policies:**
- SELECT: Public (`true`) — anyone can view sponsors
- INSERT/UPDATE/DELETE: Admin only (checked via `profiles.role = 'admin'`)

#### `sponsorship_allocations`
How sponsorship funds are allocated.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` |
| `sponsor_id` | uuid | Yes | — |
| `category` | text | No | `''` |
| `description` | text | Yes | `''` |
| `quantity` | integer | No | `0` |
| `amount` | numeric | No | `0` |
| `status` | text | No | `'pending'` |
| `created_at` | timestamptz | No | `now()` |

**RLS Policies:** Same as `sponsors` — public read, admin-only write.

### 5.2 Database Functions

#### `handle_new_user()`
- **Type:** Trigger function (SECURITY DEFINER)
- **Trigger:** `AFTER INSERT ON auth.users`
- **Purpose:** Auto-creates a `profiles` row when a new user signs up
- **Behaviour:** Copies email and any metadata (salutation, names, etc.) from `raw_user_meta_data` into the new profile

### 5.3 Storage Buckets

| Bucket | Public | Purpose |
|---|---|---|
| `evolumes` | No (private) | Sub-profile pictures, potentially volume content |

---

## 6. Authentication & Authorisation

### 6.1 Authentication Flow

```
Step 1: Email + Password Entry
  → supabase.auth.signUp() with emailRedirectTo
  → Email verification required (auto-confirm DISABLED)

Step 2: Email Verification
  → User clicks verification link in email
  → Redirected to /signup?verified=true

Step 3: Profile Completion
  → User fills in KYC fields (name, ID, DOB 18+, address, phones)
  → Profile updated via supabase.from("profiles").update()
  → Redirect to /payment page

Login Flow:
  → supabase.auth.signInWithPassword()
  → Check if profile is complete (has first_name + id_number)
    → If incomplete: redirect to /signup?verified=true
  → Check if user has subscriptions
    → If no subscriptions: redirect to /payment
    → If has subscriptions: redirect to /volumes
```

### 6.2 Password Features

- **Auto-generate:** Client-side function generates 12-char password with uppercase, lowercase, digits, and symbols (!@#$%&*)
- **Show/hide toggle:** Eye/EyeOff icon
- **Minimum:** 8 characters

### 6.3 Password Reset

1. User enters email on Login page → clicks "Forgot your password?"
2. `supabase.auth.resetPasswordForEmail()` sends reset link
3. User clicks link → redirected to `/reset-password` with `type=recovery` in URL hash
4. User enters new password → `supabase.auth.updateUser({ password })`

### 6.4 Auth Context (useAuth hook)

```typescript
// src/hooks/useAuth.tsx
interface AuthContextType {
  user: User | null;      // Supabase User object
  session: Session | null; // Supabase Session
  loading: boolean;        // True until initial auth check completes
}
```

- Uses `onAuthStateChange` listener (set up BEFORE `getSession()`)
- Wraps entire app via `<AuthProvider>`
- All components access via `const { user, loading } = useAuth()`

### 6.5 Role-Based Access

- Roles stored in `profiles.role` column (default: `'account_holder'`)
- Admin-only operations (sponsors, allocations) checked via RLS: `profiles.role = 'admin'`
- **Note:** This is NOT the recommended separate `user_roles` table pattern — consider migrating for security

---

## 7. Page-by-Page Specification

### 7.1 Homepage (`/` — `Index.tsx`)

**Purpose:** Landing page introducing the eUCG product.

**Sections:**
1. **Hero** — Full-viewport background (`hero-graduates.jpg`), dark gradient overlay, UCG logo, title, tagline, stats row (1,100+ Careers, 13 Volumes, 10,200+ Bursaries, 25+ Years), two CTAs:
   - "Explore Volumes" → `/volumes`
   - "Sign Up" → `/signup`
2. **Features grid** — 5-column grid of feature cards (13 Volumes, Study/Bursary Info, IP Protected, Trusted Nationwide, 25+ Years)
3. **Volume Preview Grid** — 10 cover images in a 5-column grid linking to `/volumes`, pricing note "ZAR 3,415.00"
4. **CTA banner** — Red gradient with "Start Your Career Journey Today" and Sign Up button

**Access:** Public (all visitors)

### 7.2 Volumes Library (`/volumes` — `Volumes.tsx`)

**Purpose:** Browse all 13 volumes and access extracts.

**Sections:**
1. **Hero** — Standard page hero
2. **Career Volumes (1–10)** — Grid of `VolumeCard` components showing cover images, title, page range. Each links to `/volume/:id`
3. **Career-Related Information (11–13)** — List cards with volume icon, title, description, "View Extract" button
4. **eTraining Guide** — Link to external Gamma training manual

**Access:** Public. No login required for viewing extracts.

**Data source:** `src/lib/volumes.ts` — static array of 13 volume objects:
```typescript
interface Volume {
  id: number;            // 1-13
  title: string;
  description: string;
  pages: string;         // e.g. "Pgs 1 – 144"
  coverImage: string;    // path or empty for vols 11-13
  category: "career" | "guidance";
  subcategories?: string;
}
```

### 7.3 Volume Viewer (`/volume/:id` — `VolumeViewer.tsx`)

**Purpose:** Display PDF extract for a selected volume.

**Layout:**
- Top bar: Back button, volume title, page count
- Main area: Full-height iframe loading `/documents/volume-extract.pdf` with toolbar and navpanes hidden

**Access:** Public. Same PDF (`volume-extract.pdf`) shown for all 13 volumes.

**DRM:** `<DRMProtection />` component active on this page.

### 7.4 About (`/about` — `About.tsx`)

**Purpose:** Company information, contact details, terms & conditions.

**Tabs:**
1. **eUCG** — Product description, stats grid (8 items), edition history (1st–8th), career entry details, pricing cards
2. **IBATUR** — Company profile with Alba Delport photo, vision, mission, corporate stats, clients list
3. **Contact** — Split layout: contact form (name, email, message) + contact info (email, phone, address, website, training manual link)
4. **T&Cs** — 6 terms & conditions sections (IP, Subscription, Account Usage, Content Protection, KYC, Refunds)

**Access:** Public. URL param `?tab=terms` deep-links to T&Cs tab.

### 7.5 Sign Up (`/signup` — `Signup.tsx`)

**Purpose:** 3-step user registration.

**Step 1 — Email & Password:**
- Email input
- Password with show/hide, auto-generate button
- Confirm password
- Submit → `supabase.auth.signUp()`

**Step 2 — Verification Notice:**
- Mail icon, instructions to check email
- Tips about spam folder

**Step 3 — Profile Completion** (after email verification):
- Verified badge
- Fields: Salutation (dropdown), DOB (date picker), First Name, Surname, Nickname, SA ID Number (max 13 chars), Mobile 1, Mobile 2, Tel (Home), Tel (Work), Home Address, Work Address
- Validation: Age ≥ 18, ID ≥ 6 chars
- Submit → updates `profiles` table → redirects to `/payment`

**Access:** Public

### 7.6 Login (`/login` — `Login.tsx`)

**Purpose:** User sign-in.

**Features:**
- Email + password form
- Show/hide password toggle
- "Forgot your password?" link (sends reset email)
- Post-login routing logic:
  - Incomplete profile → `/signup?verified=true`
  - No subscription → `/payment`
  - Has subscription → `/volumes`

**Access:** Public

### 7.7 Reset Password (`/reset-password` — `ResetPassword.tsx`)

**Purpose:** Set new password after clicking reset link in email.

**Behaviour:**
- Checks for `type=recovery` in URL hash; if missing, redirects to `/login`
- New password + confirm form
- `supabase.auth.updateUser({ password })` on submit

**Access:** Public (arrived via email link)

### 7.8 Profile (`/profile` — `Profile.tsx`)

**Purpose:** Account management dashboard.

**Hero banner:** Profile picture, full name with salutation, email, subscription days remaining badge.

**Tabs:**

**Tab 1 — My Profile:**
- Display/edit mode toggle
- Fields: Salutation, First Name, Surname, Nickname, Email (locked), Secondary Email, ID Number (locked), Mobile 1, Mobile 2, Tel (Home), Tel (Work), Home Address, Work Address, Date of Birth (display only)
- Edit saves via `supabase.from("profiles").update()`

**Tab 2 — Sub-Profiles:**
- List existing sub-profiles (max 1 for standard accounts)
- Add/edit form includes:
  - Profile picture upload (max 2MB, stored in `evolumes` bucket)
  - Personal: First Name, Surname, Nickname, Email, Mobile 1/2, Tel (Home), Home Address
  - School: School Name, School Address, School Telephone, Grade (dropdown: Grade 7–12, Post-Matric, Other)
  - Subjects: 10 input blocks for subject names
- Sub-profile card displays: name, type, email, school, grade, mobile, school tel, subjects as tags

**Tab 3 — Subscription:**
- Active subscription card with status badge, order number, start/end dates, amount, days remaining
- "Buy eUCG" button if no active subscription

**Access:** Authenticated only. Redirects to `/login` if not signed in.

### 7.9 Payment (`/payment` — `Payment.tsx`)

**Purpose:** Subscription purchase flow.

**Layout:**
1. **Pricing Card** — ZAR 3,415.00, 1 Year, all 13 volumes, 1 holder + 1 sub-profile, 2 devices, renewal R500/yr
2. **Terms & Conditions** — Scrollable box (must scroll to bottom to enable checkbox)
3. **T&Cs Checkbox** — Disabled until scrolled
4. **Payment Methods:**
   - Credit/Debit Card (Visa/Mastercard) — currently shows "coming soon" toast
   - Direct EFT (ABSA, Nedbank, Standard Bank, FNB, Capitec) — currently shows "coming soon" toast

**Access:** Authenticated only. Shows "Sign In Required" for unauthenticated visitors.

**Note:** Payment integration is NOT yet implemented. Buttons display toast messages directing users to contact IBATUR.

### 7.10 Partners (`/partners` — `Partners.tsx`)

**Purpose:** Partner information organised by type.

**Tabs:**
1. **NPOs** — Placeholder with contact CTA
2. **PBOs** — Placeholder with contact CTA
3. **DBE** — Department of Basic Education endorsement, 9 provincial departments grid
4. **Sponsors** — Summary of clients, links to sponsorship tiers and tracker

**Access:** Public

### 7.11 Testimonials (`/testimonials` — `Testimonials.tsx`)

**Purpose:** Social proof from government and professionals.

**Tabs:**
1. **Ministerial** — Prof Kader Asmal, Ms Naledi Pandor quotes
2. **Provincial MECs** — 9 provincial endorsement quotes in 2-column grid
3. **Professionals** — 4 professional testimonials

**Additional section:** "Why Use The Ultimate Career Guide?" — 9-point fact grid

**Access:** Public

### 7.12 UCG Project (`/ucg-project` — `UCGProject.tsx`)

**Purpose:** Careers4Africa-SA26 project showcase.

**Sections:**
1. **Hero** with project badge
2. **Impact stats** — 200,000 guides, 20,808 schools, 11M+ learners, 53,709 sets
3. **Distribution categories** — Alternating image+text layout (Primary Schools, Secondary Schools, Libraries, Correctional Centres, Community Centres)
4. **Mission & Vision** cards
5. **CTA** — Become a Sponsor / Contact Us

**Access:** Public

### 7.13 Sponsorship (`/sponsorship` — `Sponsorship.tsx`)

**Purpose:** Sponsorship tiers and call-to-action.

**Sections:**
1. **Crisis stats** — 62.4% youth unemployment
2. **Solution** — UCG feature grid
3. **Impact targets** — 4 stats cards
4. **Sponsorship tiers** — Diamond (R183.4M), Platinum (R177.2M), Gold (R78.0M), Silver & Bronze (Custom)
5. **ROI** — Brand exposure, social impact, legacy
6. **CTA** — Email + tracker link

**Access:** Public

### 7.14 Sponsorship Tracker (`/sponsorship-tracker` — `SponsorshipTracker.tsx`)

**Purpose:** Live view of sponsorship progress.

**Features:**
- Summary cards: Total Sponsors, Total Pledged, Total Paid, Allocations count
- Progress bar: Percentage of R438.6M target
- Sponsors table: Name, Organisation, Tier (colour-coded badge), Pledged, Paid, Status
- Empty state with "Become a Sponsor" CTA

**Data source:** Real-time from `sponsors` and `sponsorship_allocations` tables.

**Access:** Public (anyone can view sponsors due to RLS `SELECT true`)

### 7.15 Admin Data (`/admin-data` — `AdminData.tsx`)

**Purpose:** CSV bulk upload tool for database tables.

**Note:** This page is NOT in the navigation menu. Accessible only via direct URL. Route added in `App.tsx` — requires manual URL entry.

**Features:**
- Table selector dropdown (profiles, sponsors, sponsorship_allocations, subscriptions, sub_profiles, device_sessions)
- Column preview for selected table
- Download CSV template
- Upload CSV with row-by-row insert, error reporting

**Access:** Authenticated only (but no admin role check in UI — relies on RLS)

### 7.16 Not Found (`*` — `NotFound.tsx`)

**Purpose:** 404 error page.

**Features:** Logs 404 to console, shows "Page not found" with return home link.

---

## 8. Shared Components

### 8.1 Layout (`Layout.tsx`)

The global wrapper applied to ALL pages via `<Layout>` in `App.tsx`.

**Structure:**
```
┌─────────────────────────────────────┐
│ [Logged-in banner — if auth'd]      │  "Logged in as user@email.com"
├─────────────────────────────────────┤
│ [Logo]  [Title+IBATUR]  [Buy] [☰]  │  Sticky header
├─────────────────────────────────────┤
│ [Buy eUCG sticky bar — mobile only] │  sm:hidden, if logged in
├─────────────────────────────────────┤
│                                     │
│            {children}               │  Page content
│                                     │
├─────────────────────────────────────┤
│ [Footer — 3 columns]               │
│ UCG info | Contact | Quick Links    │
│ [Copyright bar]                     │
└─────────────────────────────────────┘
```

**Header details:**
- Left: UCG logo (h-10)
- Centre (absolutely positioned): "Ultimate Career Guide" + "powered by IBATUR Education CC"
- Right: "Buy eUCG" button (sm+, logged-in only) + hamburger dropdown menu

**Dropdown menu items:**
- Buy eUCG (mobile only, logged-in only)
- Navigation: Home, eVolumes, About, Testimonials, Partners, UCG Project, Sponsorship, Tracker
- Separator
- Profile (logged-in) / Sign In (logged-out)
- Logout (logged-in)

**Active state:** Current route highlighted with `bg-accent font-medium`

### 8.2 DRMProtection (`DRMProtection.tsx`)

Prevents content copying on all pages (mounted in `App.tsx` globally AND in `VolumeViewer.tsx`).

**Blocked actions:**
- Copy (Ctrl+C / Cmd+C)
- Cut (Ctrl+X)
- Print (Ctrl+P)
- Save (Ctrl+S)
- View Source (Ctrl+U)
- PrintScreen key
- F12 (DevTools)
- Right-click context menu
- Drag-and-drop
- Text selection (except in inputs/textareas)

**User feedback:** Toast notification with IP warning message.

### 8.3 NavLink (`NavLink.tsx`)

Custom wrapper around React Router's `NavLink` that supports `activeClassName` and `pendingClassName` props via the `cn()` utility.

### 8.4 UI Components (shadcn/ui)

~50 pre-built accessible components in `src/components/ui/`:

**Most frequently used:**
- `Button` — Primary, secondary, outline, ghost, destructive variants
- `Input` — Text inputs
- `Label` — Form labels
- `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` — Dropdowns
- `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` — Tabbed interfaces
- `Card` — Content containers
- `DropdownMenu` — Header navigation menu
- `Separator` — Visual dividers
- `Badge` — Status badges
- `Progress` — Progress bars
- `Toast` / `Sonner` — Notifications (dual system)

---

## 9. Business Logic & Data Flows

### 9.1 Registration Funnel

```
Visitor → /signup (Step 1)
  ↓ Email + Password submitted
  → Supabase creates auth.users entry
  → handle_new_user() trigger creates profiles entry
  → Verification email sent
  ↓
Visitor checks email → clicks verification link
  ↓
Redirected to /signup?verified=true (Step 3)
  ↓ KYC data submitted
  → profiles table updated
  ↓
Redirected to /payment
  ↓
Payment completed (future)
  → subscriptions record created
  ↓
User accesses /volumes
```

### 9.2 Login Routing Logic

```
Login successful
  ├─ Profile incomplete (no first_name or id_number)?
  │   → /signup?verified=true (complete profile)
  ├─ No subscriptions?
  │   → /payment
  └─ Has subscriptions
      → /volumes
```

### 9.3 Profile Update Flow

```
User on /profile → clicks "Edit"
  → Form fields become editable (except email, ID number)
  → User modifies fields → clicks "Save"
  → supabase.from("profiles").update({...}).eq("id", user.id)
  → Toast success/error
  → Re-fetch all profile data
```

### 9.4 Sub-Profile Creation Flow

```
User on /profile → Sub-Profiles tab → "Add"
  → Form opens: personal details, school info, subjects, profile picture
  → Optional: upload picture (max 2MB) to evolumes/sub-profiles/{userId}/{timestamp}.{ext}
  → supabase.from("sub_profiles").insert({...account_holder_id: user.id})
  → Toast + refresh
```

### 9.5 Subscription Days Calculation

```typescript
const daysRemaining = Math.max(0,
  Math.ceil(
    (new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
);
```

### 9.6 Sponsorship Tracker Data

```
Page loads → parallel fetch:
  supabase.from("sponsors").select("*").order("amount_pledged", desc)
  supabase.from("sponsorship_allocations").select("*")
→ Calculate totals, progress percentage against R438.6M target
→ Render summary cards, progress bar, sponsors table
```

---

## 10. Security & DRM

### 10.1 Row-Level Security (RLS)

All tables have RLS enabled. Access rules:

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | Own only | Own only | Own only | ✗ |
| sub_profiles | Own only | Own only | Own only | Own only |
| subscriptions | Own only | Own only | ✗ | ✗ |
| device_sessions | Own only | Own only | ✗ | Own only |
| sponsors | Public | Admin | Admin | Admin |
| sponsorship_allocations | Public | Admin | Admin | Admin |

### 10.2 Client-Side DRM

The `DRMProtection` component blocks:
- Clipboard operations (copy, cut)
- Keyboard shortcuts (Ctrl+C/X/P/S/U, PrintScreen, F12)
- Context menu (right-click)
- Drag events
- Text selection (except form inputs)

**Limitation:** Client-side only; determined users can bypass via DevTools disable. Server-side protections (watermarking, PDF encryption) should be added for production.

### 10.3 Content Access Model

Currently ALL volumes show the same sample PDF (`volume-extract.pdf`). Full volume PDFs are NOT yet integrated. When implementing:
- Store full PDFs in Supabase Storage (`evolumes` bucket, private)
- Generate signed URLs server-side only for users with active subscriptions
- Apply PDF watermarking with user email

### 10.4 Session Management

- Auth sessions persisted in `localStorage`
- Auto-refresh enabled
- `device_sessions` table tracks active devices (2-device limit — enforcement logic not yet implemented)

---

## 11. Storage & Assets

### 11.1 Static Assets (public/)

| Path | Size Approx. | Purpose |
|---|---|---|
| `/images/hero-graduates.jpg` | ~200KB | Hero background on all page heroes |
| `/images/ucg-logo.png` | ~50KB | UCG brand logo |
| `/images/ibatur-logo.jpg` | ~20KB | IBATUR Education logo |
| `/images/alba-picture.jpg` | ~100KB | Publisher portrait |
| `/images/covers/volume-01–10.jpg` | ~50KB each | Volume cover thumbnails |
| `/documents/volume-extract.pdf` | ~5MB | Sample PDF extract |

### 11.2 Supabase Storage

| Bucket | Path Pattern | Purpose |
|---|---|---|
| `evolumes` | `sub-profiles/{userId}/{timestamp}.{ext}` | Sub-profile pictures |

---

## 12. Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | React DOM renderer |
| react-router-dom | ^6.30.1 | Client-side routing |
| @supabase/supabase-js | ^2.97.0 | Supabase client SDK |
| @tanstack/react-query | ^5.83.0 | Server state management |
| @hookform/resolvers | ^3.10.0 | Form validation resolvers |
| react-hook-form | ^7.61.1 | Form management |
| zod | ^3.25.76 | Schema validation |
| class-variance-authority | ^0.7.1 | Component variant management |
| clsx | ^2.1.1 | Conditional classnames |
| tailwind-merge | ^2.6.0 | Tailwind class merging |
| tailwindcss-animate | ^1.0.7 | Animation utilities |
| lucide-react | ^0.462.0 | Icon library |
| sonner | ^1.7.4 | Toast notifications |
| recharts | ^2.15.4 | Data charts |
| date-fns | ^3.6.0 | Date utilities |
| cmdk | ^1.1.1 | Command palette |
| vaul | ^0.9.9 | Drawer component |
| next-themes | ^0.3.0 | Theme management |
| input-otp | ^1.4.2 | OTP input |
| embla-carousel-react | ^8.6.0 | Carousel |
| react-day-picker | ^8.10.1 | Date picker |
| react-resizable-panels | ^2.1.9 | Resizable panels |
| @radix-ui/* | Various | 25+ UI primitives (see package.json) |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| vite | ^5.4.19 | Build tool |
| typescript | ^5.8.3 | Type checking |
| vitest | ^3.2.4 | Testing |
| @testing-library/react | ^16.0.0 | React testing utils |
| @testing-library/jest-dom | ^6.6.0 | DOM matchers |
| jsdom | ^20.0.3 | Browser env for tests |
| eslint | ^9.32.0 | Linting |
| tailwindcss | ^3.4.17 | CSS framework |
| postcss | ^8.5.6 | CSS processing |
| autoprefixer | ^10.4.21 | Vendor prefixes |
| lovable-tagger | ^1.1.13 | Lovable component tagging |

---

## 13. Environment Variables

All environment variables are auto-managed and stored in `.env`:

| Variable | Purpose | Editable? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | NO — auto-generated |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | NO — auto-generated |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | NO — auto-generated |

**Backend secrets** (configured in Lovable Cloud, not in code):
- `SUPABASE_DB_URL` — Database connection string
- `SUPABASE_URL` — Supabase API URL
- `SUPABASE_PUBLISHABLE_KEY` — Anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Admin key (NEVER expose client-side)
- `LOVABLE_API_KEY` — Lovable AI integration key

---

## 14. Maintenance Procedures

### 14.1 Updating Volume Content

1. Replace `/public/documents/volume-extract.pdf` with the new PDF
2. If implementing per-volume PDFs:
   - Upload to Supabase Storage `evolumes` bucket
   - Update `VolumeViewer.tsx` to fetch signed URLs per volume
   - Verify RLS on storage bucket

### 14.2 Adding/Editing Volume Metadata

Edit `src/lib/volumes.ts` — update the `volumes` array:
```typescript
{
  id: 14,           // New volume number
  title: "New Topic",
  description: "...",
  pages: "Pgs X – Y",
  coverImage: "/images/covers/volume-14.jpg",  // Add image to public/images/covers/
  category: "career" | "guidance",
}
```

### 14.3 Managing Sponsors (Admin)

**Option A:** Use `/admin-data` page (direct URL, requires admin-role user):
1. Select "sponsors" table
2. Download CSV template
3. Fill in sponsor data
4. Upload CSV

**Option B:** Use Lovable Cloud backend panel to insert directly.

### 14.4 Updating Terms & Conditions

Edit `src/pages/About.tsx` → `TabsContent value="terms"` section (line ~367).
Also update `src/pages/Payment.tsx` → Terms section (line ~71).

### 14.5 Updating Pricing

Search and replace across files:
- `src/pages/Index.tsx` — "ZAR 3,415.00" in Our Library section
- `src/pages/Payment.tsx` — Pricing card and terms
- `src/pages/About.tsx` — Pricing section in eUCG tab
- `src/components/Layout.tsx` — Mobile sticky bar price

### 14.6 Managing Users

Use Lovable Cloud backend:
- View/edit profiles
- Reset passwords
- Manage subscriptions
- Set user roles (update `profiles.role` to `'admin'` for admin access)

### 14.7 Database Migrations

All schema changes go through Supabase migrations in `supabase/migrations/`. These are auto-applied on deploy.

**NEVER manually edit:**
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/config.toml`
- `.env`

### 14.8 Deploying Updates

1. Make changes in Lovable editor
2. Changes auto-preview in the right panel
3. Click "Publish" to deploy to `ultimatecareerguide.lovable.app`

---

## 15. Troubleshooting Guide

### 15.1 "Profile not loading"

**Cause:** Profile row not created for user.
**Fix:** Check if `handle_new_user()` trigger exists on `auth.users`. If user was created before trigger, manually insert a profile row with matching `id`.

### 15.2 "Can't edit profile fields"

**Cause:** RLS policy blocks the update.
**Check:** Ensure user is authenticated and `auth.uid()` matches the profile `id`.

### 15.3 "Email verification not working"

**Cause:** Auto-confirm may be enabled.
**Fix:** In Lovable Cloud auth settings, ensure email confirmation is REQUIRED (auto-confirm disabled).

### 15.4 "Sub-profile picture upload fails"

**Causes:**
- File > 2MB
- `evolumes` storage bucket doesn't exist or has wrong permissions
- User not authenticated

**Fix:** Check bucket exists, verify RLS allows authenticated uploads.

### 15.5 "Sponsorship tracker shows empty"

**Cause:** No data in `sponsors` table, or RLS blocking reads.
**Check:** Sponsors table has `SELECT true` policy (public read). If no data, upload via admin panel.

### 15.6 "Payment buttons don't work"

**Expected:** Payment integration is not yet implemented. Buttons show toast messages directing to IBATUR contact.

### 15.7 "404 on page refresh"

**Cause:** Server not configured for SPA routing.
**Fix:** Ensure hosting serves `index.html` for all routes (Lovable handles this automatically).

### 15.8 "DRM toast appearing on all pages"

**Expected:** `DRMProtection` is mounted globally in `App.tsx`. Any copy/right-click/keyboard shortcut triggers the IP warning.

### 15.9 "User sees 'Sign In Required' on payment page"

**Cause:** User is not authenticated.
**Flow:** User must sign up → verify email → complete profile → then access payment.

### 15.10 "Dark mode not working"

**Status:** Dark mode CSS tokens are defined but no theme toggle is implemented. The app uses light mode by default. To enable, add a theme toggle using the `next-themes` package (already installed).

---

## Appendix A: Route Map

| Route | Component | Auth Required | Purpose |
|---|---|---|---|
| `/` | Index | No | Homepage |
| `/volumes` | Volumes | No | Volume library |
| `/volume/:id` | VolumeViewer | No | PDF extract viewer |
| `/about` | About | No | About, Contact, T&Cs |
| `/login` | Login | No | Sign in |
| `/signup` | Signup | No | Registration |
| `/reset-password` | ResetPassword | No | Password reset |
| `/payment` | Payment | Yes | Subscription purchase |
| `/profile` | Profile | Yes | Account management |
| `/partners` | Partners | No | Partner info |
| `/testimonials` | Testimonials | No | Social proof |
| `/ucg-project` | UCGProject | No | SA26 project |
| `/sponsorship` | Sponsorship | No | Sponsorship tiers |
| `/sponsorship-tracker` | SponsorshipTracker | No | Live tracker |
| `/admin-data` | AdminData | Yes* | CSV upload (*hidden) |
| `*` | NotFound | No | 404 page |

## Appendix B: Icon Reference

All icons from `lucide-react`. Key icons used:
- `BookOpen` — Volumes/learning
- `GraduationCap` — Education/graduates
- `Shield` — Security/protection/subscription
- `User` / `Users` — Profiles/people
- `Heart` — Sponsorship/community
- `ShoppingCart` — Buy eUCG
- `Menu` — Navigation hamburger
- `ArrowRight` / `ArrowLeft` — Navigation
- `Mail` / `Phone` / `MapPin` — Contact info
- `Edit2` / `Save` / `X` / `Plus` / `Trash2` — CRUD actions
- `Eye` / `EyeOff` — Password visibility
- `Camera` — Profile picture
- `School` — School information
- `CheckCircle` — Success/verification
- `Target` / `TrendingUp` — Goals/progress

## Appendix C: NPM Scripts

```bash
bun run dev        # Start development server (Vite)
bun run build      # Production build
bun run build:dev  # Development build
bun run preview    # Preview production build
bun run lint       # Run ESLint
bun run test       # Run tests (Vitest)
bun run test:watch # Run tests in watch mode
```

---

**Document maintained by:** IBATUR Education CC  
**Platform:** Lovable (https://lovable.dev)  
**Last updated:** 7 March 2026

### Change Log

| Version | Date | Changes |
|---|---|---|
| 1.0 | 6 Mar 2026 | Initial document creation |
| 1.1 | 7 Mar 2026 | Added missing `/admin-data` route to App.tsx, removed duplicate 404 route, updated document version and date |
