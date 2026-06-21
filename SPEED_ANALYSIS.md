# Speed & Performance Analysis Report: RubjangNK

จากการวิเคราะห์ระบบและการวัดประสิทธิภาพความเร็ว (Latency) ของแอปพลิเคชัน พบสาเหตุหลัก 3 ประการที่ทำให้การทำงานและ Request ในฟังก์ชันต่างๆ ช้าลงอย่างเห็นได้ชัด ดังนี้ครับ:

---

## 1. ปัญหาคอขวดจากการคิวรีฐานข้อมูลแบบเรียงลำดับ (Sequential Query Waterfall)

ทั้งในโปรเจกต์ `rubjangNK` และ `thaimarket-mvp` มีการเรียกใช้งาน Supabase Database Queries ในหน้า Page หรือ Server Actions แบบเรียงลำดับทีละตัว (ใช้ `await` ต่อกันเป็นทอดๆ) 

### การวิเคราะห์ Latency เปรียบเทียบ:
* **Local Database (Docker on localhost):** ใช้เวลาเฉลี่ยเพียง **6ms - 13ms** ต่อ 1 คิวรี
* **Remote Database (Supabase Cloud in Singapore/US):** ใช้เวลาเฉลี่ย **150ms - 200ms** ต่อ 1 คิวรี (รวม Network Roundtrip)

### ผลกระทบของ Waterfall:
ในหน้าเว็บ 1 หน้า หรือ Server Action 1 ฟังก์ชันที่มีการดึงข้อมูล 5-8 อย่างเรียงลำดับกัน:
* **บน Local DB:** `5 * 10ms = 50ms` (เร็วมาก ไม่รู้สึกช้า)
* **บน Remote DB (เช่น พอร์ต 3000 ใน `thaimarket-mvp` ที่ต่อคลาวด์):** 
  `8 คิวรี * 150ms = 1.2 วินาที` (บวกความเร็วเรนเดอร์ของ Next.js ทำให้หน้าเว็บโหลดช้าถึง **1.7 - 3.0 วินาที**)

ตัวอย่างคอขวดใน `D:\Coding\thaimarket-mvp2\app\page.tsx`:
```typescript
const user = await getCurrentUser();       // คิวรีที่ 1 (150ms)
const profile = await getCurrentProfile(); // คิวรีที่ 2 (150ms)
const admin = await isAdminUser(user);     // คิวรีที่ 3 (150ms)
const flags = await getFeatureFlags();     // คิวรีที่ 4 (150ms)
const { markets } = await getMarkets();    // คิวรีที่ 5 & 6 (300ms)
const categories = await getCategories();  // คิวรีที่ 7 (150ms)
// รวมเวลาเฉพาะรอ Database = 1.2 วินาที!
```

---

## 2. ปัญหาบล็อกและโหลดช้าบนมือถือ/LINE LIFF (CORS & Mixed Content Block)

หากคุณกำลังทดสอบระบบแชตหรือหน้าเว็บผ่านมือถือ (เช่น ใช้ LINE LIFF หรือเปิดดูบนมือถือผ่าน LAN/ngrok) โดยตั้งค่า `.env.local` เป็น:
`NEXT_PUBLIC_SUPABASE_URL=http://192.168.0.134:54321`

### สาเหตุ:
1. เมื่อเปิดใช้งานผ่าน LINE LIFF หรือ ngrok หน้าเว็บจะถูกบังคับให้เป็น **HTTPS**
2. เมื่อ Client-side JavaScript บนมือถือพยายามเชื่อมต่อไปยัง Supabase ที่เป็น **HTTP** (`http://192.168.0.134:54321`) บราวเซอร์บนมือถือจะมองว่าเป็น **Mixed Content** (เว็บ HTTPS แต่เรียก API แบบ HTTP ที่ไม่ปลอดภัย)
3. บราวเซอร์ของโทรศัพท์จะทำสองอย่าง:
   * **บล็อกคำขอทันที** (ทำให้กดฟังก์ชันแชตหรือลงทะเบียนแล้วไม่มีอะไรเกิดขึ้น)
   * **พยายามอัปเกรดเป็น HTTPS เอง** (ทำให้เบราว์เซอร์ส่งคำขอไปยัง `https://192.168.0.134:54321` ซึ่งไม่มีพอร์ต HTTPS รออยู่ ส่งผลให้หน้าเว็บ **ค้าง (Hang) รอ TCP Timeout 20-30 วินาที** ก่อนจะล้มเหลว)

---

## 3. ปัญหา Middleware ดักทุก Request (เฉพาะในบางโปรเจกต์)

ในโปรเจกต์ `thaimarket-mvp` มีการใช้ `middleware.ts` ซึ่งรันโค้ดนี้ในทุกๆ Request:
```typescript
const { data: { user } } = await supabase.auth.getUser();
```
ส่งผลให้ทุกครั้งที่มีการเปลี่ยนหน้า หรือดาวน์โหลดข้อมูล จะต้องรอการเรียก API เพื่อตรวจสอบ User เสมอ ซึ่งบวกเวลาเพิ่มอีก 150ms+ ในทุกๆ กิจกรรม

---

# 🚀 แนวทางการแก้ไขเพื่อเพิ่มความเร็ว (Recommended Fixes)

### แนวทางที่ 1: เปลี่ยนมาคิวรีแบบขนาน (Parallelize Queries)
สำหรับข้อมูลที่ไม่ได้ขึ้นต่อกัน ให้ใช้ `Promise.all` เพื่อส่งคำขอไปฐานข้อมูลพร้อมกันในครั้งเดียว จะช่วยลดเวลาลงเหลือเท่ากับคิวรีที่ช้าที่สุดตัวเดียว (ลดจาก 1.2 วินาที เหลือ 150ms)
```typescript
// แทนที่จะรัน await ทีละบรรทัด
const [user, categoriesData, marketsData] = await Promise.all([
  getCurrentUser(),
  getCategories(),
  getMarkets()
]);
```

### แนวทางที่ 2: ใช้ Next.js Rewrites (แก้ปัญหา Mixed Content & ซ่อน API URL)
เพื่อหลีกเลี่ยงข้อจำกัด Mixed Content บนมือถือ และไม่ต้องเปิดพอร์ต Supabase เพิ่มเติมบน Firewall เราสามารถตั้งค่าให้ Next.js ทำหน้าที่เป็น Proxy ส่งข้อมูลแทนได้ โดยอัปเดตใน next.config.mjs:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/supabase-api/:path*',
        destination: 'http://127.0.0.1:54321/:path*', // ส่งต่อไปยัง Supabase Local
      },
    ];
  },
};

export default nextConfig;
```
จากนั้นเปลี่ยน `NEXT_PUBLIC_SUPABASE_URL` ในบราวเซอร์ให้ชี้มาที่ `/supabase-api` วิธีนี้จะทำให้ทั้งเว็บและ API วิ่งผ่าน HTTPS เดียวกันของ ngrok ทำให้ไม่มีปัญหา Mixed Content และโหลดได้รวดเร็วขึ้นมากครับ
