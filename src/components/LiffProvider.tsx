'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Liff } from '@line/liff';
import { createClient } from '@/utils/supabase/client';

interface LiffContextType {
  liff: Liff | null;
  liffError: string | null;
  isLoggedIn: boolean;
  isReady: boolean;
  profile: any | null;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  liffError: null,
  isLoggedIn: false,
  isReady: false,
  profile: null,
});

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [liff, setLiff] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    import('@line/liff').then((liffModule) => {
      const liff = liffModule.default;
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      
      if (!liffId) {
        setLiffError('LIFF ID is not defined in .env');
        console.warn('LIFF ID is not defined in .env');
        return;
      }

      liff.init({ liffId })
        .then(async () => {
          setLiff(liff);
          if (liff.isLoggedIn()) {
            setIsLoggedIn(true);
            try {
              const userProfile = await liff.getProfile();
              setProfile(userProfile);
              
              // Sync with Supabase Auth
              const supabase = createClient();
              const email = `${userProfile.userId}@line.liff`;
              const { error } = await supabase.auth.signInWithPassword({
                email,
                password: userProfile.userId
              });
              
              if (error && error.message.includes("Invalid login credentials")) {
                // First time login
                await supabase.auth.signUp({
                  email,
                  password: userProfile.userId,
                });
              }
            } catch (err) {
              console.error('Failed to get LIFF profile or login to Supabase', err);
            }
          }
          setIsReady(true);
        })
        .catch((err: Error) => {
          setLiffError(err.toString());
          setIsReady(true); // ready แม้ error เพื่อไม่ให้ค้าง
          console.error('LIFF init failed', err);
        });
    });
  }, []);

  return (
    <LiffContext.Provider value={{ liff, liffError, isLoggedIn, isReady, profile }}>
      {children}
    </LiffContext.Provider>
  );
}

export const useLiff = () => useContext(LiffContext);
