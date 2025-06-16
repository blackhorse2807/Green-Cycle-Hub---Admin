'use client';

import { AuthProvider } from '@/context/AuthContext';
import Navbar from './Navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="mt-20 pt-2">{children}</main>
    </AuthProvider>
  );
} 