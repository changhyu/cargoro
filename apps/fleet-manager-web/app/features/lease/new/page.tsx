'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon, Car, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { cn } from '@/app/lib/utils';
import { useRentalStore } from '@/app/state/rental-store';

const leaseFormSchema = z.object({
  customerId: z.string().min(1, '고객을 선택해주세요'),
  vehicleId: z.string().min(1, '차량을 선택해주세요'),
  leaseType: z.enum(['OPERATING', 'FINANCIAL']),
  startDate: z.date({
    required_error: '시작일을 선택해주세요',
  }),
  endDate: z.date({
    required_error: '종료일을 선택해주세요',
  }),
  monthlyPayment: z.number().min(1, '월 납입금을 입력해주세요'),
  downPayment: z.number().min(0, '선납금을 입력해주세요'),
  residualValue: z.number().min(0, '잔존가치를 입력해주세요'),
  mileageLimit: z.number().min(0, '주행거리 제한을 입력해주세요'),
  excessMileageRate: z.number().min(0, '초과 주행 요금을 입력해주세요'),
  maintenanceIncluded: z.boolean(),
  insuranceIncluded: z.boolean(),
});

type LeaseFormValues = z.infer<typeof leaseFormSchema>;

export default function NewLeaseContractPage() {
  const router = useRouter();
  const { createLeaseContract, customers, availableVehicles } = useRentalStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseFormSchema),
    defaultValues: {
      leaseType: 'OPERATING',
      monthlyPayment: 0,
      downPayment: 0,
      residualValue: 0,
      mileageLimit: 20000,
      excessMileageRate: 100,
      maintenanceIncluded: false,
      insuranceIncluded: false,
    },
  });

  const onSubmit = async (data: LeaseFormValues) => {
    setIsLoading(true);
    try {
      await createLeaseContract({
        ...data,
        status: 'ACTIVE',
        contractNumber: `LEASE-${Date.now()}`,
      });

      router.push('/features/contracts?tab=lease');
    } catch (_error) {
      // 오류 처리는 UI로 사용자에게 표시됨
    } finally {
      setIsLoading(false);
    }
  };

  const watchLeaseType = form.watch('leaseType');
  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');
  const watchMonthlyPayment = form.watch('monthlyPayment');
  const watchDownPayment = form.watch('downPayment');

  const calculateLeaseDuration = () => {
    if (!watchStartDate || !watchEndDate) return 0;
    const months = Math.ceil(
      (watchEndDate.getTime() - watchStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return months;
  };

  const calculateTotalPayment = () => {
    const months = calculateLeaseDuration();
    return watchDownPayment + watchMonthlyPayment * months;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 리스 계약 생성</h1>
        <p className="mt-2 text-gray-600">고객 정보와 차량을 선택하여 리스 계약을 생성하세요</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* 왼쪽: 계약 정보 입력 */}
            <div className="space-y-6 lg:col-span-2">
              {/* 고객 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    고객 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>고객 선택</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="고객을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map(customer => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} ({customer.type === 'INDIVIDUAL' ? '개인' : '법인'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>등록된 고객 중에서 선택하세요</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 차량 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    차량 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>차량 선택</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="차량을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableVehicles.map(vehicle => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>이용 가능한 차량 목록입니다</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 리스 계약 상세 */}
              <Card>
                <CardHeader>
                  <CardTitle>리스 계약 상세</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="leaseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>리스 유형</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="OPERATING">
                              <div>
                                <div className="font-medium">운용리스</div>
                                <div className="text-sm text-gray-500">
                                  차량 운용만, 소유권 이전 없음
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="FINANCIAL">
                              <div>
                                <div className="font-medium">금융리스</div>
                                <div className="text-sm text-gray-500">
                                  계약 종료 시 소유권 이전 가능
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>계약 시작일</FormLabel>
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
                                disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                          <FormLabel>계약 종료일</FormLabel>
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
                                disabled={date => date <= (watchStartDate || new Date())}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>일반적으로 36~60개월 계약</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>월 납입금</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1000000"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="downPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>선납금</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5000000"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchLeaseType === 'FINANCIAL' && (
                    <FormField
                      control={form.control}
                      name="residualValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>잔존가치</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10000000"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>계약 종료 시 차량 인수 금액</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mileageLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>연간 주행거리 제한 (km)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="20000"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excessMileageRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>초과 주행 요금 (원/km)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="maintenanceIncluded"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>정비 포함</FormLabel>
                            <FormDescription>정기 점검 및 소모품 교체 포함</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceIncluded"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>보험 포함</FormLabel>
                            <FormDescription>종합보험 및 자차보험 포함</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 오른쪽: 계약 요약 */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>계약 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">리스 유형</span>
                      <span className="font-medium">
                        {watchLeaseType === 'OPERATING' ? '운용리스' : '금융리스'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">계약 기간</span>
                      <span className="font-medium">{calculateLeaseDuration()}개월</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">월 납입금</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(watchMonthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">선납금</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(watchDownPayment)}
                      </span>
                    </div>
                    {watchLeaseType === 'FINANCIAL' && form.watch('residualValue') > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">잔존가치</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('ko-KR', {
                            style: 'currency',
                            currency: 'KRW',
                          }).format(form.watch('residualValue'))}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">총 납입 예정액</span>
                      <span className="text-xl font-bold">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(calculateTotalPayment())}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">* 잔존가치 제외</p>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>정비 포함</span>
                      <span>{form.watch('maintenanceIncluded') ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>보험 포함</span>
                      <span>{form.watch('insuranceIncluded') ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>연간 주행거리</span>
                      <span>{form.watch('mileageLimit').toLocaleString()}km</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? '계약 생성 중...' : '리스 계약 생성'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => router.push('/features/contracts')}
                    >
                      취소
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
