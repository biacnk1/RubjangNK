# RubjangNK (รับจ้างหนองคาย)

แพลตฟอร์มค้นหาและจับคู่ช่าง/แม่บ้าน ท้องถิ่นในจังหวัดหนองคาย รองรับการใช้งานผ่าน LINE LIFF (LINE Front-end Framework) และเว็บบราวเซอร์ทั่วไป

## ฟีเจอร์หลัก (Core Features)
- **ระบบค้นหาตามระยะทาง (Distance-Based Search)**: ค้นหาช่างหรือแม่บ้านที่อยู่ใกล้ตำแหน่งของคุณมากที่สุด
- **ระบบแชทแบบเรียลไทม์ (Real-time Messaging Chat)**: เชื่อมต่อพูดคุย สอบถามรายละเอียด และตกลงราคาผ่านระบบแชทเรียลไทม์ที่เชื่อมกับ Supabase Database
- **Responsive & LINE LIFF Compatible**: ออกแบบ UI/UX ให้ใช้งานได้อย่างลงตัวทั้งบน Desktop และแอปพลิเคชัน LINE (LIFF WebView)
- **หมวดหมู่บริการแนะนำ**: แบ่งหมวดหมู่ครอบคลุม ได้แก่ ช่างแอร์, ช่างประปา, ช่างไฟฟ้า, ช่างซ่อมบำรุง/ต่อเติม และแม่บ้าน/ทำความสะอาด พร้อมไอคอน 3D สีสันสดใสสวยงาม

---

## เทคโนโลยีหลัก (Tech Stack)
- **Frontend Framework**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS (CSS Modules)
- **Database / Backend**: Supabase (Postgres, Realtime Engine, PostGIS สำหรับค้นหาพิกัด)
- **Testing**: Playwright E2E Testing Framework

---

## ขั้นตอนการติดตั้งและใช้งาน (Getting Started)

### 1. โคลนและติดตั้ง Dependencies
```bash
git clone <repository-url>
cd rubjangNK
npm install
```

### 2. ตั้งค่าฐานข้อมูล Supabase Local (Docker)
โปรเจกต์นี้ใช้ Supabase Local Development ในการรันฐานข้อมูลในเครื่อง:
```bash
# เริ่มต้นใช้งาน Supabase CLI และรัน Docker containers
npx supabase start
```
ระบบจะรัน Docker containers ทั้งหมดขึ้นมา (Postgres, Auth, Storage, Studio) และรัน migrations ล่าสุดโดยอัตโนมัติ

### 3. ตั้งค่าสภาพแวดล้อม (Environment Variables)
คัดลอกไฟล์ต้นแบบ `.env.sample` ไปยัง `.env.local` จากนั้นอัปเดตค่าต่างๆ ให้ถูกต้อง:
```bash
cp .env.sample .env.local
```

ในไฟล์ `.env.local`:
```env
NEXT_PUBLIC_LIFF_ID=your-line-liff-id-here
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. รัน Development Server
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่ [http://localhost:3001](http://localhost:3001) เพื่อดูผลลัพธ์

---

## โครงสร้างโฟลเดอร์ของ Supabase Migrations
 migrations สำหรับการตั้งค่าโครงสร้างฐานข้อมูล (Schema) อยู่ภายใต้โฟลเดอร์ `supabase/migrations/`:
- `20260620160502_init_schema.sql`: โครงสร้างตารางพื้นฐาน (`profiles`, `service_categories`, `technician_applications`, `technician_profiles`)
- `20260620163136_phase2_chat_trust.sql`: ตารางระบบห้องแชทและข้อความ (`chat_rooms`, `chat_messages`) พร้อม RLS Policies
- `20260620165100_phase3_location.sql`: ฟังก์ชันภูมิศาสตร์สำหรับหาระยะห่างของช่างด้วย PostGIS
- `20260620175500_seed_categories.sql`: ข้อมูลหมวดหมู่เริ่มต้น (ช่างแอร์, ประปา, ไฟฟ้า, ซ่อมบำรุง, แม่บ้าน)
- `20260620182000_relax_fk.sql` & `20260620182500_relax_chat_fk.sql`: ปรับปรุงเงื่อนไข Foreign Key เพื่อรองรับการทดสอบที่ยืดหยุ่นขึ้น

---

## การทดสอบแบบ E2E (End-to-End Testing)
โปรเจกต์นี้ใช้ Playwright สำหรับทดสอบ E2E flows (เช่น การลงทะเบียน และการแชทกับช่าง):
```bash
# ติดตั้งบราวเซอร์ของ Playwright (หากรันครั้งแรก)
npx playwright install

# รันการทดสอบทั้งหมด
npx playwright test
```

---

## การเตรียมอัปขึ้น Github / Production
1. ตรวจสอบสถานะของ Git ในโปรเจกต์
2. เตรียมค่า Config สภาพแวดล้อม (Production Supabase Endpoint) ในระบบ Vercel/Netlify
3. ตรวจสอบให้มั่นใจว่ารัน `npm run build` ผ่านสมบูรณ์ก่อนทำการ Push ขึ้น Repo
