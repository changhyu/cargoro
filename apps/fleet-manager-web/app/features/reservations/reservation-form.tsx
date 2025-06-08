'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, User, CarFront } from 'lucide-react';
import { z } from 'zod';
import { ReservationStatus } from '@cargoro/types/schema/reservation';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useToast,
} from '@cargoro/ui';

import { vehicleService, Vehicle } from '../../services/api';

// 예약 폼 유효성 검사 스키마
const reservationSchema = z.object({
  vehicleId: z.string().min(1, '차량을 선택해주세요'),
  vehicleLicensePlate: z.string().min(1, '차량 번호는 필수입니다'),
  customerName: z.string().min(1, '고객 이름은 필수입니다'),
  customerPhone: z
    .string()
    .min(1, '연락처는 필수입니다')
    .regex(/^\d{2,3}-\d{3,4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'),
  startDate: z.string().min(1, '시작 일시는 필수입니다'),
  endDate: z.string().min(1, '종료 일시는 필수입니다'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'in_progress']),
  purpose: z.string().min(1, '예약 목적은 필수입니다'),
  notes: z.string().optional(),
});

// 폼 입력 타입
type ReservationFormData = z.infer<typeof reservationSchema>;

// 컴포넌트 프롭스 타입
interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    vehicleId: string;
    vehicleLicensePlate: string;
    customerName: string;
    customerPhone: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
    purpose: string;
    notes?: string;
  }) => void;
}

export default function ReservationForm({
  isOpen,
  onClose,
  onSubmit,
}: ReservationFormProps): React.ReactElement {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [_vehiclesLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 폼 상태
  const [formData, setFormData] = useState<ReservationFormData>({
    vehicleId: '',
    vehicleLicensePlate: '',
    customerName: '',
    customerPhone: '',
    startDate: new Date().toISOString().substring(0, 16), // 현재 시간으로 초기화 (yyyy-MM-ddThh:mm)
    endDate: new Date(Date.now() + 3600000).toISOString().substring(0, 16), // 1시간 후로 초기화
    status: 'pending' as const,
    purpose: '',
    notes: '',
  });

  // 사용 가능한 차량 목록 가져오기
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        const response = await vehicleService.getVehicles();
        setVehicles(response.vehicles || []);
      } catch (_error) {
        // 개발 환경에서만 상세 에러 로깅
        if (process.env.NODE_ENV === 'development') {
          // 차량 목록 로딩 오류
        }
        toast({
          title: '오류',
          description: '차량 목록을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen, toast]);

  // 폼 데이터 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 차량 선택 핸들러
  const handleVehicleSelect = (vehicleId: string) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      setFormData(prev => ({
        ...prev,
        vehicleId,
        vehicleLicensePlate: selectedVehicle.licensePlate || selectedVehicle.plateNumber || '', // 안전한 접근
      }));
    }
  };

  // 폼 제출 처리
  const processSubmit = async (data: ReservationFormData): Promise<void> => {
    try {
      setIsSubmitting(true);

      // 타입 안전성을 위한 데이터 변환
      const reservationData = {
        vehicleId: data.vehicleId || '',
        vehicleLicensePlate: data.vehicleLicensePlate || '',
        customerName: data.customerName || '',
        customerPhone: data.customerPhone || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        status: data.status || 'pending',
        purpose: data.purpose || '',
        notes: data.notes,
      };

      // 필수 필드 검증
      if (
        !reservationData.vehicleId ||
        !reservationData.customerName ||
        !reservationData.customerPhone ||
        !reservationData.startDate ||
        !reservationData.endDate
      ) {
        throw new Error('필수 필드가 누락되었습니다.');
      }

      // 유효성 검증
      reservationSchema.parse(reservationData);

      // 날짜 검증
      const start = new Date(reservationData.startDate);
      const end = new Date(reservationData.endDate);

      if (end <= start) {
        setErrors({
          endDate: '종료 시간은 시작 시간보다 뒤여야 합니다.',
        });
        return;
      }

      // 에러 초기화
      setErrors({});

      if (onSubmit) {
        await onSubmit(reservationData);
      }

      // 폼 초기화 및 닫기
      setFormData({
        vehicleId: '',
        vehicleLicensePlate: '',
        customerName: '',
        customerPhone: '',
        startDate: new Date().toISOString().substring(0, 16),
        endDate: new Date(Date.now() + 3600000).toISOString().substring(0, 16),
        status: 'pending' as const,
        purpose: '',
        notes: '',
      });

      // 성공 메시지
      toast({
        title: '예약 생성 완료',
        description: '새 예약이 성공적으로 생성되었습니다.',
      });

      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Zod 유효성 검사 오류 처리
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        toast({
          title: '오류',
          description: '예약 생성 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setFormData({
      vehicleId: '',
      vehicleLicensePlate: '',
      customerName: '',
      customerPhone: '',
      startDate: new Date().toISOString().substring(0, 16),
      endDate: new Date(Date.now() + 3600000).toISOString().substring(0, 16),
      status: ReservationStatus.PENDING,
      purpose: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />새 예약 생성
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 차량 정보 */}
          <div className="space-y-3">
            <h3 className="flex items-center text-lg font-medium">
              <CarFront className="mr-2 h-5 w-5" />
              차량 정보
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vehicleId">차량 선택</Label>
                <Select value={formData.vehicleId} onValueChange={handleVehicleSelect}>
                  <SelectTrigger id="vehicleId">
                    <SelectValue placeholder="차량을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} ({vehicle.make} {vehicle.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleId && (
                  <p className="mt-1 text-sm text-red-500">{errors.vehicleId}</p>
                )}
              </div>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="space-y-3">
            <h3 className="flex items-center text-lg font-medium">
              <User className="mr-2 h-5 w-5" />
              고객 정보
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customerName">고객명</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="고객 이름"
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="customerPhone">연락처</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-red-500">{errors.customerPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* 예약 정보 */}
          <div className="space-y-3">
            <h3 className="flex items-center text-lg font-medium">
              <Calendar className="mr-2 h-5 w-5" />
              예약 정보
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="startDate">시작 일시</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endDate">종료 일시</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="purpose">예약 목적</Label>
                <Input
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="예약 목적을 입력하세요"
                />
                {errors.purpose && <p className="mt-1 text-sm text-red-500">{errors.purpose}</p>}
              </div>

              <div>
                <Label htmlFor="notes">비고 (선택사항)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="추가 정보를 입력하세요"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t pt-4">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button onClick={() => processSubmit(formData)} disabled={isSubmitting}>
              예약 생성
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
