'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { useMaintenance } from '../../../../features/maintenance';
import { MaintenanceForm } from '../../../../features/maintenance/components/maintenance-form';
import { Maintenance, MaintenanceFormData } from '../../../../features/maintenance/types';

export default function EditMaintenancePage() {
  const router = useRouter();
  const params = useParams();
  const maintenanceId = params?.id as string;

  const { fetchMaintenanceById, updateMaintenance } = useMaintenance();
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 정비 정보 로드
  useEffect(() => {
    const loadMaintenance = async () => {
      if (!maintenanceId) return;

      try {
        setIsLoading(true);
        const data = await fetchMaintenanceById(maintenanceId);
        if (data) {
          setMaintenance(data);
        } else {
          setError('정비 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        // 에러 상태 설정으로 처리
        setError('정비 정보를 로드하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMaintenance();
  }, [maintenanceId, fetchMaintenanceById]);

  // MaintenanceFormData로 변환하는 함수
  const convertToFormData = (maintenance: Maintenance): MaintenanceFormData => {
    return {
      vehicleId: maintenance.vehicleId,
      title: maintenance.title,
      description: maintenance.description,
      scheduledDate: maintenance.scheduledDate, // startDate → scheduledDate
      completedDate: maintenance.completedDate, // endDate → completedDate
      cost: maintenance.cost,
      type: maintenance.type, // maintenanceType → type
      status: maintenance.status,
      serviceCenterId: maintenance.serviceCenterId,
      serviceCenterName: maintenance.serviceCenterName,
      technician: maintenance.technician,
      notes: maintenance.notes,
      parts: maintenance.parts,
    };
  };

  // 정비 수정 제출 핸들러
  const handleSubmit = async (data: MaintenanceFormData) => {
    try {
      if (!maintenance) return;

      setIsSubmitting(true);

      // parts 필드 변환을 위해 타입 변환
      const maintenanceData = {
        ...data,
        parts: data.parts
          ? data.parts.map(part => ({
              ...part,
              id: '', // 임시 ID (서버에서 생성될 예정)
              maintenanceId: maintenanceId,
            }))
          : undefined,
      };

      // 정비 수정 요청
      const result = await updateMaintenance(maintenanceId, maintenanceData);

      if (result) {
        // 성공 시 정비 상세 페이지로 이동
        router.push(`/dashboard/maintenance/${maintenanceId}`);
      } else {
        alert('정비 수정에 실패했습니다.');
        setIsSubmitting(false);
      }
    } catch (error) {
      // 에러는 alert로만 표시
      alert('정비 수정 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.push(`/dashboard/maintenance/${maintenanceId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !maintenance) {
    return (
      <div className="min-h-screen p-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-red-600">오류</h2>
          <p className="text-gray-700">{error || '정비 정보를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.push('/dashboard/maintenance')}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            정비 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center">
        <button onClick={handleCancel} className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">정비 정보 수정</h1>
      </div>

      {/* 컨텐츠 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="mb-6 text-gray-600">
          정비 정보를 수정하세요. 필수 항목(*)을 모두 입력해야 합니다.
        </p>

        <MaintenanceForm
          initialData={convertToFormData(maintenance)}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
