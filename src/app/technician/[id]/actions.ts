'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('กรุณาเข้าสู่ระบบก่อนรีวิว');
  }

  const techProfileId = formData.get('techProfileId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const comment = (formData.get('comment') as string)?.trim() || null;

  if (!techProfileId || !rating || rating < 1 || rating > 5) {
    throw new Error('ข้อมูลไม่ถูกต้อง');
  }

  const { error } = await supabase.from('reviews').insert({
    technician_profile_id: techProfileId,
    reviewer_id: user.id,
    rating,
    comment,
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('คุณได้รีวิวช่างคนนี้แล้ว');
    }
    throw new Error(`ไม่สามารถส่งรีวิวได้: ${error.message}`);
  }

  revalidatePath(`/technician/${techProfileId}`);
}

export async function markRoomAsRead(roomId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('chat_read_status').upsert({
    user_id: user.id,
    room_id: roomId,
    last_read_at: new Date().toISOString(),
  }, { onConflict: 'user_id,room_id' });
}
