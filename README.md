# 🐾 Scruffs.ae – Mobile Pet Grooming App

Premium mobile pet grooming booking platform for Dubai.

## ✨ Features

- **Landing page** – Hero, services, how it works, why choose us, Dubai service areas, testimonials
- **7-step booking wizard** – Pet type → Service → Location → Date/Time → Pet details → Contact → Review
- **Real-time slot booking** – Slots auto-generated for 90 days, instantly locked on booking
- **Booking confirmation page** – WhatsApp share, reference number, next steps
- **Admin dashboard** – Stats, upcoming appointments, status updates, slot management
- **Dubai-specific** – AED pricing, all Dubai areas, WhatsApp integration
- **Mobile-first** – Fully responsive, touch-friendly

---

## 🚀 Quick Start

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- A PostgreSQL database (recommended: [Neon.tech](https://neon.tech) – free tier)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

For local development, SQLite works:
```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="scruffs2024"
ADMIN_SECRET="your-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database
```bash
npm run db:push    # Push schema to database
npm run db:seed    # Seed time slots (90 days)
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🌐 Deploy to Vercel

### 1. Set up production database
1. Create a free account at [Neon.tech](https://neon.tech)
2. Create a new project and copy the connection string

### 2. Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 3. Set environment variables in Vercel dashboard:
```
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
ADMIN_PASSWORD=your-secure-password
ADMIN_SECRET=your-long-random-secret-string
NEXT_PUBLIC_APP_URL=https://scruffs.ae
```

### 4. Update schema for PostgreSQL
In `prisma/schema.prisma`, change:
```prisma
datasource db {
  provider = "postgresql"   # ← change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 5. Run migrations
```bash
npx prisma migrate deploy
npm run db:seed
```

---

## 🔐 Admin Panel

Access at `/admin` (protected by cookie-based auth).

Default password (change in production!): `scruffs2024`

**Admin features:**
- Dashboard with stats and upcoming appointments
- Full appointments table with search, filter by status/date
- Update appointment status (Pending → Confirmed → In Progress → Completed)
- Add internal notes
- Direct WhatsApp link to customers
- Slot management – block/unblock individual time slots

---

## 📁 Project Structure

```
app/
├── page.tsx              Landing page
├── book/page.tsx         Booking wizard
├── booking/[id]/page.tsx Confirmation page
├── admin/                Admin dashboard (protected)
│   ├── page.tsx          Dashboard overview
│   ├── appointments/     Manage all bookings
│   └── slots/            Manage availability
└── api/                  API routes
    ├── bookings/         Create & fetch bookings
    ├── slots/            Get available slots
    └── admin/            Admin-only endpoints

components/
├── booking/              Multi-step booking wizard
├── landing/              Landing page sections
├── admin/                Admin UI components
└── Navbar.tsx + Footer.tsx

lib/
├── prisma.ts             Database client
├── utils.ts              Helpers, pricing, areas
└── scheduling.ts         Slot generation logic

prisma/
├── schema.prisma         Database schema
└── seed.ts               Initial data seeding
```

---

## 💰 Service Pricing (AED)

| Service | Dog Small | Dog Medium | Dog Large | Cat |
|---------|-----------|------------|-----------|-----|
| Basic   | 150       | 200        | 250       | 180 |
| Special | 250       | 320        | 400       | 280 |
| Full    | 380       | 480        | 580       | 380 |

---

## 📞 Business Info

- **Instagram:** [@scruffs.ae](https://instagram.com/scruffs.ae)
- **WhatsApp:** +971 50 123 4567
- **Operating Hours:** 9:00 AM – 6:30 PM, 7 days a week
- **Coverage:** All Dubai areas

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Prisma + PostgreSQL (SQLite for dev)
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Dates:** date-fns
- **Deployment:** Vercel
