'use client';

import { CustomerList } from '../../features/customer-management';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const router = useRouter();

  const handleCreateClick = () => {
    router.push('/customers/new');
  };

  const handleEditClick = (customerId: string) => {
    router.push(`/customers/${customerId}/edit`);
  };

  const handleViewClick = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  return (
    <div className="container mx-auto py-6">
      <CustomerList
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onViewClick={handleViewClick}
      />
    </div>
  );
}
