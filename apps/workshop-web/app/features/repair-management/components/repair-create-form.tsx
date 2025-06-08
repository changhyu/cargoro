'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';

import { useCreateRepairJob } from '../hooks/useRepairJobApi';
import type { RepairStatus } from '../types';
import { CostInfo, VehicleInfo, RepairJobCreateData } from '../types';
import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  cn,
} from '@cargoro/ui';

// 정비 작업 생성 폼 스키마 정의
const repairJobSchema = z.object({
  vehicleInfo: z.object({
    licensePlate: z.string().min(1, '차량번호는 필수입니다'),
    manufacturer: z.string().min(1, '제조사는 필수입니다'),
    model: z.string().min(1, '모델은 필수입니다'),
    year: z
      .string()
      .min(1, '연식은 필수입니다')
      .transform(value => parseInt(value, 10)),
    vin: z.string().min(1, 'VIN은 필수입니다'),
  }),
  customerInfo: z.object({
    name: z.string().min(1, '고객명은 필수입니다'),
    phone: z.string().min(1, '연락처는 필수입니다'),
    email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  }),
  description: z.string().min(1, '정비 내용은 필수입니다'),
  notes: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent'] as const),
  type: z.enum(['regular', 'repair', 'warranty', 'recall', 'custom'] as const),
  scheduledDate: z.date().optional(),
  estimatedDuration: z
    .string()
    .optional()
    .transform(value => (value ? parseInt(value) : undefined)),
  cost: z.object({
    labor: z
      .string()
      .min(1, '공임비는 필수입니다')
      .transform(value => parseInt(value, 10))
      .or(z.number()),
    parts: z
      .string()
      .min(1, '부품비는 필수입니다')
      .transform(value => parseInt(value, 10))
      .or(z.number()),
  }),
});

type RepairJobFormValues = z.infer<typeof repairJobSchema>;

interface RepairCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultValues: Partial<RepairJobFormValues> = {
  priority: 'normal',
  type: 'regular',
  cost: {
    labor: 0,
    parts: 0,
  },
  notes: '',
};

export function RepairCreateForm({ isOpen, onClose, onSuccess }: RepairCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: createRepairJob } = useCreateRepairJob();

  // 폼 정의
  const form = useForm<RepairJobFormValues>({
    resolver: zodResolver(repairJobSchema),
    defaultValues,
  });

  // 폼 제출 처리
  const onSubmit = (values: RepairJobFormValues) => {
    setIsSubmitting(true);

    // 총 비용 계산
    const labor =
      typeof values.cost.labor === 'string' ? parseInt(values.cost.labor, 10) : values.cost.labor;
    const parts =
      typeof values.cost.parts === 'string' ? parseInt(values.cost.parts, 10) : values.cost.parts;
    const total = labor + parts;

    // API 요청 데이터 구성
    const jobData = {
      vehicleInfo: {
        ...values.vehicleInfo,
        id: `vehicle-${Date.now()}`, // 임시 ID (실제로는 백엔드에서 생성됨)
      } as VehicleInfo,
      customerInfo: {
        ...values.customerInfo,
        id: `customer-${Date.now()}`, // 임시 ID (실제로는 백엔드에서 생성됨)
      },
      description: values.description,
      notes: values.notes || '',
      status: 'pending' as RepairStatus,
      priority: values.priority,
      type: values.type,
      scheduledDate: values.scheduledDate
        ? values.scheduledDate.toISOString().split('T')[0]
        : undefined,
      estimatedDuration: values.estimatedDuration,
      cost: {
        labor,
        parts,
        total,
        currency: 'KRW',
      } as CostInfo,
    };

    // API 호출
    createRepairJob(jobData as RepairJobCreateData, {
      onSuccess: () => {
        setIsSubmitting(false);
        form.reset(defaultValues);
        onSuccess();
        onClose();
      },
      onError: () => {
        // TODO: 에러 처리 및 로깅 구현
        setIsSubmitting(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 정비 작업 등록</DialogTitle>
          <DialogDescription>
            새로운 정비 작업을 등록합니다. 모든 필수 항목을 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 차량 정보 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">차량 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vehicleInfo.licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>차량번호</FormLabel>
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
                      <FormLabel>VIN</FormLabel>
                      <FormControl>
                        <Input placeholder="KMHDN41VP7U123456" {...field} />
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
                      <FormLabel>제조사</FormLabel>
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
                      <FormLabel>모델</FormLabel>
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
                      <FormLabel>연식</FormLabel>
                      <FormControl>
                        <Input placeholder="2023" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 고객 정보 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">고객 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerInfo.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
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
                      <FormLabel>연락처</FormLabel>
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
                        <Input placeholder="example@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 정비 상세 정보 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">정비 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>정비 내용</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="정비가 필요한 내용을 상세히 기술해주세요."
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>추가 참고사항</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="추가로 참고할 사항이 있다면 입력해주세요."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>우선순위</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="우선순위 선택" />
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정비 유형</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="정비 유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="regular">정기 점검</SelectItem>
                          <SelectItem value="repair">일반 수리</SelectItem>
                          <SelectItem value="warranty">보증 수리</SelectItem>
                          <SelectItem value="recall">리콜</SelectItem>
                          <SelectItem value="custom">기타</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>예정일</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ko })
                              ) : (
                                <span>날짜 선택</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>예상 작업 시간 (분)</FormLabel>
                      <FormControl>
                        <Input placeholder="60" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 비용 정보 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">비용 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cost.labor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>공임비 (원)</FormLabel>
                      <FormControl>
                        <Input placeholder="50000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cost.parts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>부품비 (원)</FormLabel>
                      <FormControl>
                        <Input placeholder="30000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">총 견적 금액</span>
                      <span className="text-lg font-bold">
                        {new Intl.NumberFormat('ko-KR').format(
                          (typeof form.watch('cost.labor') === 'string'
                            ? parseInt(String(form.watch('cost.labor') || '0'), 10)
                            : form.watch('cost.labor') || 0) +
                            (typeof form.watch('cost.parts') === 'string'
                              ? parseInt(String(form.watch('cost.parts') || '0'), 10)
                              : form.watch('cost.parts') || 0)
                        )}
                        원
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '처리 중...' : '등록하기'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
