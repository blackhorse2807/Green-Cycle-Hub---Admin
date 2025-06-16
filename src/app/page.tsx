'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [user, router]);

  // Return null as we're redirecting
  return null;
} 