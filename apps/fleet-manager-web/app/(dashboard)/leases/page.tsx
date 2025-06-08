'use client';

import React from 'react';

import LeaseList from '../../features/leases/lease-list';

export default function LeasesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <LeaseList />
    </div>
  );
}
