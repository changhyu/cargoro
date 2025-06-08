'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Truck,
  DollarSign,
  MapPin,
  User,
  FileText,
  Edit,
  Trash,
  CheckCircle,
  Wrench as Tool,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { useMaintenance } from '../../../features/maintenance';
import { Maintenance, MaintenanceStatus } from '../../../features/maintenance/types';

export default function MaintenanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const maintenanceId = params?.id as string;

  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchMaintenanceById, updateMaintenanceStatus, deleteMaintenance } = useMaintenance();

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

  // 정비 상태 변경
  const handleStatusChange = async (status: MaintenanceStatus) => {
    if (!maintenance) return;

    try {
      const updated = await updateMaintenanceStatus(maintenance.id, status);
      if (updated) {
        setMaintenance(updated);
      }
    } catch (error) {
      // 에러는 alert로만 표시
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 정비 삭제
  const handleDelete = async () => {
    if (!maintenance) return;

    if (window.confirm(`'${maintenance.title}' 정비 기록을 삭제하시겠습니까?`)) {
      try {
        const success = await deleteMaintenance(maintenance.id);
        if (success) {
          router.push('/dashboard/maintenance');
        }
      } catch (error) {
        // 에러는 alert로만 표시
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 편집 페이지로 이동
  const handleEdit = () => {
    router.push(`/dashboard/maintenance/${maintenanceId}/edit`);
  };

  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 금액 포맷팅
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  // 상태 배지
  const getStatusBadge = (status: MaintenanceStatus) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      pending: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      scheduled: '예정',
      in_progress: '진행 중',
      completed: '완료',
      cancelled: '취소',
      pending: '대기',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  // 정비 유형 레이블
  const getMaintenanceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      regular: '정기점검',
      repair: '수리',
      emergency: '긴급수리',
    };

    return types[type] || type;
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/dashboard/maintenance')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">{maintenance.title}</h1>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"
          >
            <Edit className="mr-1 h-4 w-4" />
            수정
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
          >
            <Trash className="mr-1 h-4 w-4" />
            삭제
          </button>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {/* 상태 섹션 */}
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">상태:</span>
            {getStatusBadge(maintenance.status as MaintenanceStatus)}
          </div>

          <div className="flex space-x-2">
            {maintenance.status !== 'scheduled' && (
              <button
                onClick={() => handleStatusChange('scheduled')}
                className="rounded bg-blue-50 px-3 py-1 text-xs text-blue-600 hover:bg-blue-100"
              >
                예정으로 변경
              </button>
            )}
            {maintenance.status !== 'in_progress' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="rounded bg-yellow-50 px-3 py-1 text-xs text-yellow-600 hover:bg-yellow-100"
              >
                진행 중으로 변경
              </button>
            )}
            {maintenance.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="rounded bg-green-50 px-3 py-1 text-xs text-green-600 hover:bg-green-100"
              >
                <CheckCircle className="mr-1 inline h-3 w-3" />
                완료로 변경
              </button>
            )}
            {maintenance.status !== 'cancelled' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="rounded bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
              >
                취소로 변경
              </button>
            )}
          </div>
        </div>

        {/* 정비 정보 */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 왼쪽 컬럼: 기본 정보 */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium">정비 정보</h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <Tool className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">정비 유형</p>
                      <p className="font-medium">{getMaintenanceTypeLabel(maintenance.type)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">예정일</p>
                      <p className="font-medium">{formatDate(maintenance.scheduledDate)}</p>
                    </div>
                  </div>

                  {maintenance.completedDate && (
                    <div className="flex items-start">
                      <Clock className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">완료일</p>
                        <p className="font-medium">{formatDate(maintenance.completedDate)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <Truck className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">차량 ID</p>
                      <p className="font-medium">{maintenance.vehicleId}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <DollarSign className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">비용</p>
                      <p className="font-medium">{formatCurrency(maintenance.cost)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 컬럼: 서비스 정보 및 상세 내용 */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium">서비스 정보</h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">정비소</p>
                      <p className="font-medium">{maintenance.serviceCenterName || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">담당 기술자</p>
                      <p className="font-medium">{maintenance.technician || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium">상세 내용</h3>

                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-start">
                    <FileText className="mr-2 mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">설명</p>
                      <p className="whitespace-pre-line">
                        {maintenance.description || '상세 설명이 없습니다.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {maintenance.notes && (
                <div>
                  <h3 className="mb-4 text-lg font-medium">메모</h3>

                  <div className="rounded-lg bg-yellow-50 p-4">
                    <p className="whitespace-pre-line text-gray-800">{maintenance.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 부품 정보 */}
          {maintenance.parts && maintenance.parts.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-medium">교체 부품</h3>

              <div className="overflow-hidden rounded-lg border bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        부품 번호
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        부품명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        수량
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        단가
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        공급업체
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {maintenance.parts.map(part => (
                      <tr key={part.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {part.partNumber}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {part.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {part.quantity}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {part.unitCost ? formatCurrency(part.unitCost) : '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {part.supplier || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {part.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
