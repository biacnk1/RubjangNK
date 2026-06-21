'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import styles from './ChatSidebar.module.css';

interface ChatRoomInfo {
  id: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  currentRoomId?: string;
  currentUserId: string | null;
}

export default function ChatSidebar({ currentRoomId, currentUserId }: ChatSidebarProps) {
  const supabase = createClient();
  const [rooms, setRooms] = useState<ChatRoomInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;

    async function fetchChatRooms() {
      try {
        setLoading(true);
        // 1. Fetch all chat rooms for the current user
        const { data: dbRooms, error: roomsError } = await supabase
          .from('chat_rooms')
          .select('*')
          .or(`customer_id.eq.${currentUserId},technician_id.eq.${currentUserId}`)
          .order('updated_at', { ascending: false });

        if (roomsError) throw roomsError;
        if (!dbRooms || dbRooms.length === 0) {
          setRooms([]);
          return;
        }

        // 2. Extract partner IDs (the ID that is NOT currentUserId)
        const partnerIds = dbRooms.map(room => 
          room.customer_id === currentUserId ? room.technician_id : room.customer_id
        );

        // 3. Fetch profiles for these partner IDs
        const { data: dbProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', partnerIds);

        if (profilesError) throw profilesError;

        const profileMap = new Map(dbProfiles?.map(p => [p.id, p]) || []);

        // 4. Fetch the last message for each chat room
        const roomIds = dbRooms.map(r => r.id);
        const { data: dbMessages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('room_id, message, created_at')
          .in('room_id', roomIds)
          .order('created_at', { ascending: false });

        // Map room_id to last message
        const lastMsgMap = new Map<string, string>();
        if (!messagesError && dbMessages) {
          dbMessages.forEach(msg => {
            if (!lastMsgMap.has(msg.room_id)) {
              lastMsgMap.set(msg.room_id, msg.message || 'ส่งข้อความแล้ว');
            }
          });
        }

        // 5. Assemble state
        const assembledRooms: ChatRoomInfo[] = dbRooms.map(room => {
          const partnerId = room.customer_id === currentUserId ? room.technician_id : room.customer_id;
          const partnerProfile = profileMap.get(partnerId);
          return {
            id: room.id,
            partnerName: partnerProfile?.display_name || 'ผู้ใช้นิรนาม',
            partnerAvatar: partnerProfile?.avatar_url || null,
            lastMessage: lastMsgMap.get(room.id) || 'ยังไม่มีข้อความ',
            updatedAt: room.updated_at
          };
        });

        setRooms(assembledRooms);
      } catch (err) {
        console.error('Error loading chat rooms:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChatRooms();

    // Subscribe to message updates to refresh list
    const channel = supabase
      .channel('sidebar-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        fetchChatRooms();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => {
        fetchChatRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  const filteredRooms = rooms.filter(room => 
    room.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate fallback avatar color based on name hash
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7', '#4DB6AC', '#81C784', '#D4E157', '#FFD54F', '#FFB74D', '#FF8A65'];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>ข้อความแชท</h2>
      </div>
      <div className={styles.searchWrapper}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="ค้นหาผู้ติดต่อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>
      <div className={styles.roomList}>
        {loading && rooms.length === 0 ? (
          <div className={styles.statusMsg}>กำลังโหลดห้องแชท...</div>
        ) : filteredRooms.length === 0 ? (
          <div className={styles.statusMsg}>ไม่พบห้องแชท</div>
        ) : (
          filteredRooms.map(room => {
            const isActive = room.id === currentRoomId;
            const firstLetter = room.partnerName.charAt(0).toUpperCase();
            return (
              <Link 
                href={`/chat/${room.id}`} 
                key={room.id}
                className={`${styles.roomItem} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.avatarWrapper}>
                  {room.partnerAvatar ? (
                    <img 
                      src={room.partnerAvatar} 
                      alt={room.partnerName} 
                      className={styles.avatar} 
                    />
                  ) : (
                    <div 
                      className={styles.avatarFallback} 
                      style={{ backgroundColor: getAvatarColor(room.partnerName) }}
                    >
                      {firstLetter}
                    </div>
                  )}
                  <span className={styles.statusDot}></span>
                </div>
                <div className={styles.roomDetails}>
                  <div className={styles.roomHeader}>
                    <span className={styles.partnerName}>{room.partnerName}</span>
                    <span className={styles.time}>
                      {new Date(room.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={styles.lastMessage}>{room.lastMessage}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
