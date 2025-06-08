'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, FileText, MapPin, Plus, Trash, User } from 'lucide-react';

import { MaintenanceFormData, MaintenanceStatus, MaintenanceType, MaintenancePart } from '../types';

interface MaintenanceFormProps {
  initialData?: Partial<MaintenanceFormData>;
  onSubmit: (data: MaintenanceFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MaintenanceForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: MaintenanceFormProps) {
  const isEditMode = !!initialData?.vehicleId;

  // 상태 관리
  const [formData, setFormData] = useState<MaintenanceFormData>({
    vehicleId: '',
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    type: 'scheduled' as MaintenanceType,
    status: 'scheduled' as MaintenanceStatus,
    ...initialData,
  });

  const [parts, setParts] = useState<Array<Omit<MaintenancePart, 'id' | 'maintenanceId'>>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 초기 데이터가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicleId: '',
        title: '',
        description: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        type: 'scheduled' as MaintenanceType,
        status: 'scheduled' as MaintenanceStatus,
        ...initialData,
      });

      if (initialData.parts) {
        const formattedParts = initialData.parts.map(part => ({
          name: part.name,
          partNumber: part.partNumber,
          quantity: part.quantity,
          unitCost: part.unitCost,
          totalCost: part.totalCost,
          supplier: part.supplier,
        }));
        setParts(formattedParts);
      }
    }
  }, [initialData]);

  // 입력 필드 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 오류 지우기
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 부품 추가
  const handleAddPart = () => {
    setParts(prev => [
      ...prev,
      {
        name: '',
        partNumber: '',
        quantity: 1,
        unitCost: 0,
        totalCost: 0,
        supplier: '',
      },
    ]);
  };

  // 부품 수정
  const handlePartChange = (index: number, field: string, value: string | number) => {
    setParts(prev => {
      const newParts = [...prev];
      (newParts[index] as Record<string, string | number>)[field] = value;

      // totalCost 자동 계산 (quantity와 unitCost가 변경될 때)
      if (field === 'quantity' || field === 'unitCost') {
        const quantity = field === 'quantity' ? value : newParts[index].quantity;
        const unitCost = field === 'unitCost' ? value : newParts[index].unitCost;
        (newParts[index] as Record<string, string | number>).totalCost =
          Number(quantity) * Number(unitCost);
      }

      return newParts;
    });
  };

  // 부품 삭제
  const handleRemovePart = (index: number) => {
    setParts(prev => prev.filter((_, i) => i !== index));
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = '차량 ID는 필수입니다.';
    }

    if (!formData.title) {
      newErrors.title = '제목은 필수입니다.';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = '일정일은 필수입니다.';
    }

    if (
      formData.completedDate &&
      new Date(formData.completedDate) < new Date(formData.scheduledDate)
    ) {
      newErrors.completedDate = '완료일은 일정일 이후여야 합니다.';
    }

    if (formData.cost !== undefined && formData.cost < 0) {
      newErrors.cost = '비용은 0 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 최종 폼 데이터 생성
    const finalFormData: MaintenanceFormData = {
      ...formData,
      parts: parts.length > 0 ? parts : undefined,
    };

    onSubmit(finalFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 왼쪽 컬럼: 기본 정보 */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">기본 정보</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
                  차량 ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="vehicleId"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.vehicleId ? 'border-red-500' : ''
                  }`}
                  disabled={isEditMode}
                />
                {errors.vehicleId && (
                  <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  정비 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="scheduled">정기점검</option>
                  <option value="repair">수리</option>
                  <option value="emergency">긴급수리</option>
                  <option value="inspection">검사</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  상태 <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="scheduled">예정</option>
                  <option value="in_progress">진행 중</option>
                  <option value="completed">완료</option>
                  <option value="cancelled">취소</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 컬럼: 일정 및 비용 정보 */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">일정 및 비용</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                  일정일 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.scheduledDate ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.scheduledDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="completedDate" className="block text-sm font-medium text-gray-700">
                  완료일
                </label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="completedDate"
                    name="completedDate"
                    value={formData.completedDate || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.completedDate ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.completedDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.completedDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                  비용 (원)
                </label>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost || ''}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.cost ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost}</p>}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="serviceCenterName"
                  className="block text-sm font-medium text-gray-700"
                >
                  정비소
                </label>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="serviceCenterName"
                    name="serviceCenterName"
                    value={formData.serviceCenterName || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="technician" className="block text-sm font-medium text-gray-700">
                  담당 기술자
                </label>
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="technician"
                    name="technician"
                    value={formData.technician || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  메모
                </label>
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-gray-400" />
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 부품 정보 */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">교체 부품</h3>
          <button
            type="button"
            onClick={handleAddPart}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Plus className="mr-1 h-4 w-4" />
            부품 추가
          </button>
        </div>

        {parts.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-6 text-center">
            <p className="text-gray-500">
              등록된 부품이 없습니다. 부품 추가 버튼을 클릭하여 부품을 추가하세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
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
                    단가 (원)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    공급업체
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    총액
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {parts.map((part, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <input
                        type="text"
                        value={part.partNumber || ''}
                        onChange={e => handlePartChange(index, 'partNumber', e.target.value)}
                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                        placeholder="부품번호"
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <input
                        type="text"
                        value={part.name || ''}
                        onChange={e => handlePartChange(index, 'name', e.target.value)}
                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                        placeholder="부품명"
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <input
                        type="number"
                        value={part.quantity}
                        onChange={e =>
                          handlePartChange(index, 'quantity', parseInt(e.target.value) || 0)
                        }
                        min="1"
                        className="block w-20 border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <input
                        type="number"
                        value={part.unitCost || ''}
                        onChange={e =>
                          handlePartChange(
                            index,
                            'unitCost',
                            e.target.value ? parseInt(e.target.value) : 0
                          )
                        }
                        min="0"
                        step="1000"
                        className="block w-32 border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                        placeholder="단가"
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <input
                        type="text"
                        value={part.supplier || ''}
                        onChange={e => handlePartChange(index, 'supplier', e.target.value)}
                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                        placeholder="공급업체"
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {part.totalCost ? part.totalCost.toLocaleString() + '원' : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemovePart(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 버튼 섹션 */}
      <div className="flex justify-end space-x-3 border-t pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          취소
        </button>
        <button
          type="submit"
          className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? '저장 중...' : isEditMode ? '수정' : '등록'}
        </button>
      </div>
    </form>
  );
}
