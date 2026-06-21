'use client';

import { useState, useEffect } from 'react';
import { useLiff } from '@/components/LiffProvider';
import styles from './page.module.css';

export default function RegisterForm({ categories, submitAction }: { categories: any[], submitAction: any }) {
  const { liff, liffError, isLoggedIn, isReady, profile } = useLiff();
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!isReady) return; // รอ LIFF init ก่อน
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocal) return;

    if (liff && !isLoggedIn) {
      liff.login({ redirectUri: window.location.href });
    }
  }, [liff, isLoggedIn, isReady]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด GPS");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocating(false);
      },
      (error) => {
        alert("ไม่สามารถดึงพิกัดได้ กรุณาอนุญาตให้ระบบเข้าถึงตำแหน่งที่ตั้ง (Location)");
        setLocating(false);
      }
    );
  };

  const isLocalEnv = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // รอ LIFF init ก่อน
  if (!isReady && !isLocalEnv) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>กำลังโหลด LINE...<br/><small style={{fontSize:'11px', color:'#aaa'}}>isReady: false</small></div>;
  }

  // LIFF init error
  if (liffError) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>LIFF Error: {liffError}</div>;
  }

  // LIFF ready แล้ว แต่ยังไม่ login → liff.login() จะ redirect ไปเอง
  if (isReady && !isLoggedIn && !isLocalEnv) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>กำลังเข้าสู่ระบบผ่าน LINE...<br/><small style={{fontSize:'11px', color:'#aaa'}}>isReady: true | liff: {liff ? 'ok' : 'null'}</small></div>;
  }

  return (
    <div className={styles.formCard}>
      <form action={submitAction}>
        {/* Profile Picture Preview */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {profile?.pictureUrl ? (
            <img 
              src={profile.pictureUrl} 
              alt="Profile" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }} 
            />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eee', margin: '0 auto' }} />
          )}
          <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
            รูปโปรไฟล์เริ่มต้นดึงจาก LINE<br/>(สามารถเข้ามาเปลี่ยนรูปที่ดูเป็นมืออาชีพได้ภายหลัง)
          </p>
        </div>

        {/* Hidden Fields for Geolocation */}
        {lat && <input type="hidden" name="latitude" value={lat} />}
        {lng && <input type="hidden" name="longitude" value={lng} />}
        
        <div className={styles.formGroup}>
          <label htmlFor="fullName">ชื่อ-นามสกุลจริง</label>
          <input type="text" id="fullName" name="fullName" defaultValue={profile?.displayName || ''} placeholder="นาย สมชาย ใจดี" required />
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.formGroup}>
              <label htmlFor="phone">เบอร์โทรศัพท์ติดต่อ</label>
              <input type="tel" id="phone" name="phone" placeholder="08X-XXX-XXXX" required />
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.formGroup}>
              <label htmlFor="category">หมวดหมู่งาน</label>
              <select id="category" name="category" required>
                <option value="">เลือกหมวดหมู่...</option>
                {categories && categories.length > 0 ? (
                  categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name_th}</option>
                  ))
                ) : (
                  <option value="" disabled>ไม่พบข้อมูลหมวดหมู่จากฐานข้อมูล</option>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>พิกัดรับงาน (เพื่อใช้คำนวณระยะทางกับลูกค้า)</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
            <button 
              type="button" 
              onClick={getLocation} 
              disabled={locating} 
              style={{ 
                padding: '8px 16px', 
                background: lat ? '#e8f5e9' : '#f0f0f0', 
                border: lat ? '1px solid #4caf50' : '1px solid #ccc', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: 500,
                color: lat ? '#2e7d32' : '#333'
              }}
            >
              {locating ? 'กำลังค้นหา...' : '📍 ดึงพิกัดปัจจุบัน'}
            </button>
            <span style={{ fontSize: '13px', color: lat ? '#2e7d32' : '#d32f2f', fontWeight: 500 }}>
              {lat ? `สำเร็จ (${lat.toFixed(4)}, ${lng?.toFixed(4)})` : '* จำเป็นต้องดึงพิกัดก่อนสมัคร'}
            </span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="experience">ประสบการณ์ (ปี)</label>
          <input type="number" id="experience" name="experience" min="0" placeholder="เช่น 5" required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="bio">แนะนำตัว / บริการที่คุณรับทำ (โดยสังเขป)</label>
          <textarea id="bio" name="bio" rows={4} placeholder="รับล้างแอร์ เติมน้ำยาแอร์ ซ่อมแอร์บ้านทุกรุ่น..." required></textarea>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="portfolio">ลิงก์ผลงาน (ถ้ามี เช่น Facebook Page)</label>
          <input type="url" id="portfolio" name="portfolio" placeholder="https://facebook.com/..." />
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn} 
          disabled={!lat}
          style={{ opacity: lat ? 1 : 0.6, cursor: lat ? 'pointer' : 'not-allowed' }}
        >
          ส่งใบสมัครช่าง
        </button>
      </form>
    </div>
  );
}
