# RubjangNK (รับจ้างหนองคาย)

แพลตฟอร์มจับคู่ช่าง/แม่บ้านท้องถิ่น จ.หนองคาย — ฟรี ไม่มีค่าคอม  
รองรับ LINE LIFF + เว็บบราวเซอร์ | Deploy บน Netlify + Supabase Cloud

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + CSS Modules |
| Auth | LINE Login via LIFF (`@line/liff`) |
| Database | Supabase (Postgres + PostGIS + Realtime) |
| Hosting | Netlify (frontend) + Supabase Cloud (backend) |
| Testing | Playwright E2E |

## Getting Started

```bash
git clone <repository-url>
cd rubjangNK
npm install
```

สร้างไฟล์ `.env.local`:
```env
NEXT_PUBLIC_LIFF_ID=<your-line-liff-id>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

```bash
npm run dev          # http://localhost:3001
npm run build        # production build
npx playwright test  # E2E tests
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage — category grid + technician cards
│   ├── register/             # Technician registration (LIFF)
│   ├── chat/                 # Real-time messaging
│   └── auth/callback/        # Supabase auth callback
├── components/
│   ├── TechnicianCard.tsx     # Technician profile card
│   ├── DistanceSearchList.tsx # Geolocation-based sort
│   ├── ChatSidebar.tsx        # Chat room list
│   ├── LiffProvider.tsx       # LINE LIFF context
│   └── Navbar.tsx             # Navigation bar
└── utils/supabase/
    ├── client.ts              # Browser client
    ├── server.ts              # Server client (SSR)
    └── admin.ts               # Service-role client (bypasses RLS)

supabase/migrations/           # Database schema migrations
```

## Database Migrations

| Migration | Description |
|-----------|-------------|
| `init_schema` | Core tables: `profiles`, `service_categories`, `technician_applications`, `technician_profiles` |
| `phase2_chat_trust` | Chat rooms + messages with RLS |
| `phase3_location` | PostGIS distance function |
| `seed_categories` | Default categories (แอร์, ประปา, ไฟฟ้า, ซ่อมบำรุง, แม่บ้าน) |
| `technician_private_info` | Phone numbers (service_role only) |

## Roadmap

ดูแผนงานและ work breakdown ที่ [ROADMAP.md](ROADMAP.md)
