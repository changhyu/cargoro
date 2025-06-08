'use client';

import { CustomerDetail } from '../../../features/customer-management';

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  return (
    <div className="container mx-auto py-6">
      <CustomerDetail customerId={params.id} />
    </div>
  );
}
