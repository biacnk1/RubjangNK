'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function getOrCreateChatRoom(techId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const customerId = user.id;

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
