'use client';

import { CustomerForm, useCustomer } from '../../../../features/customer-management';
import { useRouter } from 'next/navigation';

interface EditCustomerPageProps {
  params: {
    id: string;
  };
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const router = useRouter();
  const { data: customer, isLoading } = useCustomer(params.id);

  const handleSuccess = () => {
    router.push(`/customers/${params.id}`);
  };

  const handleCancel = () => {
    router.push(`/customers/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">고객 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">고객 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <CustomerForm customer={customer} onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
