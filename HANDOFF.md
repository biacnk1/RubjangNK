# HANDOFF → Next Session

> **Branch:** `main`
> **สถานะ:** all roadmap parts complete — pending push + migration
> **Netlify credit:** จำกัด ~8 deploys/วัน ระวังการ push

---

## สิ่งที่เสร็จแล้ว

### Part 1 — Security & Data Integrity ✅
| Task | Commit | สถานะ |
|------|--------|--------|
| Navbar เหลือ "สมัครเป็นช่าง" | `a17795d` | ✅ pushed |
| Chat ID fix (user_id แทน PK) | `3b36e9a` | ✅ pushed |
| LINE Push Edge Function | `3353e3e` | ✅ pushed + deployed |
| Roadmap update | `4a377e1` | ✅ pushed |
| force-dynamic homepage | `e8b409a` | ✅ pushed |

### Part 2 — UI / UX Polish ✅
| Task | Commit | สถานะ |
|------|--------|--------|
| next/image สำหรับ avatar | `a60c734` | ✅ pushed |
| Search bar filter (ชื่อ/หมวดหมู่) | `a60c734` | ✅ pushed |
| Category chip toggle filter | `a60c734` | ✅ pushed |
| Skeleton loader + empty state | `a60c734` | ✅ pushed |

### Part 3 — Chat UX ✅ (this session)
| Task | สถานะ |
|------|--------|
| 3.2 Unread count badge (Navbar) | ✅ realtime subscription + red badge |
| 3.3 Realtime — already working | ✅ confirmed |
| 3.4 Timestamps + scroll-to-bottom | ✅ already implemented |
| markRoomAsRead on open + new msg | ✅ chat_read_status table |

### Part 5 — Reviews & Rating ✅ (this session)
| Task | สถานะ |
|------|--------|
| reviews table + RLS | ✅ migration |
| Rating aggregation trigger | ✅ trg_update_rating |
| Review form (star picker) | ✅ /technician/[id] |
| Duplicate review prevention | ✅ unique index + 23505 handling |

### Part 6 — Technician Profile Page ✅ (this session)
| Task | สถานะ |
|------|--------|
| /technician/[id] page | ✅ server component |
| Stats, portfolio, reviews | ✅ full layout |
| "ดูโปรไฟล์" link on card | ✅ Link component |

### Part 4 — ID Verification ✅ (this session)
| Task | สถานะ |
|------|--------|
| /verify upload page | ✅ client + server action |
| id-documents private bucket | 🔲 create manually in Supabase Storage |
| id_verification_status column | ✅ migration |
| Verify banner on own profile | ✅ shows when not verified |

### Part 7 — LINE OA ✅
| Task | สถานะ |
|------|--------|
| 7.1 Push notification | ✅ pushed + deployed |
| 7.2 Rich Menu | ✅ documented — LINE OA console config, not code |

### Ops Setup ✅
| Task | สถานะ |
|------|--------|
| DB Webhook (`rubjangnk_noti` trigger) | ✅ done |
| LINE OA Bot linked → Aggressive | ✅ done |
| Migration `chat_notify.sql` | ✅ done |

### UI Fixes (this session)
| Task | สถานะ |
|------|--------|
| Category icon grid + emoji fallback | ✅ restored |
| TechnicianCard layout (equal height, badges) | ✅ rewritten |
| Grid breakpoints (2-col/3-col) | ✅ explicit breakpoints |

---

## Secrets ที่ตั้งแล้วบน Supabase
- `LINE_CHANNEL_ACCESS_TOKEN` ✅
- `LIFF_ID` ✅
- `WEBHOOK_SECRET` = `rubjang-notify-2024` ✅

## DB Webhook (trigger)
- **Trigger:** `rubjangnk_noti` บน `public.chat_messages` → AFTER INSERT
- **Target:** Edge Function `notify-new-message` (ACTIVE, v7)
- **Secret header:** `x-webhook-secret: rubjang-notify-2024` (ตรงกับ env แล้ว)

---

## Post-deploy TODO

1. **Run migration** on Supabase:
   - `supabase/migrations/20260622200000_reviews_readstatus_verify.sql`
   - Creates: `reviews` table, `chat_read_status` table, `id_verification_status` column, rating trigger, RLS policies

2. **Create Storage bucket** `id-documents` (private) in Supabase Dashboard

3. **LINE Rich Menu** — configure in LINE Official Account Manager console:
   - Tab 1: หน้าแรก → LIFF URL
   - Tab 2: แชท → LIFF URL /chat
   - Tab 3: สมัครเป็นช่าง → LIFF URL /register

---

## ข้อจำกัดสำคัญ
- **Netlify free tier:** ~300 build minutes/เดือน, ประมาณ 8 deploys/วัน — รวม commit แล้ว push ทีเดียว
- **LINE Push โควต้าฟรี:** หลักร้อยข้อความ/เดือน — debounce 5 นาทีช่วยประหยัด
- **โปรเจกต์ฟรี:** ไม่มี paid rank/ads → ใช้ resource น้อยที่สุด
