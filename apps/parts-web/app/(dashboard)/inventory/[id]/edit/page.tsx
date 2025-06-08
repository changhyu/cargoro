import { PartForm } from '../../../../features/parts-management/components';

export const metadata = {
  title: '부품 수정 - CarGoro 부품 관리',
  description: '자동차 부품 정보 수정',
};

export default function EditPartPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <PartForm partId={params.id} isEdit />
    </div>
  );
}
