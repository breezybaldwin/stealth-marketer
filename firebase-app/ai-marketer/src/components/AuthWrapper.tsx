'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoginForm from './LoginForm';
import ProfileSetup from './ProfileSetup';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    checkUserProfile();
  }, [user]);

  const checkUserProfile = async () => {
    if (!user || !db) {
      setCheckingProfile(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const hasProfile = userDoc.exists() && userDoc.data()?.contexts;
      setProfileExists(hasProfile);
    } catch (error) {
      console.error('Failed to check user profile:', error);
      setProfileExists(false);
    } finally {
      setCheckingProfile(false);
    }
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (profileExists === false) {
    return <ProfileSetup onComplete={() => setProfileExists(true)} />;
  }

  return <>{children}</>;
}
