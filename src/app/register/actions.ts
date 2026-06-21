'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitTechnicianApplication(formData: FormData) {
  const supabase = createClient();
  
  // 1. ตรวจสอบการ Login
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('กรุณาเข้าสู่ระบบผ่าน LINE ก่อนสมัครเป็นช่าง');
  }

  const userId = user!.id;

  // 2. ดึงข้อมูลจากฟอร์ม
  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;
  const categoryId = formData.get('category') as string;
  const experience = parseInt(formData.get('experience') as string) || 0;
  const portfolio = formData.get('portfolio') as string;
  const latStr = formData.get('latitude') as string;
  const lngStr = formData.get('longitude') as string;
  
  const latitude = parseFloat(latStr);
  const longitude = parseFloat(lngStr);

  // Ensure profile exists to satisfy foreign key
  const avatarUrl = formData.get('avatarUrl') as string | null;
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    display_name: fullName,
    role: 'technician',
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  }, { onConflict: 'id' });
  
  if (profileError) console.error("Profile upsert error:", profileError);

  // 2.5 Save sensitive/private information using Admin client (with service_role)
  const adminSupabase = createAdminClient();
  const { error: privateInfoError } = await adminSupabase
    .from('technician_private_info')
    .upsert({
      user_id: userId,
      phone_number: phone,
    });

  if (privateInfoError) {
    console.error("Private Info Insert Error:", privateInfoError.message);
    throw new Error(`ไม่สามารถบันทึกข้อมูลส่วนตัวของช่างได้: ${privateInfoError.message}`);
  }

  // 3. บันทึกลงฐานข้อมูล
  const { data: appData, error } = await supabase
    .from('technician_applications')
    .insert({
      user_id: userId,
      full_name: fullName,
      phone_number: phone,
      category_id: categoryId,
      experience_years: experience,
      portfolio_urls: portfolio ? [portfolio] : [],
      latitude: isNaN(latitude) ? null : latitude,
      longitude: isNaN(longitude) ? null : longitude,
      status: 'approved' // Auto-approve for MVP
    })
    .select('id')
    .single();

  if (error) {
    console.error("Application Insert Error:", error.message);
    throw new Error(`ไม่สามารถบันทึกข้อมูลได้: ${error.message}`);
  }

  // Auto-create technician_profiles (is_verified=false จนกว่าแอดมินจะยืนยันบัตรประชาชน)
  // ใช้ adminSupabase เพราะ technician_profiles ไม่มี INSERT policy (RLS)
  if (appData) {
    const { error: profileInsertError } = await adminSupabase.from('technician_profiles').insert({
      user_id: userId,
      application_id: appData.id,
      is_verified: false,
      rating_avg: 5.0,
      review_count: 0
    });
    if (profileInsertError) console.error("Technician profile insert error:", profileInsertError.message);
  }

  revalidatePath('/');
  redirect('/');
}
