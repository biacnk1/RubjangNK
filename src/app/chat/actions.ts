'use server';

import { createClient } from '@/utils/supabase/server';

export async function getOrCreateChatRoom(techId: string) {
  const supabase = createClient();
  let { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // MVP Fallback for local testing: Mock a customer user
    const randomEmail = `customer_${Date.now()}@local.dev`;
    const { data: signUpData } = await supabase.auth.signUp({
      email: randomEmail,
      password: 'password123'
    });
    user = signUpData?.user || null;
  }

  if (!user) {
    return { error: 'Failed to create mock customer user' };
  }

  const customerId = user.id;

  // Upsert customer profile
  await supabase.from('profiles').upsert({
    id: customerId,
    display_name: 'ลูกค้า (Mock)',
    role: 'customer'
  }, { onConflict: 'id' });

  // Upsert technician profile just in case it's a mock UUID from frontend
  await supabase.from('profiles').upsert({
    id: techId,
    display_name: 'ช่าง (Mock)',
    role: 'technician'
  }, { onConflict: 'id' });

  // Check if room exists
  const { data: existingRooms, error: checkError } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('customer_id', customerId)
    .eq('technician_id', techId)
    .limit(1);

  if (checkError) {
    console.error('Error checking chat room:', checkError);
    return { error: checkError.message };
  }

  if (existingRooms && existingRooms.length > 0) {
    return { roomId: existingRooms[0].id };
  }

  // Create new room
  const { data: newRoom, error: insertError } = await supabase
    .from('chat_rooms')
    .insert({
      customer_id: customerId,
      technician_id: techId,
      status: 'active'
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Error creating chat room:', insertError);
    return { error: insertError.message };
  }

  return { roomId: newRoom.id };
}
