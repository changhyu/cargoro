'use client';

import { CustomerForm } from '../../../features/customer-management';
import { useRouter } from 'next/navigation';

export default function NewCustomerPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/customers');
  };

  const handleCancel = () => {
    router.push('/customers');
  };

  return (
    <div className="container mx-auto py-6">
      <CustomerForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
