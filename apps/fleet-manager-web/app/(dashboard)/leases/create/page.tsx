'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
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

import { LeaseContract, leaseService, vehicleService, Vehicle } from '../../../services/api';

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
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateLeasePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [_loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    },
  });

  // 사용 가능한 차량 목록 로드
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const response = await vehicleService.getVehicles({ status: 'active' });
        setVehicles(response.vehicles || []);
      } catch (error) {
        // 에러 처리 생략
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // 폼 제출 처리
  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // 날짜를 ISO 문자열로 변환
      const leaseData: Omit<LeaseContract, 'id'> = {
        clientId: values.clientId,
        clientName: values.clientName,
        vehicleId: values.vehicleId,
        type: values.type,
        startDate: values.startDate.toISOString().split('T')[0],
        endDate: values.endDate.toISOString().split('T')[0],
        monthlyPrice: values.monthlyPrice,
        deposit: values.deposit,
        status: 'pending',
        terms: values.terms,
        notes: values.notes,
      };

      await leaseService.createLease(leaseData);
      router.push('/dashboard/leases');
    } catch (error) {
      // 에러는 alert로만 표시
      alert('계약 생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">새 리스/렌트 계약 등록</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/leases')}
          disabled={submitting}
        >
          취소
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계약 정보 입력</CardTitle>
          <CardDescription>모든 필수 항목을 입력해주세요.</CardDescription>
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
                                  {field.value ? (
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
                                selected={field.value}
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
                                  {field.value ? (
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
                                selected={field.value}
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
                  {submitting ? '저장 중...' : '계약 생성'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
