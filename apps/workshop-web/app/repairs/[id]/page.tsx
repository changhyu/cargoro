import { RepairRequestDetail } from '@/app/features/repairs/components';

interface PageProps {
  params: {
    id: string;
  };
}

export default function RepairDetailPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <RepairRequestDetail requestId={params.id} />
    </div>
  );
}
