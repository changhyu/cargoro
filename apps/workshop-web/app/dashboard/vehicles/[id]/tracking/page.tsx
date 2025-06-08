'use client';

import { VehicleMap } from '../../../../features/vehicles/vehicle-tracking';

interface VehicleTrackingPageProps {
  params: {
    id: string;
  };
}

export default function VehicleTrackingPage({ params }: VehicleTrackingPageProps) {
  const { id } = params;

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">차량 위치 추적</h1>
      <VehicleMap vehicleId={id} />
    </div>
  );
}
