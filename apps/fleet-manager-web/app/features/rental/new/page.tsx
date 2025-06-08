'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon, Car, User, CreditCard, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const rentalFormSchema = z
  .object({
    customerId: z.string().min(1, '고객을 선택해주세요'),
    vehicleId: z.string().min(1, '차량을 선택해주세요'),
    startDate: z.date({
      required_error: '시작일을 선택해주세요',
    }),
    endDate: z.date({
      required_error: '종료일을 선택해주세요',
    }),
    dailyRate: z.number().min(1, '일일 대여료를 입력해주세요'),
    deposit: z.number().min(0, '보증금을 입력해주세요'),
    additionalOptions: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })
  .refine(data => data.endDate > data.startDate, {
    message: '종료일은 시작일보다 늦어야 합니다',
    path: ['endDate'],
  });

type RentalFormValues = z.infer<typeof rentalFormSchema>;

// 더미 데이터
const customers = [
  { id: '1', name: '김철수', type: 'INDIVIDUAL' },
  { id: '2', name: '(주)테크솔루션', type: 'CORPORATE' },
  { id: '3', name: '이영희', type: 'INDIVIDUAL' },
];

const vehicles = [
  { id: '1', name: '소나타 (12가 3456)', type: 'SEDAN', available: true },
  { id: '2', name: '싼타페 (34나 5678)', type: 'SUV', available: true },
  { id: '3', name: '카니발 (56다 7890)', type: 'VAN', available: false },
];

const additionalOptionsList = [
  { id: 'insurance', name: '자차보험', price: 10000, unit: 'DAY' },
  { id: 'gps', name: 'GPS 네비게이션', price: 5000, unit: 'DAY' },
  { id: 'childseat', name: '유아용 카시트', price: 10000, unit: 'ONCE' },
  { id: 'etccard', name: 'ETC 카드', price: 0, unit: 'ONCE' },
];

export default function NewRentalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: {
      customerId: '',
      vehicleId: '',
      dailyRate: 50000,
      deposit: 300000,
      additionalOptions: [],
      notes: '',
    },
  });

  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');
  const watchDailyRate = form.watch('dailyRate');

  const calculateTotalDays = () => {
    if (!watchStartDate || !watchEndDate) return 0;
    const diffTime = Math.abs(watchEndDate.getTime() - watchStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calculateTotalAmount = () => {
    const days = calculateTotalDays();
    const baseAmount = watchDailyRate * days;

    const additionalAmount = additionalOptionsList
      .filter(opt => form.watch('additionalOptions')?.includes(opt.id))
      .reduce((sum, opt) => {
        return sum + (opt.unit === 'DAY' ? opt.price * days : opt.price);
      }, 0);

    return baseAmount + additionalAmount;
  };

  const onSubmit = async (data: RentalFormValues) => {
    setIsLoading(true);
    try {
      // 실제로는 API 호출
      // API 호출 로직 - 실제로는 서버에 데이터 전송

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: '렌탈 계약 생성 완료',
        description: '새로운 렌탈 계약이 성공적으로 생성되었습니다.',
      });

      router.push('/features/rental');
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '렌탈 계약 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 렌탈 계약</h1>
        <p className="mt-2 text-gray-600">신규 렌탈 계약을 생성합니다</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* 고객 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    고객 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                <CardContent>
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
                            {vehicles
                              .filter(v => v.available)
                              .map(vehicle => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  {vehicle.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>현재 대여 가능한 차량만 표시됩니다</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 대여 기간 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    대여 기간
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                                disabled={date => date < (watchStartDate || new Date())}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchStartDate && watchEndDate && (
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-blue-700">
                        총 대여 기간: <strong>{calculateTotalDays()}일</strong>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 요금 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    요금 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dailyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>일일 대여료</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50000"
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
                      name="deposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>보증금</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="300000"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalOptions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>추가 옵션</FormLabel>
                          <FormDescription>필요한 추가 옵션을 선택하세요</FormDescription>
                        </div>
                        {additionalOptionsList.map(option => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="additionalOptions"
                            render={({ field }) => (
                              <FormItem
                                key={option.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={checked => {
                                      return checked
                                        ? field.onChange([...(field.value || []), option.id])
                                        : field.onChange(
                                            field.value?.filter(value => value !== option.id)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-normal">
                                    {option.name} -{' '}
                                    {new Intl.NumberFormat('ko-KR', {
                                      style: 'currency',
                                      currency: 'KRW',
                                    }).format(option.price)}
                                    {option.unit === 'DAY' ? '/일' : ''}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 추가 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    추가 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>비고</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="특별 요청사항이나 메모를 입력하세요"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 요약 정보 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>계약 요약</CardTitle>
                  <CardDescription>렌탈 계약 내용을 확인하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">대여 기간</span>
                      <span className="font-medium">{calculateTotalDays()}일</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">일일 대여료</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(watchDailyRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">기본 대여료</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(watchDailyRate * calculateTotalDays())}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      {additionalOptionsList
                        .filter(opt => form.watch('additionalOptions')?.includes(opt.id))
                        .map(opt => (
                          <div key={opt.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{opt.name}</span>
                            <span>
                              {new Intl.NumberFormat('ko-KR', {
                                style: 'currency',
                                currency: 'KRW',
                              }).format(
                                opt.unit === 'DAY' ? opt.price * calculateTotalDays() : opt.price
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">총 대여료</span>
                      <span className="text-xl font-bold">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(calculateTotalAmount())}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm text-gray-600">보증금</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(form.watch('deposit'))}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? '계약 생성 중...' : '렌탈 계약 생성'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => router.push('/features/rental')}
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
