'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ChatSidebar from '@/components/ChatSidebar';
import styles from './[id]/page.module.css';

export default function ChatDashboardPage() {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        } else {
          // Fallback to mock customer for dev
          setCurrentUserId('00000000-0000-0000-0000-000000000000');
        }
      } catch (err) {
        console.error('Error checking auth', err);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, [supabase]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>กำลังโหลดแชท...</p>
      </div>
    );
  }

  return (
    <div className={styles.chatDashboard}>
      <ChatSidebar currentUserId={currentUserId} />
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <svg className={styles.emptyIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3 className={styles.emptyTitle}>ยินดีต้อนรับสู่กล่องข้อความ</h3>
          <p className={styles.emptyText}>กรุณาเลือกผู้ติดต่อจากแถบด้านข้าง เพื่อเริ่มต้นการสนทนา</p>
        </div>
      </div>
    </div>
  );
}
