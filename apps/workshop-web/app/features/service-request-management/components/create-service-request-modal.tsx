/**
 * 정비 서비스 요청 생성 모달 컴포넌트
 */
'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@cargoro/ui';
import { useCreateServiceRequest } from '../hooks/use-service-request-api';

// 서비스 요청 생성 폼 스키마
const createServiceRequestSchema = z.object({
  customer_id: z.string().min(1, '고객 ID를 입력해주세요.'),
  vehicle_id: z.string().min(1, '차량 ID를 입력해주세요.'),
  title: z.string().min(5, '제목은 최소 5자 이상이어야 합니다.'),
  description: z.string().min(10, '설명은 최소 10자 이상이어야 합니다.'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  requested_date: z.string().optional(),
});

type CreateServiceRequestFormValues = z.infer<typeof createServiceRequestSchema>;

type CreateServiceRequestModalProps = {
  onSuccess?: () => void;
};

export function CreateServiceRequestModal({ onSuccess }: CreateServiceRequestModalProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createServiceRequest, isPending } = useCreateServiceRequest();

  const form = useForm({
    resolver: zodResolver(createServiceRequestSchema),
    defaultValues: {
      customer_id: '',
      vehicle_id: '',
      title: '',
      description: '',
      priority: 'medium' as const,
      requested_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: CreateServiceRequestFormValues) => {
    const requestData = {
      ...data,
      requested_date: data.requested_date || new Date().toISOString().split('T')[0],
    } as {
      title: string;
      description: string;
      customer_id: string;
      vehicle_id: string;
      priority: 'high' | 'low' | 'medium' | 'urgent';
      requested_date: string;
    };
    createServiceRequest(requestData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>새 서비스 요청</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 서비스 요청 등록</DialogTitle>
          <DialogDescription>
            새로운 정비 서비스 요청을 등록합니다. 필수 항목을 모두 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고객 ID</FormLabel>
                  <FormControl>
                    <Input placeholder="고객 ID를 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>차량 ID</FormLabel>
                  <FormControl>
                    <Input placeholder="차량 ID를 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="서비스 요청 제목을 입력하세요" {...field} />
                  </FormControl>
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
                    <Textarea
                      placeholder="서비스 요청에 대한 상세 설명을 입력하세요"
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우선순위</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="우선순위를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">낮음</SelectItem>
                      <SelectItem value="medium">중간</SelectItem>
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
              name="requested_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>요청 날짜</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '등록 중...' : '등록하기'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
