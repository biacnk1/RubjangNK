'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitTechnicianApplication(formData: FormData) {
  const supabase = createClient();
  
  // 1. ตรวจสอบการ Login
  let { data: { user } } = await supabase.auth.getUser();
  
  // สำหรับ MVP Local Test หากยังไม่ได้เชื่อมต่อ LINE เข้ากับ Supabase Auth 
  // ให้เราจำลองสมัครสมาชิกด้วย Email ชั่วคราว เพื่อให้ได้ UUID จริงๆ ไปผ่าน RLS และ Foreign Key
  if (!user) {
    const randomEmail = `mock_${Date.now()}@local.dev`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: randomEmail,
      password: 'password123'
    });
    
    if (signUpError) {
      console.error("Mock SignUp Error:", signUpError);
      throw new Error(`ระบบไม่สามารถสร้าง Mock User ได้: ${signUpError.message}`);
    }
    user = signUpData.user;
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
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    display_name: fullName,
    role: 'technician'
  }, { onConflict: 'id' });
  
  if (profileError) console.error("Profile upsert error:", profileError);

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

  // Auto-create profile for MVP so it shows up on homepage immediately
  if (appData) {
    await supabase.from('technician_profiles').insert({
      user_id: userId,
      application_id: appData.id,
      is_verified: true,
      rating_avg: 5.0,
      review_count: 0
    });
  }

  revalidatePath('/');
  redirect('/');
}
