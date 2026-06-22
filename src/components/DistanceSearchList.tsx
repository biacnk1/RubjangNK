'use client';

import React, { useState, useMemo } from 'react';
import TechnicianCard from './TechnicianCard';
import styles from './DistanceSearchList.module.css';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

interface Category {
  id: string;
  name: string;
}

interface Technician {
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
  latitude?: number | null;
  longitude?: number | null;
  distance?: number;
}

interface Props {
  initialTechnicians: Technician[];
  categories: Category[];
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} style={{ width: '60%', height: 18 }} />
        <div className={styles.skeletonLine} style={{ width: '40%', height: 14 }} />
        <div className={styles.skeletonLine} style={{ width: '80%', height: 14 }} />
        <div className={styles.skeletonLine} style={{ width: '50%', height: 14 }} />
        <div className={styles.skeletonBtn} />
      </div>
      <div className={styles.skeletonAvatar} />
    </div>
  );
}

export default function DistanceSearchList({ initialTechnicians, categories }: Props) {
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const updatedTechs = initialTechnicians.map(tech => {
          if (tech.latitude && tech.longitude) {
            const dist = calculateDistance(latitude, longitude, tech.latitude, tech.longitude);
            return { ...tech, distance: dist };
          }
          return tech;
        });

        updatedTechs.sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
          if (a.distance !== undefined) return -1;
          if (b.distance !== undefined) return 1;
          return 0;
        });

        setTechnicians(updatedTechs);
        setIsLocating(false);
      },
      () => {
        alert("ไม่สามารถดึงพิกัดได้ กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้ง");
        setIsLocating(false);
      }
    );
  };

  const filtered = useMemo(() => {
    let list = technicians;
    if (selectedCategory) {
      list = list.filter(t => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [technicians, selectedCategory, searchQuery]);

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(prev => prev === catName ? null : catName);
  };

  return (
    <div>
      {/* Search */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="ค้นหาช่าง, แม่บ้าน หรือบริการ..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className={styles.searchIconBtn} aria-label="ค้นหา">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
      </div>

      {/* Category chips */}
      <div className={styles.categoryChips}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.chip} ${selectedCategory === cat.name ? styles.chipActive : ''}`}
            onClick={() => handleCategoryClick(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Location button */}
      <div className={styles.locationRow}>
        <button
          onClick={handleFindNearby}
          disabled={isLocating}
          className={`${styles.locationBtn} ${userLocation ? styles.locationBtnActive : ''}`}
        >
          {isLocating ? '📍 กำลังค้นหาพิกัด...' : userLocation ? '📍 อัปเดตพิกัด' : '📍 ค้นหาช่างใกล้บ้าน'}
        </button>
        {userLocation && (
          <span className={styles.locationInfo}>
            แสดงผลจากใกล้สุด ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
          </span>
        )}
      </div>

      {/* Technician grid */}
      {isLocating ? (
        <div className={styles.grid}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map(tech => (
            <TechnicianCard key={tech.id} {...tech} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <p className={styles.emptyTitle}>ไม่พบช่างที่ตรงกับเงื่อนไข</p>
          <p className={styles.emptyHint}>
            {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'ลองเลือกหมวดหมู่อื่น'}
          </p>
          {(searchQuery || selectedCategory) && (
            <button
              className={styles.clearBtn}
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      )}
    </div>
  );
}
