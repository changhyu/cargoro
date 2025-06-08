'use client';

import * as React from 'react';
import { Sidebar } from '../components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="w-64" />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
