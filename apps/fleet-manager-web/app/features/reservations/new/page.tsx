'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';
import { Calendar as CalendarIcon, Car, User, MapPin, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Button,
  Calendar,
  Card,
  CardContent,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@cargoro/ui';

import { cn } from '@/lib/utils';

import { useRentalStore } from '../../../state/rental-store';

const reservationFormSchema = z.object({
  customerId: z.string().min(1, '고객을 선택해주세요'),
  vehicleId: z.string().min(1, '차량을 선택해주세요'),
  reservationType: z.enum(['RENTAL', 'LEASE_CONSULTATION']),
  pickupDate: z.date({
    required_error: '픽업 날짜를 선택해주세요',
  }),
  pickupTime: z.string().min(1, '픽업 시간을 입력해주세요'),
  pickupLocation: z.string().min(1, '픽업 장소를 입력해주세요'),
  returnDate: z.date().optional(),
  returnTime: z.string().optional(),
  returnLocation: z.string().optional(),
  notes: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationFormSchema>;

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
];

export default function NewReservationPage(): React.ReactElement {
  const router = useRouter();
  const { createReservation, customers, availableVehicles } = useRentalStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      reservationType: 'RENTAL',
      pickupTime: '10:00',
    },
  });

  const watchReservationType = form.watch('reservationType');
  const watchVehicleId = form.watch('vehicleId');

  const selectedVehicle = availableVehicles.find(v => v.id === watchVehicleId);

  const onSubmit = async (data: ReservationFormValues): Promise<void> => {
    setIsLoading(true);
    try {
      // 예상 비용 계산 (간단한 예시)
      const days =
        data.returnDate && data.pickupDate
          ? Math.ceil(
              (data.returnDate.getTime() - data.pickupDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          : 1;

      const estimatedCost = days * 50000; // 기본 일일 요금

      await createReservation({
        ...data,
        status: 'pending',
        estimatedCost,
      });

      router.push('/features/reservations');
    } catch (_error) {
      // Failed to create reservation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 예약 등록</h1>
        <p className="mt-2 text-gray-600">차량 예약 정보를 입력하세요</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* 왼쪽: 예약 정보 입력 */}
            <div className="space-y-6 lg:col-span-2">
              {/* 예약 유형 */}
              <Card>
                <CardHeader>
                  <CardTitle>예약 유형</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="reservationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>예약 목적</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="RENTAL">렌탈 예약</SelectItem>
                            <SelectItem value="LEASE_CONSULTATION">리스 상담 예약</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>렌탈 예약 또는 리스 상담을 선택하세요</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

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
                                <div>
                                  <div>{customer.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {customer.phone} •{' '}
                                    {customer.type === 'INDIVIDUAL' ? '개인' : '법인'}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>등록된 고객 목록에서 선택하세요</FormDescription>
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
                    차량 선택
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>예약 차량</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="차량을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableVehicles.map(vehicle => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                <div>
                                  <div>
                                    {vehicle.make} {vehicle.model}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {vehicle.registrationNumber} • {vehicle.category} •{' '}
                                    {vehicle.year}년식
                                  </div>
                                </div>
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

              {/* 픽업 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>픽업 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pickupDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>픽업 날짜</FormLabel>
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
                      name="pickupTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>픽업 시간</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>
                                  {time}
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
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>픽업 장소</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="예: 강남점, 고객 주소 등"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 반납 정보 (렌탈 예약일 경우만) */}
              {watchReservationType === 'RENTAL' && (
                <Card>
                  <CardHeader>
                    <CardTitle>반납 정보 (선택)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="returnDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>반납 예정일</FormLabel>
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
                                  disabled={date =>
                                    date <= (form.watch('pickupDate') || new Date())
                                  }
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
                        name="returnTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>반납 시간</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="시간 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeSlots.map(time => (
                                  <SelectItem key={time} value={time}>
                                    {time}
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
                      name="returnLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>반납 장소</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="예: 강남점, 공항 등"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* 추가 메모 */}
              <Card>
                <CardHeader>
                  <CardTitle>추가 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>메모</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="특별 요청사항이나 메모를 입력하세요"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          고객 요청사항이나 특별 지시사항을 기록하세요
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 오른쪽: 예약 요약 */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>예약 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedVehicle && (
                    <div className="space-y-2">
                      <h4 className="font-medium">선택된 차량</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          {selectedVehicle.make} {selectedVehicle.model}
                        </p>
                        <p className="text-gray-500">
                          {selectedVehicle.year}년식 • {selectedVehicle.color}
                        </p>
                        <p className="text-gray-500">
                          {selectedVehicle.category} • {selectedVehicle.fuelType}
                        </p>
                      </div>
                    </div>
                  )}

                  {form.watch('pickupDate') && (
                    <div className="space-y-2">
                      <h4 className="font-medium">픽업 정보</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {format(form.watch('pickupDate'), 'yyyy년 MM월 dd일', { locale: ko })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {form.watch('pickupTime')}
                        </div>
                        {form.watch('pickupLocation') && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {form.watch('pickupLocation')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {form.watch('returnDate') && (
                    <div className="space-y-2">
                      <h4 className="font-medium">반납 정보</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {form.watch('returnDate')
                            ? format(form.watch('returnDate')!, 'yyyy년 MM월 dd일', { locale: ko })
                            : ''}
                        </div>
                        {form.watch('returnTime') && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {form.watch('returnTime')}
                          </div>
                        )}
                        {form.watch('returnLocation') && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {form.watch('returnLocation')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? '예약 등록 중...' : '예약 등록'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => router.push('/features/reservations')}
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
