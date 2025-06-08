'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useMaintenance } from '../../../features/maintenance';
import { MaintenanceForm } from '../../../features/maintenance/components/maintenance-form';
import { MaintenanceFormData } from '../../../features/maintenance/types';

export default function CreateMaintenancePage() {
  const router = useRouter();
  const { createMaintenance } = useMaintenance();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 정비 등록 제출 핸들러
  const handleSubmit = async (data: MaintenanceFormData) => {
    try {
      setIsSubmitting(true);

      // parts 필드 변환을 위해 타입 변환
      const maintenanceData = {
        ...data,
        parts: data.parts
          ? data.parts.map(part => ({
              ...part,
              id: '', // 임시 ID (서버에서 생성될 예정)
              maintenanceId: '', // 임시 ID (서버에서 생성될 예정)
            }))
          : undefined,
      };

      // 정비 등록 요청
      const result = await createMaintenance(maintenanceData);

      if (result) {
        // 성공 시 정비 목록 페이지로 이동
        router.push('/dashboard/maintenance');
      } else {
        alert('정비 등록에 실패했습니다.');
        setIsSubmitting(false);
      }
    } catch (error) {
      // 에러는 alert로만 표시
      alert('정비 등록 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.push('/dashboard/maintenance');
  };

  return (
    <div className="min-h-screen p-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center">
        <button onClick={handleCancel} className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">새 정비 일정 등록</h1>
      </div>

      {/* 컨텐츠 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="mb-6 text-gray-600">
          차량에 대한 새로운 정비 일정을 등록하세요. 차량 ID, 정비 유형, 일정 등 필요한 정보를
          입력해주세요.
        </p>

        <MaintenanceForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
