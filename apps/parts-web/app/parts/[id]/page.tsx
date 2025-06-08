import { PartDetail } from '../../features/parts/components/PartDetail';

export default function PartDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-6">
      <PartDetail partId={params.id} />
    </div>
  );
}
