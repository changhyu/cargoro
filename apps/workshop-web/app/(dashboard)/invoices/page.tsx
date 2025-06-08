'use client';

import { InvoiceList } from '../../features/payment-invoice';
import { useRouter } from 'next/navigation';

export default function InvoicesPage() {
  const router = useRouter();

  const handleCreateClick = () => {
    router.push('/invoices/new');
  };

  return (
    <div className="container mx-auto py-6">
      <InvoiceList onCreateClick={handleCreateClick} />
    </div>
  );
}
