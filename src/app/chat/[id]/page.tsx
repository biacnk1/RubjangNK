'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import ChatSidebar from '@/components/ChatSidebar';
import styles from './page.module.css';

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const supabase = createClient();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [dealStatus, setDealStatus] = useState('none');
  const [currentDeal, setCurrentDeal] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || '00000000-0000-0000-0000-000000000000';
        setCurrentUserId(userId);

        const { data: room } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        setRoomInfo(room);

        if (room) {
          const partnerId = room.customer_id === userId ? room.technician_id : room.customer_id;
          const { data: partner } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', partnerId)
            .single();
          setPartnerProfile(partner);
        }

        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });
          
        if (msgs) setMessages(msgs);

        const { data: deals } = await supabase
          .from('job_deals')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (deals && deals.length > 0) {
          setCurrentDeal(deals[0]);
          setDealStatus(deals[0].status);
        } else {
          setDealStatus('none');
        }
      } catch (err) {
        console.error('Error loading chat details:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();

    // Realtime subscription
    const channel = supabase
      .channel(`chat_${roomId}`)
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        }, 
        (payload) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'job_deals',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const newPayload = payload.new as any;
          if (newPayload && newPayload.status) {
            setCurrentDeal(newPayload);
            setDealStatus(newPayload.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, dealStatus]);

  const handleSend = async () => {
    if (!input.trim() || !currentUserId) return;
    const msgText = input;
    setInput('');
    
    const tempId = 'temp-' + Date.now();
    const newMsg = {
      id: tempId,
      room_id: roomId,
      sender_id: currentUserId,
      message_type: 'text',
      message: msgText,
      created_at: new Date().toISOString()
    };
    
    // Add optimistically
    setMessages(prev => [...prev, newMsg]);
    
    try {
      const { data, error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_id: currentUserId,
        message_type: 'text',
        message: msgText
      }).select().single();
      
      if (!error && data) {
        setMessages(prev => prev.map(m => m.id === tempId ? data : m));
      }
    } catch (err) {
      console.error('Failed to insert message:', err);
    }
  };

  const handleCreateQuote = async () => {
    if (!roomInfo) return;
    const { data } = await supabase.from('job_deals').insert({
      room_id: roomId,
      description: 'ค่าบริการซ่อมบำรุงเบื้องต้น',
      amount: 800,
      status: 'pending'
    }).select().single();
    
    if (data) {
      setCurrentDeal(data);
      setDealStatus('pending');
    }
  };

  const handleAcceptQuote = async () => {
    if (!currentDeal) return;
    await supabase.from('job_deals')
      .update({ status: 'completed' })
      .eq('id', currentDeal.id);
      
    setDealStatus('completed');
  };

  const isTechnician = currentUserId === roomInfo?.technician_id;
  const firstLetter = partnerProfile?.display_name ? partnerProfile.display_name.charAt(0).toUpperCase() : '?';

  // Fallback avatar color based on partner name
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7', '#4DB6AC', '#81C784', '#D4E157', '#FFD54F', '#FFB74D', '#FF8A65'];
    return colors[Math.abs(hash) % colors.length];
  };

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
      {/* Sidebar - hidden on mobile when viewing active chat */}
      <div className={styles.sidebarSection}>
        <ChatSidebar currentRoomId={roomId} currentUserId={currentUserId} />
      </div>

      {/* Main Chat room pane */}
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <Link href="/chat" className={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </Link>
          
          <div className={styles.partnerInfo}>
            {partnerProfile?.avatar_url ? (
              <img src={partnerProfile.avatar_url} alt={partnerProfile.display_name} className={styles.headerAvatar} />
            ) : (
              <div 
                className={styles.headerAvatarFallback} 
                style={{ backgroundColor: getAvatarColor(partnerProfile?.display_name || '') }}
              >
                {firstLetter}
              </div>
            )}
            <div className={styles.partnerText}>
              <div className={styles.chatTitle}>{partnerProfile?.display_name || 'ห้องแชท'}</div>
              <div className={styles.statusText}>
                <span className={styles.statusDotOnline}></span> ออนไลน์
              </div>
            </div>
          </div>

          <div className={styles.headerStatusRight}>
            {dealStatus === 'completed' ? (
              <span className={styles.badgeSuccess}>📞 เปิดเผยเบอร์โทรศัพท์แล้ว</span>
            ) : (
              <span className={styles.badgeLocked}>🔒 ซ่อนข้อมูลการติดต่อ</span>
            )}
          </div>
        </div>

        <div className={styles.chatHistory}>
          {messages.map(msg => {
            const isMe = msg.sender_id === currentUserId;
            const timeStr = new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={msg.id} className={`${styles.messageRow} ${isMe ? styles.me : styles.them}`}>
                <div className={styles.messageBubbleWrapper}>
                  {msg.message_type === 'text' && (
                    <div className={styles.messageBubble}>{msg.message}</div>
                  )}
                  <span className={styles.messageTime}>{timeStr}</span>
                </div>
              </div>
            );
          })}

          {/* Create Quote UI for Technician */}
          {isTechnician && dealStatus === 'none' && (
            <div className={styles.quotePromptCard} onClick={handleCreateQuote}>
              <div className={styles.quotePromptIcon}>⚡</div>
              <div className={styles.quotePromptText}>
                <strong>ส่งใบเสนอราคาอย่างง่าย (฿800)</strong>
                <span>ส่งค่ามัดจำหรือค่าซ่อมบำรุงเริ่มต้นเพื่อให้ลูกค้ากดยืนยัน</span>
              </div>
            </div>
          )}

          {/* Display Quote */}
          {dealStatus === 'pending' && currentDeal && (
            <div className={`${styles.messageRow} ${isTechnician ? styles.me : styles.them}`}>
              <div className={styles.quoteCard}>
                <div className={styles.quoteHeader}>
                  <span className={styles.quoteIcon}>📋</span>
                  <span className={styles.quoteTitle}>ใบเสนอราคา</span>
                </div>
                <p className={styles.quoteDesc}>{currentDeal.description}</p>
                <div className={styles.quotePrice}>฿{currentDeal.amount || currentDeal.price}</div>
                
                {!isTechnician ? (
                  <button className={styles.btnAccept} onClick={handleAcceptQuote}>
                    ยอมรับราคา (ตกลงจ้างงาน)
                  </button>
                ) : (
                  <div className={styles.quoteWaitText}>⌛ รอการยืนยันจากลูกค้า...</div>
                )}
              </div>
            </div>
          )}

          {dealStatus === 'completed' && (
            <div className={styles.dealClosedMsg}>
              <div className={styles.dealClosedIcon}>🎉</div>
              <div className={styles.dealClosedText}>
                <strong>ตกลงจ้างงานสำเร็จ!</strong>
                <span>คุณสามารถตรวจสอบประวัติงาน และติดต่อโดยตรงผ่านเบอร์โทรศัพท์ได้ทันที</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatInputArea}>
          <input 
            type="text" 
            className={styles.chatInput} 
            placeholder="พิมพ์ข้อความ..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendBtn} onClick={handleSend}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
