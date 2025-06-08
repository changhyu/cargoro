'use client';

import { PartList } from '@/features/parts-inventory/components/part-list';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();

  const handleCreateClick = () => {
    router.push('/inventory/new');
  };

  return <PartList onCreateClick={handleCreateClick} />;
}
