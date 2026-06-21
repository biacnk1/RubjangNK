'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateChatRoom } from '../../actions';

export default function NewChatPage({ params }: { params: { techId: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initChat() {
      const res = await getOrCreateChatRoom(params.techId);
      if (res.error) {
        setError(res.error);
      } else if (res.roomId) {
        router.replace(`/chat/${res.roomId}`);
      }
    }
    initChat();
  }, [params.techId, router]);

  if (error) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'red' }}>เกิดข้อผิดพลาด: {error}</div>;
  }

  return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
      กำลังสร้างและเชื่อมต่อห้องแชท...
    </div>
  );
}
