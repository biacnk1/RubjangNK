import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import { submitTechnicianApplication } from "./actions";
import RegisterForm from "./RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สมัครเป็นช่าง/แม่บ้าน | rubjangNK — ฟรีไม่มีค่าคอม",
  description: "ลงทะเบียนเป็นช่างหรือแม่บ้านในหนองคาย เพิ่มรายได้ หาลูกค้าง่าย ฟรีตลอดการใช้งาน ไม่มีค่าคอมมิชชั่น",
  alternates: {
    canonical: "https://rubjangnk.netlify.app/register",
  },
};

export default async function RegisterPage() {
  const supabase = createClient();
  let categories = null;
  try {
    const { data } = await supabase.from('service_categories').select('*');
    categories = data;
  } catch (error) {
    console.warn("Supabase connection failed. Categories dropdown will be empty.");
  }

  // Fallback if DB has no categories yet
  if (!categories || categories.length === 0) {
    categories = [
      { id: '11111111-1111-1111-1111-111111111111', name_th: 'ช่างแอร์' },
      { id: '22222222-2222-2222-2222-222222222222', name_th: 'ช่างประปา' },
      { id: '33333333-3333-3333-3333-333333333333', name_th: 'ช่างไฟฟ้า' },
      { id: '44444444-4444-4444-4444-444444444444', name_th: 'ช่างซ่อมบำรุง/ต่อเติม' },
      { id: '55555555-5555-5555-5555-555555555555', name_th: 'แม่บ้าน/ทำความสะอาด' },
    ];
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ลงทะเบียนเป็นช่าง/แม่บ้าน</h1>
      <p className={styles.subtitle}>เพิ่มรายได้ของคุณ หาลูกค้าในหนองคายได้ง่ายขึ้น ฟรีตลอดการใช้งาน</p>
      
      <RegisterForm categories={categories || []} submitAction={submitTechnicianApplication} />
    </div>
  );
}
