import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | rPP Admin',
  description: 'Login to rPP Admin Dashboard',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 