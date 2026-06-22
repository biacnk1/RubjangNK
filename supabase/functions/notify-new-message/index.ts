import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN")!;
const LIFF_ID = Deno.env.get("LIFF_ID")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "";

const DEBOUNCE_MINUTES = 5;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (WEBHOOK_SECRET) {
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const payload = await req.json();
  const record = payload.record ?? payload;

  const roomId = record.room_id;
  const senderId = record.sender_id;
  if (!roomId || !senderId) {
    return new Response(JSON.stringify({ skipped: "missing room_id or sender_id" }), { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: room, error: roomErr } = await supabase
    .from("chat_rooms")
    .select("customer_id, technician_id, last_notified_at")
    .eq("id", roomId)
    .single();

  if (roomErr || !room) {
    return new Response(JSON.stringify({ error: "room not found" }), { status: 200 });
  }

  const recipientId = senderId === room.customer_id ? room.technician_id : room.customer_id;

  if (room.last_notified_at) {
    const lastNotified = new Date(room.last_notified_at).getTime();
    if (Date.now() - lastNotified < DEBOUNCE_MINUTES * 60 * 1000) {
      return new Response(JSON.stringify({ skipped: "debounced" }), { status: 200 });
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("line_user_id")
    .eq("id", recipientId)
    .single();

  if (!profile?.line_user_id) {
    return new Response(JSON.stringify({ skipped: "no line_user_id" }), { status: 200 });
  }

  const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: profile.line_user_id,
      messages: [
        {
          type: "text",
          text: `📩 คุณมีข้อความใหม่ใน rubjangNK\nเปิดดู: https://liff.line.me/${LIFF_ID}/chat/${roomId}`,
        },
      ],
    }),
  });

  if (lineRes.ok) {
    await supabase
      .from("chat_rooms")
      .update({ last_notified_at: new Date().toISOString() })
      .eq("id", roomId);
  }

  return new Response(
    JSON.stringify({ sent: lineRes.ok, status: lineRes.status }),
    { status: 200 }
  );
});
