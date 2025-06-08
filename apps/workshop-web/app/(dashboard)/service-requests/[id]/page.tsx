/**
 * 정비 서비스 요청 상세 페이지
 */
'use client';

import { useRouter } from 'next/navigation';
import { ServiceRequestDetails } from '../../../features/service-request-management';

interface ServiceRequestDetailPageProps {
  params: {
    id: string;
  };
}

export default function ServiceRequestDetailPage({
  params: { id },
}: ServiceRequestDetailPageProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/service-requests');
  };

  return (
    <div className="container mx-auto py-8">
      <ServiceRequestDetails id={id} onBack={handleBack} />
    </div>
  );
}
