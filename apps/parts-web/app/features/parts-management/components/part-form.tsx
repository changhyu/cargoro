'use client';

import { useState, useEffect } from 'react';
import { Button } from '@cargoro/ui/button';
import { Input } from '@cargoro/ui/input';
import { Label } from '@cargoro/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui/select';
import { Textarea } from '@cargoro/ui/textarea';
import { useRouter } from 'next/navigation';
import { useAddPart, useUpdatePart, useGetPart } from '../hooks';
import { Part, PartCategory, PartStatus } from '../types';

interface PartFormProps {
  partId?: string;
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PartForm({ partId, isEdit = false, onSuccess, onCancel }: PartFormProps) {
  const router = useRouter();
  const { data: existingPart, isLoading: isLoadingPart } = useGetPart(partId || '');
  const addPart = useAddPart();
  const updatePart = useUpdatePart();

  const [formData, setFormData] = useState<Partial<Part>>({
    partNumber: '',
    name: '',
    description: '',
    category: PartCategory.ENGINE,
    price: 0,
    cost: 0,
    quantity: 0,
    status: PartStatus.IN_STOCK,
    location: '',
    supplier: '',
    manufacturer: '',
    minimumStockLevel: 5,
    reorderPoint: 10,
    weight: '',
    dimensions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // errorMessage 사용하지 않음 - Toast로 처리

  useEffect(() => {
    if (isEdit && existingPart) {
      interface PartDataResponse {
        data?:
          | {
              part?: Part;
            }
          | Part;
      }
      const partResponse = existingPart as PartDataResponse;
      const part =
        partResponse?.data && typeof partResponse.data === 'object' && 'part' in partResponse.data
          ? partResponse.data.part
          : partResponse?.data || existingPart;
      if (part && typeof part === 'object') {
        setFormData(part as Part);
      }
    }
  }, [isEdit, existingPart]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.partNumber) newErrors.partNumber = '부품 번호를 입력하세요';
    if (!formData.name) newErrors.name = '부품명을 입력하세요';
    if (!formData.category) newErrors.category = '카테고리를 선택하세요';
    if (formData.price === undefined || formData.price < 0)
      newErrors.price = '유효한 가격을 입력하세요';
    if (formData.cost === undefined || formData.cost < 0)
      newErrors.cost = '유효한 원가를 입력하세요';
    if (formData.quantity === undefined || formData.quantity < 0)
      newErrors.quantity = '유효한 수량을 입력하세요';
    if (!formData.location) newErrors.location = '위치를 입력하세요';
    if (!formData.supplier) newErrors.supplier = '공급업체를 입력하세요';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  // Select 컴포넌트 값 변경 처리를 위한 별도 핸들러
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    // 에러 메시지 설정 부분 제거

    try {
      if (isEdit && partId) {
        await updatePart.mutateAsync({ id: partId, ...formData });
        router.push(`/dashboard/inventory/${partId}`);
      } else {
        const result = await addPart.mutateAsync(
          formData as Omit<Part, 'id' | 'createdAt' | 'updatedAt'>
        );
        router.push(`/dashboard/inventory/${result.id}`);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch {
      // 에러 발생 시 Toast로 처리되므로 errorMessage 사용 안 함
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoadingPart) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 기본 정보 */}
        <div className="space-y-6 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partNumber">부품 번호 *</Label>
              <Input
                id="partNumber"
                name="partNumber"
                value={formData.partNumber}
                onChange={handleChange}
                className={errors.partNumber ? 'border-red-500' : ''}
              />
              {errors.partNumber && <p className="text-xs text-red-500">{errors.partNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">부품명 *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select
                value={formData.category}
                onValueChange={value => handleSelectChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PartCategory.ENGINE}>엔진</SelectItem>
                  <SelectItem value={PartCategory.BRAKE}>브레이크</SelectItem>
                  <SelectItem value={PartCategory.TRANSMISSION}>변속기</SelectItem>
                  <SelectItem value={PartCategory.ELECTRICAL}>전기장치</SelectItem>
                  <SelectItem value={PartCategory.BODY}>차체</SelectItem>
                  <SelectItem value={PartCategory.INTERIOR}>내부장치</SelectItem>
                  <SelectItem value={PartCategory.EXTERIOR}>외부장치</SelectItem>
                  <SelectItem value={PartCategory.FLUID}>오일류</SelectItem>
                  <SelectItem value={PartCategory.FILTER}>필터류</SelectItem>
                  <SelectItem value={PartCategory.OTHER}>기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태 *</Label>
              <Select
                value={formData.status}
                onValueChange={value => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PartStatus.IN_STOCK}>재고 있음</SelectItem>
                  <SelectItem value={PartStatus.LOW_STOCK}>재고 부족</SelectItem>
                  <SelectItem value={PartStatus.OUT_OF_STOCK}>재고 없음</SelectItem>
                  <SelectItem value={PartStatus.DISCONTINUED}>단종</SelectItem>
                  <SelectItem value={PartStatus.ON_ORDER}>주문 중</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 가격 및 재고 정보 */}
        <div className="space-y-6 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900">가격 및 재고 정보</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">판매 가격 (원) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">원가 (원) *</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && <p className="text-xs text-red-500">{errors.cost}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">현재 재고 수량 *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">보관 위치 *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">공급업체</Label>
              <Input
                id="supplier"
                name="supplier"
                value={
                  typeof formData.supplier === 'string'
                    ? formData.supplier
                    : formData.supplier?.name || ''
                }
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="space-y-6 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900">추가 정보</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">제조사</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumStockLevel">최소 재고 수준</Label>
              <Input
                id="minimumStockLevel"
                name="minimumStockLevel"
                type="number"
                value={formData.minimumStockLevel}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderPoint">재주문 포인트</Label>
              <Input
                id="reorderPoint"
                name="reorderPoint"
                type="number"
                value={formData.reorderPoint}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* 물리적 특성 */}
        <div className="space-y-6 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900">물리적 특성</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">무게 (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                value={formData.weight || ''}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">크기 (mm, 가로x세로x높이)</Label>
              <Input
                id="dimensions"
                name="dimensions"
                value={formData.dimensions || ''}
                onChange={handleChange}
                placeholder="예: 150x100x50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.back())}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : isEdit ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  );
}
