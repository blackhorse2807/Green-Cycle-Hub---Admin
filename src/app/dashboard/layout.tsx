import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | rPP Admin',
  description: 'Overview of platform statistics and recent activity',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 