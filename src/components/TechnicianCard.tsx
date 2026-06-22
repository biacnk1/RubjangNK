'use client';

import { useLiff } from '@/components/LiffProvider';
import { useRouter } from 'next/navigation';
import styles from './TechnicianCard.module.css';

interface TechnicianCardProps {
  id: string;
  userId: string;
  name: string;
  category: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  rating: number | null;
  reviewCount: number;
  experience: number;
  startingRate?: number | null;
  distance?: number;
}

export default function TechnicianCard({
  id,
  userId,
  name,
  category,
  avatarUrl,
  isVerified,
  isFeatured,
  rating,
  reviewCount,
  experience,
  startingRate,
  distance
}: TechnicianCardProps) {
  const { liff, isLoggedIn } = useLiff();
  const router = useRouter();

  const handleContactClick = () => {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocal) {
      // Local dev: skip LIFF, go directly
      router.push('/chat/new/' + userId);
      return;
    }

    if (!liff) {
      alert('กำลังเชื่อมต่อระบบ กรุณารอสักครู่');
      return;
    }

    if (!isLoggedIn) {
      liff.login({ redirectUri: window.location.origin + '/chat/new/' + userId });
    } else {
      router.push('/chat/new/' + userId);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h3 className={styles.name}>{name}</h3>
            <span className={styles.category}>{category}</span>
          </div>
          <div className={styles.badges}>
            {isFeatured && (
              <span className={styles.badgeFeatured}>
                ★ แนะนำ
              </span>
            )}
            {isVerified && (
              <span className={styles.badgeVerified}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Verified
              </span>
            )}
          </div>
        </div>
        
        <div className={styles.details}>
          <div>
            {rating != null && reviewCount > 0
              ? `⭐ ${rating.toFixed(1)} (${reviewCount} รีวิว)`
              : '⭐ ยังไม่มีรีวิว'}
          </div>
          <div>มีประสบการณ์ {experience} ปี</div>
          {distance !== undefined && (
            <div style={{ color: '#d32f2f', fontWeight: 'bold' }}>
              📍 อยู่ห่างจากคุณ {distance.toFixed(1)} กม.
            </div>
          )}
          {startingRate != null && (
            <div className={styles.price}>เริ่มต้น ฿{startingRate.toLocaleString()}</div>
          )}
        </div>
        
        <div className={styles.actions}>
          <button className={styles.btnLine} onClick={handleContactClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            ติดต่อทาง LINE
          </button>
          <span className={styles.linkSecondary}>ดูโปรไฟล์</span>
        </div>
      </div>
      <div className={styles.imagePlaceholder}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className={styles.avatarImage} />
        ) : (
          <div className={styles.avatarPlaceholder}>รูปช่าง</div>
        )}
      </div>
    </div>
  );
}
