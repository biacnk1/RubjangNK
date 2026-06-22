# RubjangNK — Roadmap & Work Breakdown

สถานะ ณ วันที่ 2026-06-22 — สิ่งที่ทำแล้ว ✅ vs สิ่งที่ต้องทำ 🔲

---

## สรุปสถานะปัจจุบัน (Current State)

| ฟีเจอร์ | สถานะ |
|---------|--------|
| Homepage + Category Grid | ✅ ใช้งานได้ (ดึงจาก DB, fallback mock) |
| Distance Search (PostGIS) | ✅ ใช้งานได้ (Geolocation + sort by distance) |
| Technician Card | ✅ แสดงชื่อ, หมวดหมู่, avatar, Verified badge, ค่าจ้างเริ่มต้น |
| Registration (LINE LIFF) | ✅ ลงทะเบียนได้, LIFF init fix แล้ว, รูปโปรไฟล์เปลี่ยนได้ |
| Chat (Supabase Realtime) | ✅ พื้นฐานใช้ได้ (room + messages) |
| Supabase Cloud | ✅ ย้ายจาก localhost แล้ว |
| Netlify Deploy | ✅ Build ผ่าน, env vars ตั้งค่าแล้ว |

---

## Part 1 — Security & Data Integrity ✅

### 1.1 ~~Validate avatarUrl server-side~~ ✅
- ตรวจ hostname LINE CDN + รองรับ upload ไฟล์เอง (Supabase Storage)

### 1.2 ~~Fix default rating_avg~~ ✅
- `rating_avg: null` แทน `5.0`, card แสดง "ยังไม่มีรีวิว"

### 1.3 ~~Replace `as any` casts~~ ✅
- ใช้ destructure `app = t.technician_applications` แทน cast

### 1.4 ~~อัตราค่าจ้างเริ่มต้น~~ ✅
- field ใหม่ `starting_rate` ในฟอร์มสมัคร (ไม่บังคับ)
- แสดงบน card เฉพาะเมื่อกรอก

### 1.5 ~~รูปโปรไฟล์ editable~~ ✅
- ดึงจาก LINE เป็น default, กดเปลี่ยน/อัพโหลดเองได้
- Upload ผ่าน Supabase Storage (`avatars` bucket)

---

## Part 2 — UI / UX Polish 🎨

ปรับ UI ให้สวยขึ้นตาม DESIGN.md ก่อนเปิดให้คนใช้

### 2.1 ~~Avatar styles → CSS Module~~ ✅
- ย้าย inline style เข้า `.avatarImage`, `.avatarPlaceholder` แล้ว

### 2.2 ใช้ `next/image` แทน `<img>` สำหรับ avatar 🔲
- Allowlist `profile.line-scdn.net` + Supabase Storage domain ใน remotePatterns

### 2.3 Search bar ทำงานจริง 🔲
- เพิ่ม client-side filter ตามชื่อ/หมวดหมู่

### 2.4 Category filter 🔲
- คลิกหมวดหมู่ → filter แสดงเฉพาะช่างในหมวดนั้น

### 2.5 Empty state & Loading skeleton 🔲
- skeleton loader + empty state เมื่อไม่มีช่างในหมวด/พื้นที่

---

## Part 3 — Chat & Messaging 💬

ระบบแชทพื้นฐานมีแล้ว แต่ต้องทำให้ใช้งานได้จริง

### 3.1 Chat notification / unread count 🔲
- แสดงจำนวนข้อความที่ยังไม่อ่านบน Navbar

### 3.2 Realtime subscription 🔲
- ตรวจสอบว่า Supabase Realtime ทำงานบน cloud instance

### 3.3 Chat UX improvements 🔲
- แสดงเวลาส่ง, scroll to bottom อัตโนมัติ

---

## Part 4 — ID Verification (Self-service) 🪪

ไม่มี admin dashboard — ช่างส่งรูปบัตรประชาชนเอง, verify ผ่าน DB โดยตรง

### 4.1 หน้าส่งบัตรประชาชน 🔲
- route `/verify` — ช่างอัพโหลดรูปบัตรประชาชน
- เก็บใน Supabase Storage (private bucket)
- อัพเดท status เป็น `pending_verification`

### 4.2 Verify ผ่าน Supabase Dashboard 🔲
- เจ้าของโปรเจกต์ตรวจรูปบัตรใน Storage แล้ว update `is_verified = true` ผ่าน SQL/Studio
- ไม่ต้องสร้าง admin route

---

## Part 5 — Review & Rating System ⭐

### 5.1 Review form 🔲
- ลูกค้าให้คะแนน 1-5 ดาว + ข้อความรีวิว
- Migration: สร้างตาราง `reviews`

### 5.2 Rating aggregation 🔲
- อัพเดท `rating_avg` / `review_count` อัตโนมัติ (trigger หรือ server action)

### 5.3 แสดงรีวิวบนโปรไฟล์ช่าง 🔲
- หน้ารายละเอียดช่าง (`/technician/[id]`)

---

## Part 6 — Technician Profile Page 👤

### 6.1 หน้ารายละเอียดช่าง (`/technician/[id]`) 🔲
- ข้อมูลครบ: ชื่อ, หมวดหมู่, ประสบการณ์, portfolio, rating, รีวิว
- ปุ่มติดต่อ: แชท / LINE OA / โทร

### 6.2 Portfolio gallery 🔲
- แสดงรูปผลงาน (upload ตอนสมัคร หรือเพิ่มทีหลัง)

---

## Part 7 — LINE OA Integration 📱

### 7.1 Push notification ผ่าน LINE OA 🔲
- แจ้งช่างเมื่อมีลูกค้าติดต่อ / แจ้งลูกค้าเมื่อช่างตอบ

### 7.2 Rich Menu 🔲
- เพิ่ม Rich Menu สำหรับ navigation หลัก

---

## ลำดับความสำคัญ (Priority Order)

```
Part 1 (Security)        ✅ เสร็จแล้ว
  ↓
Part 2 (UI Polish)       ← ทำให้หน้าตาดีก่อนเปิดให้คนใช้
  ↓
Part 6 (Profile Page)    ← ต้องมีก่อน Review
  ↓
Part 3 (Chat)            ← ทำให้ใช้งานจริงได้
  ↓
Part 5 (Reviews)         ← สร้างความน่าเชื่อถือ
  ↓
Part 4 (ID Verification) ← self-service, ไม่มี admin route
  ↓
Part 7 (LINE OA)         ← เพิ่ม engagement
```
