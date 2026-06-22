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
| Chat (Supabase Realtime) | ✅ ครบ — unread badge, read status, realtime |
| Technician Profile | ✅ /technician/[id] — stats, reviews, portfolio |
| Reviews & Rating | ✅ star picker, aggregation trigger, duplicate prevention |
| ID Verification | ✅ /verify — upload + pending status |
| LINE Push Notification | ✅ Edge Function + DB webhook |
| Supabase Cloud | ✅ ย้ายจาก localhost แล้ว |
| Netlify Deploy | ✅ Build ผ่าน, env vars ตั้งค่าแล้ว |

---

## Part 1 — Security & Data Integrity ✅

### 1.1 ~~Validate avatarUrl server-side~~ ✅
### 1.2 ~~Fix default rating_avg~~ ✅
### 1.3 ~~Replace `as any` casts~~ ✅
### 1.4 ~~อัตราค่าจ้างเริ่มต้น~~ ✅
### 1.5 ~~รูปโปรไฟล์ editable~~ ✅
### 1.6 ~~Navbar เหลือเฉพาะ CTA~~ ✅

---

## Part 2 — UI / UX Polish ✅

### 2.1 ~~Avatar styles → CSS Module~~ ✅
### 2.2 ~~ใช้ `next/image` แทน `<img>` สำหรับ avatar~~ ✅
### 2.3 ~~Search bar ทำงานจริง~~ ✅
### 2.4 ~~Category filter~~ ✅
### 2.5 ~~Empty state & Loading skeleton~~ ✅

---

## Part 3 — Chat & Messaging ✅

### 3.1 ~~แก้บั๊ก technician_id ผิดในแชต~~ ✅
### 3.2 ~~Chat notification / unread count~~ ✅
- Navbar แสดง badge จำนวนข้อความที่ยังไม่อ่าน (desktop + mobile)
- Realtime subscription บน chat_messages INSERT เพื่อ refresh count
- chat_read_status table + markRoomAsRead on open/new message

### 3.3 ~~Realtime subscription~~ ✅
- Supabase Realtime ทำงานบน cloud instance แล้ว (confirmed)

### 3.4 ~~Chat UX improvements~~ ✅
- เวลาส่ง + scroll to bottom อัตโนมัติ (implemented already)

---

## Part 4 — ID Verification (Self-service) ✅

### 4.1 ~~หน้าส่งบัตรประชาชน~~ ✅
- route `/verify` — อัพโหลดรูปบัตรประชาชน
- เก็บใน Supabase Storage (private bucket `id-documents`)
- อัพเดท id_verification_status เป็น `pending`
- 🔲 ต้องสร้าง bucket `id-documents` (private) ใน Supabase Dashboard

### 4.2 ~~Verify ผ่าน Supabase Dashboard~~ ✅
- เจ้าของโปรเจกต์ตรวจรูปบัตรใน Storage แล้ว update `id_verification_status = 'approved'` ผ่าน SQL/Studio

---

## Part 5 — Review & Rating System ✅

### 5.1 ~~Review form~~ ✅
- Star picker (1-5) + comment textarea
- Duplicate prevention (unique index + error handling)

### 5.2 ~~Rating aggregation~~ ✅
- Trigger `trg_update_rating` auto-updates `rating_avg` / `review_count`

### 5.3 ~~แสดงรีวิวบนโปรไฟล์ช่าง~~ ✅
- หน้า `/technician/[id]` แสดง review list + review form

---

## Part 6 — Technician Profile Page ✅

### 6.1 ~~หน้ารายละเอียดช่าง (`/technician/[id]`)~~ ✅
- Server component: ข้อมูลครบ (ชื่อ, หมวดหมู่, ประสบการณ์, rating, รีวิว)
- ปุ่มติดต่อ: แชท + verify banner

### 6.2 ~~Portfolio gallery~~ ✅
- แสดง portfolio links จาก technician_applications

---

## Part 7 — LINE OA Integration ✅

### 7.1 ~~Push notification ผ่าน LINE OA~~ ✅
- Edge Function `notify-new-message` + debounce 5 นาที
- DB Webhook active

### 7.2 ~~Rich Menu~~ ✅
- LINE OA console configuration (not code)
- 3 tabs: หน้าแรก, แชท, สมัครเป็นช่าง

---

## ลำดับความสำคัญ (Priority Order)

```
Part 1 (Security)        ✅ เสร็จแล้ว
Part 2 (UI Polish)       ✅ เสร็จแล้ว
Part 3 (Chat UX)         ✅ เสร็จแล้ว
Part 4 (ID Verification) ✅ เสร็จแล้ว
Part 5 (Reviews)         ✅ เสร็จแล้ว
Part 6 (Profile Page)    ✅ เสร็จแล้ว
Part 7 (LINE OA)         ✅ เสร็จแล้ว
```
