import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from './dashboard-client';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
