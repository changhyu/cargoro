import React from 'react';

import VehicleList from '../../features/vehicles/vehicle-list';

export const metadata = {
  title: '차량 관리 - 카고로',
  description: '법인 차량 관리 시스템 - 차량 목록 및 관리',
};

export default function VehiclesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <VehicleList />
    </div>
  );
}
