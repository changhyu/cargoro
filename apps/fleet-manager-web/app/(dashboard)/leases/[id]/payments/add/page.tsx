'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
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
  cn,
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@cargoro/ui';

import { leaseService } from '../../../../../services/api';

// 폼 스키마 정의
const formSchema = z.object({
  amount: z.coerce.number().min(1, { message: '금액은 1 이상이어야 합니다.' }),
  paymentDate: z.date({ required_error: '결제일을 선택해주세요.' }),
  paymentType: z.string({ required_error: '결제 유형을 선택해주세요.' }),
  status: z.string({ required_error: '상태를 선택해주세요.' }),
  referenceNumber: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddPaymentPageProps {
  params: {
    id: string;
  };
}

export default function AddPaymentPage({ params }: AddPaymentPageProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // 폼 초기화
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date(),
      paymentType: 'monthly',
      status: 'completed',
      referenceNumber: '',
      description: '',
      notes: '',
    },
  });

  // 폼 제출 처리
  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const paymentData = {
        amount: values.amount,
        paymentDate: values.paymentDate.toISOString().split('T')[0],
        paymentType: values.paymentType,
        status: values.status,
        referenceNumber: values.referenceNumber,
        description: values.description,
        notes: values.notes,
      };

      // 구현된 API 메서드 사용
      await leaseService.addLeasePayment(params.id, paymentData);
      router.push(`/dashboard/leases/${params.id}`);
    } catch (error) {
      // 에러는 alert로만 표시
      alert('결제 내역 추가 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">결제 내역 추가</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/leases/${params.id}`)}
          disabled={submitting}
        >
          취소
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>결제 정보 입력</CardTitle>
          <CardDescription>결제 내역 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 결제 기본 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">기본 정보</h3>
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>결제 금액 (원)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" step="10000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>결제 유형</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="결제 유형을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">월 납부</SelectItem>
                            <SelectItem value="deposit">보증금</SelectItem>
                            <SelectItem value="maintenance">유지보수 비용</SelectItem>
                            <SelectItem value="insurance">보험료</SelectItem>
                            <SelectItem value="tax">세금</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
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
                        <FormLabel>결제 상태</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="결제 상태를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">대기중</SelectItem>
                            <SelectItem value="completed">완료</SelectItem>
                            <SelectItem value="failed">실패</SelectItem>
                            <SelectItem value="refunded">환불됨</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 결제 상세 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">상세 정보</h3>
                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>결제일</FormLabel>
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
                                  <span>결제일 선택</span>
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
                    name="referenceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>참조 번호</FormLabel>
                        <FormControl>
                          <Input placeholder="거래 참조 번호를 입력하세요" {...field} />
                        </FormControl>
                        <FormDescription>영수증 번호 또는 거래 참조 번호</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>설명</FormLabel>
                        <FormControl>
                          <Input placeholder="결제 내용을 간략히 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 비고 */}
                <div className="space-y-4 md:col-span-2">
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
                  {submitting ? '저장 중...' : '결제 내역 추가'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
