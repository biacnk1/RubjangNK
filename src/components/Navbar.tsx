'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let channel: any = null;

    async function fetchUnread() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`customer_id.eq.${user.id},technician_id.eq.${user.id}`);

      if (!rooms || rooms.length === 0) return;

      const roomIds = rooms.map(r => r.id);

      const { data: readStatus } = await supabase
        .from('chat_read_status')
        .select('room_id, last_read_at')
        .eq('user_id', user.id);

      const readMap = new Map(readStatus?.map(r => [r.room_id, r.last_read_at]) || []);

      let total = 0;
      for (const roomId of roomIds) {
        const lastRead = readMap.get(roomId);
        let query = supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('room_id', roomId)
          .neq('sender_id', user.id);

        if (lastRead) {
          query = query.gt('created_at', lastRead);
        }

        const { count } = await query;
        total += count || 0;
      }

      setUnreadCount(total);
    }

    fetchUnread();

    channel = supabase
      .channel('navbar-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.container}`}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
          rubjangNK
        </Link>

        <div className={styles.navLinks}>
          <Link href="/chat" className={styles.chatLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/register" className={styles.registerBtn}>สมัครเป็นช่าง</Link>
        </div>

        <button
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <div className={styles.menuToggleWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              {unreadCount > 0 && <span className={styles.menuDot} />}
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/chat" className={styles.mobileLink} onClick={closeMenu}>
            ข้อความ
            {unreadCount > 0 && (
              <span className={styles.unreadBadgeMobile}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/register" className={styles.mobileRegisterBtn} onClick={closeMenu}>สมัครเป็นช่าง</Link>
        </div>
      )}
    </nav>
  );
}
