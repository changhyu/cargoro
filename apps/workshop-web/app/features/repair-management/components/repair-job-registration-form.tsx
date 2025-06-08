import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@cargoro/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@cargoro/ui';
import { Button } from '@cargoro/ui';
import { Input } from '@cargoro/ui';
import { Textarea } from '@cargoro/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui';

import { useRepairJobs } from '../hooks/useRepairJobs';
import { RepairPriority, RepairType, TechnicianRole } from '../types';

// 폼 검증 스키마
const repairJobFormSchema = z.object({
  // 차량 정보
  vehicleInfo: z.object({
    licensePlate: z.string().min(1, '차량 번호는 필수입니다'),
    manufacturer: z.string().min(1, '제조사는 필수입니다'),
    model: z.string().min(1, '모델명은 필수입니다'),
    year: z.coerce
      .number()
      .min(1900, '연식이 올바르지 않습니다')
      .max(new Date().getFullYear() + 1, '미래 연식은 입력할 수 없습니다'),
    vin: z.string().min(1, 'VIN은 필수입니다'),
  }),
  // 고객 정보
  customerInfo: z.object({
    name: z.string().min(1, '고객명은 필수입니다'),
    phone: z.string().min(1, '연락처는 필수입니다'),
    email: z.string().email('유효한 이메일 형식이 아닙니다').optional().or(z.literal('')),
  }),
  // 작업 정보
  description: z.string().min(1, '작업 내용은 필수입니다'),
  type: z.string().min(1, '작업 유형은 필수입니다'),
  priority: z.string().min(1, '우선순위는 필수입니다'),
  estimatedHours: z.coerce.number().min(0.5, '최소 0.5시간 이상이어야 합니다'),
  assignedTechnicianId: z.string().optional(),
  notes: z.string().optional(),
});

type RepairJobFormValues = z.infer<typeof repairJobFormSchema>;

interface RepairJobRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RepairJobRegistrationForm: React.FC<RepairJobRegistrationFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicians, setTechnicians] = useState<{ id: string; name: string; role: string }[]>([]);

  // useRepairJobs 훅에서 필요한 메서드만 가져오기
  const { createRepairJob, fetchTechnicians } = useRepairJobs({
    page: 1,
    pageSize: 10,
  });

  // 폼 초기화
  const form = useForm<RepairJobFormValues>({
    resolver: zodResolver(repairJobFormSchema),
    defaultValues: {
      vehicleInfo: {
        licensePlate: '',
        manufacturer: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
      },
      customerInfo: {
        name: '',
        phone: '',
        email: '',
      },
      description: '',
      type: 'regular',
      priority: 'normal',
      estimatedHours: 1,
      assignedTechnicianId: '',
      notes: '',
    },
  });

  // 정비사 목록 불러오기
  React.useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const techData = await fetchTechnicians();
        setTechnicians(techData);
      } catch (error) {
        // 정비사 목록 로드 오류 처리
      }
    };

    if (isOpen) {
      loadTechnicians();
    }
  }, [isOpen, fetchTechnicians]);

  // 폼 제출 처리
  const onSubmit = async (values: RepairJobFormValues) => {
    try {
      setIsSubmitting(true);

      const technicianInfo = values.assignedTechnicianId
        ? technicians.find(tech => tech.id === values.assignedTechnicianId)
        : null;

      // 작업 등록 API 호출
      await createRepairJob({
        vehicleId: `v-${Date.now()}`, // 실제 구현 시 차량 ID 연동 필요
        vehicleInfo: values.vehicleInfo,
        customerInfo: {
          id: `c-${Date.now()}`, // 실제 구현 시 고객 ID 연동 필요
          name: values.customerInfo.name,
          phone: values.customerInfo.phone,
          ...(values.customerInfo.email && { email: values.customerInfo.email }),
        },
        description: values.description,
        status: 'pending',
        type: values.type as RepairType,
        priority: values.priority as RepairPriority,
        estimatedHours: values.estimatedHours,
        assignedTechnicianId: values.assignedTechnicianId || null,
        ...(technicianInfo && {
          technicianInfo: {
            id: technicianInfo.id,
            name: technicianInfo.name,
            role: (technicianInfo.role as TechnicianRole) || 'junior',
          },
        }),
        startDate: null,
        completionDate: null,
        notes: values.notes || '',
        cost: {
          labor: values.estimatedHours * 50000, // 예상 공임비 (시간당 5만원)
          parts: 0, // 초기에는 부품비 0원
          total: values.estimatedHours * 50000, // 초기 총액
          currency: 'KRW',
        },
        usedParts: [],
        diagnostics: [],
        images: [],
      });

      onSuccess();
      form.reset();
    } catch (error) {
      // 작업 등록 오류 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 정비 작업 등록</DialogTitle>
          <DialogDescription>정비 작업 등록을 위한 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">차량 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vehicleInfo.licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>차량 번호 *</FormLabel>
                      <FormControl>
                        <Input placeholder="12가 3456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleInfo.vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN *</FormLabel>
                      <FormControl>
                        <Input placeholder="KMHXX00X0XX000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleInfo.manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제조사 *</FormLabel>
                      <FormControl>
                        <Input placeholder="현대" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleInfo.model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모델 *</FormLabel>
                      <FormControl>
                        <Input placeholder="아반떼" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleInfo.year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연식 *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">고객 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerInfo.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>고객명 *</FormLabel>
                      <FormControl>
                        <Input placeholder="홍길동" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerInfo.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연락처 *</FormLabel>
                      <FormControl>
                        <Input placeholder="010-1234-5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerInfo.email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">작업 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>작업 유형 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="작업 유형을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="regular">정기 점검</SelectItem>
                          <SelectItem value="emergency">긴급 수리</SelectItem>
                          <SelectItem value="inspection">검사</SelectItem>
                          <SelectItem value="warranty">보증 수리</SelectItem>
                          <SelectItem value="recall">리콜</SelectItem>
                          <SelectItem value="repair">일반 수리</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>우선순위 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="우선순위를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">낮음</SelectItem>
                          <SelectItem value="normal">보통</SelectItem>
                          <SelectItem value="high">높음</SelectItem>
                          <SelectItem value="urgent">긴급</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>예상 작업 시간 (시간) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" min="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedTechnicianId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>담당 정비사</FormLabel>
                      <Select
                        onValueChange={(value: string) => field.onChange(value)}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="정비사를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">미지정</SelectItem>
                          {technicians.map(tech => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name} ({tech.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>작업 내용 *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="정비 작업 내용을 자세히 입력하세요"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>작업 메모</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="추가 메모 사항이 있으면 입력하세요"
                        className="min-h-[80px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '등록 중...' : '작업 등록'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RepairJobRegistrationForm;
