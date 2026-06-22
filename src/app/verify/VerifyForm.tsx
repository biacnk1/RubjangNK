'use client';

import { useState, useRef } from 'react';
import { uploadIdDocument } from './actions';
import styles from './page.module.css';

export default function VerifyForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    setError(null);
    try {
      await uploadIdDocument(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.statusCard}>
        <div className={styles.statusIconPending}>&#9203;</div>
        <p className={styles.statusText}>ส่งเอกสารสำเร็จ!</p>
        <p className={styles.statusHint}>เราจะตรวจสอบและอัพเดทสถานะให้คุณ</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className={styles.formCard}>
      <div
        className={styles.dropZone}
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className={styles.previewImg} />
        ) : (
          <div className={styles.dropContent}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>กดเพื่อเลือกรูปบัตรประชาชน</p>
            <span className={styles.dropHint}>JPG, PNG ไม่เกิน 5MB</span>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        name="idDocument"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <ul className={styles.guidelines}>
        <li>ถ่ายรูปบัตรประชาชนด้านหน้าให้เห็นชื่อชัดเจน</li>
        <li>รูปถ่ายต้องไม่เบลอหรือมืด</li>
        <li>ข้อมูลจะถูกเก็บเป็นความลับ ใช้ยืนยันตัวตนเท่านั้น</li>
      </ul>

      {error && <p className={styles.errorText}>{error}</p>}

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={!preview || submitting}
      >
        {submitting ? 'กำลังส่ง...' : 'ส่งเอกสารยืนยัน'}
      </button>
    </form>
  );
}
