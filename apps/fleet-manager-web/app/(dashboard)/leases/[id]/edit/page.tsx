'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { LeaseContract, leaseService, vehicleService, Vehicle } from '../../../../services/api';

// 폼 스키마 정의
const formSchema = z.object({
  clientId: z.string({ required_error: '고객사 ID를 입력해주세요.' }),
  clientName: z.string({ required_error: '고객사명을 입력해주세요.' }),
  vehicleId: z.string({ required_error: '차량을 선택해주세요.' }),
  type: z.enum(['lease', 'rental'], { required_error: '계약 유형을 선택해주세요.' }),
  startDate: z.date({ required_error: '시작일을 선택해주세요.' }),
  endDate: z.date({ required_error: '종료일을 선택해주세요.' }),
  monthlyPrice: z.coerce.number().min(0, { message: '월 납부액은 0 이상이어야 합니다.' }),
  deposit: z.coerce.number().min(0, { message: '보증금은 0 이상이어야 합니다.' }),
  terms: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'active', 'completed', 'cancelled'], {
    required_error: '계약 상태를 선택해주세요.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditLeasePageProps {
  params: {
    id: string;
  };
}

export default function EditLeasePage({ params }: EditLeasePageProps) {
  const router = useRouter();
  const [lease, setLease] = useState<LeaseContract | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 초기화
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      clientName: '',
      vehicleId: '',
      type: 'lease',
      monthlyPrice: 0,
      deposit: 0,
      terms: '',
      notes: '',
      status: 'pending',
    },
  });

  // 계약 정보 및 차량 목록 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 계약 정보 가져오기
        const leaseData = await leaseService.getLeaseById(params.id);
        setLease(leaseData);

        // 차량 목록 가져오기
        const response = await vehicleService.getVehicles({});
        setVehicles(response.vehicles || []);

        // 폼에 데이터 설정
        form.reset({
          clientId: leaseData.clientId,
          clientName: leaseData.clientName,
          vehicleId: leaseData.vehicleId,
          type: leaseData.type as 'lease' | 'rental',
          startDate: parseISO(leaseData.startDate),
          endDate: parseISO(leaseData.endDate),
          monthlyPrice: leaseData.monthlyPrice || 0,
          deposit: leaseData.deposit || 0,
          terms: leaseData.terms || '',
          notes: leaseData.notes || '',
          status: leaseData.status as 'pending' | 'active' | 'completed' | 'cancelled',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '계약 정보를 불러오는데 실패했습니다.');
        // 에러 상태 설정으로 처리
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, form]);

  // 폼 제출 처리
  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // 날짜를 ISO 문자열로 변환
      const leaseData: Partial<LeaseContract> = {
        clientId: values.clientId,
        clientName: values.clientName,
        vehicleId: values.vehicleId,
        type: values.type,
        startDate: values.startDate.toISOString().split('T')[0],
        endDate: values.endDate.toISOString().split('T')[0],
        monthlyPrice: values.monthlyPrice,
        deposit: values.deposit,
        status: values.status,
        terms: values.terms,
        notes: values.notes,
      };

      await leaseService.updateLease(params.id, leaseData);
      router.push(`/dashboard/leases/${params.id}`);
    } catch (error) {
      // 에러는 alert로만 표시
      alert('계약 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="container mx-auto py-6">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>오류가 발생했습니다: {error || '계약 정보를 불러올 수 없습니다.'}</p>
          <Button
            onClick={() => router.push('/dashboard/leases')}
            className="mt-4"
            variant="outline"
          >
            계약 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">계약 정보 수정</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/leases/${params.id}`)}
            disabled={submitting}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (window.confirm('정말로 이 계약을 삭제하시겠습니까?')) {
                try {
                  await leaseService.deleteLease(params.id);
                  router.push('/dashboard/leases');
                } catch (error) {
                  // 에러는 alert로만 표시
                  alert('계약 삭제 중 오류가 발생했습니다.');
                }
              }
            }}
            disabled={submitting}
          >
            계약 삭제
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계약 정보 수정</CardTitle>
          <CardDescription>수정할 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 고객사 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">고객사 정보</h3>
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>고객사 ID</FormLabel>
                        <FormControl>
                          <Input placeholder="고객사 ID를 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>고객사명</FormLabel>
                        <FormControl>
                          <Input placeholder="고객사 이름을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 계약 기본 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">계약 기본 정보</h3>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>계약 유형</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="계약 유형을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lease">리스</SelectItem>
                            <SelectItem value="rental">렌트</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          리스는 장기간, 렌트는 단기간 계약에 적합합니다.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>차량</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="차량을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicles.map(vehicle => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>계약 상태</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="상태를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">대기중</SelectItem>
                            <SelectItem value="active">활성</SelectItem>
                            <SelectItem value="completed">완료</SelectItem>
                            <SelectItem value="cancelled">취소</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 계약 기간 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">계약 기간</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>시작일</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value instanceof Date ? (
                                    format(field.value, 'PPP', { locale: ko })
                                  ) : (
                                    <span>시작일 선택</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value instanceof Date ? field.value : undefined}
                                onSelect={field.onChange}
                                locale={ko}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>종료일</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value instanceof Date ? (
                                    format(field.value, 'PPP', { locale: ko })
                                  ) : (
                                    <span>종료일 선택</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value instanceof Date ? field.value : undefined}
                                onSelect={field.onChange}
                                locale={ko}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 금액 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">금액 정보</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="monthlyPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>월 납부액 (원)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="10000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>보증금 (원)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="100000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 추가 정보 */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-semibold">추가 정보</h3>
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>계약 조건</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="계약 조건을 입력하세요"
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
                        <FormLabel>비고</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="추가 정보를 입력하세요"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <CardFooter className="flex justify-end px-0">
                <Button type="submit" disabled={submitting}>
                  {submitting ? '저장 중...' : '계약 수정'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
