'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useCreateRepair, useUpdateRepair, useRepairJob } from '../hooks/useRepairApi';
import { format } from 'date-fns';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useToast,
} from '@cargoro/ui';

// 폼 스키마 정의
const formSchema = z.object({
  vehicleMake: z.string().min(1, '제조사를 입력해주세요'),
  vehicleModel: z.string().min(1, '모델을 입력해주세요'),
  vehicleYear: z.string().min(1, '연식을 입력해주세요'),
  vehicleLicensePlate: z.string().min(1, '차량번호를 입력해주세요'),
  customerName: z.string().min(1, '고객명을 입력해주세요'),
  customerPhone: z.string().min(1, '연락처를 입력해주세요'),
  customerEmail: z.string().email('유효한 이메일을 입력해주세요'),
  description: z.string().min(1, '정비 내용을 입력해주세요'),
  estimatedCompletionDate: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'waiting_parts', 'completed', 'cancelled']),
});

type FormValues = z.infer<typeof formSchema>;

interface RepairJobFormProps {
  repairId?: string;
  onSuccess?: () => void;
}

export function RepairJobForm({ repairId, onSuccess }: RepairJobFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API 훅 사용
  const { mutateAsync: createRepair } = useCreateRepair();
  const { mutateAsync: updateRepair } = useUpdateRepair();
  const { data: repairJob, isLoading: isLoadingRepairJob } = useRepairJob(repairId);

  // 폼 초기화
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleLicensePlate: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      description: '',
      estimatedCompletionDate: '',
      status: 'pending',
    },
  });

  // 기존 데이터로 폼 초기화
  React.useEffect(() => {
    if (repairJob) {
      form.reset({
        vehicleMake: '', // API에서 vehicle 정보를 별도로 가져와야 함
        vehicleModel: '',
        vehicleYear: '',
        vehicleLicensePlate: repairJob.vehicleId || '',
        customerName: '', // API에서 customer 정보를 별도로 가져와야 함
        customerPhone: '',
        customerEmail: '',
        description: repairJob.description,
        estimatedCompletionDate: repairJob.completionTime
          ? format(new Date(repairJob.completionTime), 'yyyy-MM-dd')
          : '',
        status: repairJob.status as
          | 'pending'
          | 'in_progress'
          | 'waiting_parts'
          | 'completed'
          | 'cancelled',
      });
    }
  }, [repairJob, form]);

  // 폼 제출 처리
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const repairData = {
        vehicle_id: values.vehicleLicensePlate, // 임시로 차량번호를 vehicle_id로 사용
        repair_type: 'repair' as const,
        description: values.description,
        estimated_hours: 2, // 기본값 설정
        parts_required: false, // 기본값 설정
      };

      if (repairId) {
        // 수정
        await updateRepair({ repairId, updateData: repairData });
        toast({
          title: '정비 작업이 수정되었습니다',
          description: `정비 ID: ${repairId}`,
          variant: 'default',
        });
      } else {
        // 신규 등록
        const result = await createRepair(repairData);
        toast({
          title: '정비 작업이 등록되었습니다',
          description: `정비 ID: ${result.id}`,
          variant: 'default',
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/repair-dashboard');
      }
    } catch (error) {
      // 오류 처리
      toast({
        title: '오류 발생',
        description: '정비 작업을 저장하는 중 문제가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (repairId && isLoadingRepairJob) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>정비 작업 정보 불러오는 중...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{repairId ? '정비 작업 수정' : '새 정비 작업 등록'}</CardTitle>
        <CardDescription>
          {repairId
            ? '기존 정비 작업 정보를 수정합니다'
            : '새로운 정비 작업을 등록합니다. 모든 필수 정보를 입력해주세요.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">차량 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vehicleMake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제조사</FormLabel>
                      <FormControl>
                        <Input placeholder="현대, 기아 등" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모델</FormLabel>
                      <FormControl>
                        <Input placeholder="아반떼, K5 등" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연식</FormLabel>
                      <FormControl>
                        <Input placeholder="2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleLicensePlate"
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
              </div>

              <h3 className="text-lg font-medium">고객 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>고객명</FormLabel>
                      <FormControl>
                        <Input placeholder="홍길동" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
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
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="text-lg font-medium">정비 정보</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정비 내용</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="정비가 필요한 내용을 상세히 기술해주세요"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimatedCompletionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>예상 완료일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>정비 완료 예상일을 선택해주세요</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상태</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="상태 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">대기 중</SelectItem>
                          <SelectItem value="in_progress">진행 중</SelectItem>
                          <SelectItem value="waiting_parts">부품 대기</SelectItem>
                          <SelectItem value="completed">완료됨</SelectItem>
                          <SelectItem value="cancelled">취소됨</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <CardFooter className="flex justify-between border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {repairId ? '수정 완료' : '등록 완료'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
