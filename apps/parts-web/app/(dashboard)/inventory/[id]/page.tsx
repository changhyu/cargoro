import { PartDetail } from '../../../features/parts-management/components';

export const metadata = {
  title: '부품 상세 정보 - CarGoro 부품 관리',
  description: '자동차 부품 상세 정보 조회',
};

export default function PartDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <PartDetail partId={params.id} />
    </div>
  );
}
