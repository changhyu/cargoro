import { CustomerDetail } from '@/app/features/customers/components/CustomerDetail';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-6">
      <CustomerDetail customerId={params.id} />
    </div>
  );
}
