import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import VerifyForm from './VerifyForm';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function VerifyPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: techProfile } = await supabase
    .from('technician_profiles')
    .select('id, is_verified, id_verification_status')
    .eq('user_id', user.id)
    .single();

  if (!techProfile) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>ยืนยันตัวตน</h1>
          <p className={styles.message}>คุณยังไม่ได้ลงทะเบียนเป็นช่าง กรุณาสมัครก่อน</p>
        </div>
      </div>
    );
  }

  if (techProfile.is_verified) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>ยืนยันตัวตน</h1>
          <div className={styles.statusCard}>
            <div className={styles.statusIcon}>&#10003;</div>
            <p className={styles.statusText}>บัญชีของคุณผ่านการยืนยันแล้ว</p>
          </div>
        </div>
      </div>
    );
  }

  const isPending = techProfile.id_verification_status === 'pending';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>ยืนยันตัวตน</h1>
        <p className={styles.subtitle}>
          อัพโหลดรูปบัตรประชาชนเพื่อรับ Verified badge
        </p>

        {isPending ? (
          <div className={styles.statusCard}>
            <div className={styles.statusIconPending}>&#9203;</div>
            <p className={styles.statusText}>อยู่ระหว่างการตรวจสอบ</p>
            <p className={styles.statusHint}>เราจะตรวจสอบเอกสารของคุณโดยเร็วที่สุด</p>
          </div>
        ) : (
          <VerifyForm />
        )}
      </div>
    </div>
  );
}
