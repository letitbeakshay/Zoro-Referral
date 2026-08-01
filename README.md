# Zoro Gym Referral Management Web Application

Zoro Gym Referral is a production-ready, mobile-first web application designed for existing gym members to lookup their unique referral codes and invite friends, allowing guests to register for membership discounts, and administrators to track conversion funnels and distribute rewards.

The application features a minimalist, Apple + Stripe inspired premium design system built with custom forest green color schemes, smooth micro-interactions, responsive grid lists for mobile devices, and an admin command console.

---

## ⚡ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & Vanilla CSS Variables
- **UI Components**: Shadcn UI / Radix primitives
- **ORM & Database**: Prisma ORM & Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Cookie-based SSR session management)
- **QR Code**: Local SVG Canvas generator
- **Validation**: React Hook Form & Zod Schemas

---

## 📂 Production Folder Structure
```
├── prisma/
│   ├── schema.prisma             # Prisma Database models (PostgreSQL)
│   └── seed.ts                   # Seed script (Settings, Test Members, Auth Admin)
├── src/
│   ├── app/                      # Next.js App Router folders
│   │   ├── admin/                # Admin Panel pages (Layout, Dashboard, Members, Referrals, Settings)
│   │   ├── api/                  # API route handlers (auth, members, leads, rewards, settings)
│   │   ├── customer/             # Public Guest conversion pages (Lead form, Thank you)
│   │   ├── member/               # Member search pages (Lookup by phone, Share success, QR)
│   │   ├── login/                # Staff Sign-in page
│   │   ├── layout.tsx            # Global HTML shell and ToastProvider
│   │   └── globals.css           # Custom Tailwind v4 styling theme and CSS variables
│   ├── components/               # Shareable components
│   │   ├── ui/                   # Custom UI Primitives (Card, Table, Select, Input, Button, Dialog, Toast)
│   │   └── DashboardCharts.tsx   # Dashboard visual statistics (Recharts)
│   ├── lib/                      # Core configuration libraries
│   │   ├── prisma.ts             # Prisma Client client singleton
│   │   ├── utils.ts              # Class name merging utility (cn)
│   │   └── validators.ts         # Zod schemas for input validation
│   └── middleware.ts             # Supabase SSR cookie-based Auth middleware router
├── supabase_schema.sql           # Raw SQL schema & indices for Supabase SQL Editor
└── README.md                     # Setup instructions & documentation
```

---

## 🛠️ Local Setup & Configuration

Follow these steps to configure and run the application locally:

### 1. Database Configuration
1. Create a free PostgreSQL database on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard, create a new query, paste the contents of `supabase_schema.sql` (found in the project root), and click **Run**. This creates the required tables, indices, and default configurations.

### 2. Environment Setup
1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your Supabase project parameters:
   - `DATABASE_URL`: Connection string of your database transaction pooler (port 6543, with `?pgbouncer=true`).
   - `DIRECT_URL`: Connection string of your direct database connection (port 5432).
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase API endpoint.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project public anon key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase project secret service role key (required to seed the initial Admin Auth user).

### 3. Dependencies & Client Types
Install all packages and generate the Prisma client types:
```bash
npm install
npx prisma generate
```

### 4. Database Seeding (Admin Creation)
Execute the database seed script using `tsx` to set up the default settings row, seed a test member (`Akshay Kumar` / `9999999999` / code `ZR1001`), and create the default admin account inside Supabase Auth:
```bash
npx prisma db seed
```
*Default admin credentials created*:
- **Email**: `admin@zorogym.com`
- **Password**: `ZoroAdmin2026!` *(Change this password upon first login)*

### 5. Running the Application
Start the Next.js local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your mobile browser or emulator.

---

## 🚀 Deployment Guide for Vercel

The application is fully optimized for Vercel serverless functions:

1. Push your project code to a private GitHub repository.
2. Go to the [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Expand the **Environment Variables** section and configure:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (Set to your Vercel URL, e.g. `https://zoro-referral.vercel.app`)
5. Click **Deploy**. Vercel will automatically compile the TypeScript files, optimize the assets, and deploy the application.

---

## ⚖️ Business & Referral Validation Rules

1. **Uniqueness**:
   - A member phone number can only belong to one member.
   - A customer phone number can only be referred once in the system.
   - Referral codes are permanent, unique, and sequential (`ZR1001`, `ZR1002`, etc.) generated on member creation.
2. **Referral Validation**:
   - The customer phone number must not match the referrer's phone number (prevents self-referral).
   - Referrals are only valid if the referring member's status is `active`.
3. **Reward Pipeline**:
   - Leads progress sequentially: `Lead` → `Visited` → `Joined` → `Paid Month 1` → `Paid Month 2` → `Paid Month 3`.
   - On reaching `Paid Month 3`, the referral status becomes `Reward Eligible` (`eligible`).
   - The Gym admin must choose a reward: **1-Month Membership Extension** or **₹500 Wallet Credit**. Once chosen, status updates to `Reward Issued` (`issued`) and the transaction is recorded.

---

## 🔌 Future Expansion Architecture Hooks
The codebase is structured to facilitate these integrations:
- **OTP Login**: Middleware is configured to intercept sessions. Integrate a phone gateway (e.g. Twilio) by replacing `signInWithPassword` in `/login/page.tsx` with `signInWithOtp`.
- **WhatsApp Cloud API**: The sharing trigger utilizes standard URL schemes. In Phase 3, trigger a server-side curl request to the WhatsApp Business API inside `api/referral/route.ts` when a new lead registers.
- **Razorpay/Membership Billing**: Add webhook route under `api/webhooks/razorpay` to automatically increment referral statuses (`Paid Month 1/2/3`) upon successful monthly subscription payments.
