'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function uploadIdDocument(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('กรุณาเข้าสู่ระบบก่อน');
  }

  const file = formData.get('idDocument') as File | null;
  if (!file || file.size === 0) {
    throw new Error('กรุณาเลือกไฟล์รูปบัตรประชาชน');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 5MB');
  }

  const adminSupabase = createAdminClient();

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/id-card.${ext}`;

  const { error: uploadError } = await adminSupabase.storage
    .from('id-documents')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    throw new Error(`อัพโหลดไม่สำเร็จ: ${uploadError.message}`);
  }

  const { error: updateError } = await adminSupabase
    .from('technician_profiles')
    .update({ id_verification_status: 'pending' })
    .eq('user_id', user.id);

  if (updateError) {
    throw new Error(`อัพเดทสถานะไม่สำเร็จ: ${updateError.message}`);
  }

  revalidatePath('/verify');
}
