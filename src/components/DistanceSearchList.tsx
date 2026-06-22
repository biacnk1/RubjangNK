'use client';

import React, { useState } from 'react';
import TechnicianCard from './TechnicianCard';

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
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

export default function DistanceSearchList({ initialTechnicians }: { initialTechnicians: Technician[] }) {
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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
        
        // Calculate distance for all technicians
        const updatedTechs = initialTechnicians.map(tech => {
          if (tech.latitude && tech.longitude) {
            const dist = calculateDistance(latitude, longitude, tech.latitude, tech.longitude);
            return { ...tech, distance: dist };
          }
          return tech;
        });

        // Sort: those with distance first, then those without distance
        updatedTechs.sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
          if (a.distance !== undefined) return -1; // a comes first
          if (b.distance !== undefined) return 1;  // b comes first
          return 0; // maintain original order if both don't have distance
        });

        setTechnicians(updatedTechs);
        setIsLocating(false);
      },
      (error) => {
        alert("ไม่สามารถดึงพิกัดได้ กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้ง");
        setIsLocating(false);
      }
    );
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <button 
          onClick={handleFindNearby}
          disabled={isLocating}
          style={{
            padding: '14px 28px',
            background: userLocation ? '#e8f5e9' : '#00b900',
            color: userLocation ? '#2e7d32' : 'white',
            border: userLocation ? '1px solid #4caf50' : 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          {isLocating ? '📍 กำลังค้นหาพิกัด...' : userLocation ? '📍 อัปเดตพิกัดค้นหาช่างใกล้บ้าน' : '📍 ดึงพิกัดเพื่อค้นหาช่างใกล้บ้าน'}
        </button>
        {userLocation && (
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
            แสดงผลช่างที่อยู่ใกล้คุณ ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {technicians.map((tech) => (
          <TechnicianCard key={tech.id} {...tech} />
        ))}
      </div>
    </div>
  );
}
