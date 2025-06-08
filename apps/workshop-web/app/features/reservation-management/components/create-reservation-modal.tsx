'use client';

/**
 * 예약 생성 모달 컴포넌트
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@cargoro/ui';
import { Button } from '@cargoro/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@cargoro/ui';
import { Input } from '@cargoro/ui';
import { Textarea } from '@cargoro/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui';
import { useCreateReservation } from '../hooks/use-reservation-api';
import { ServiceTypeSchema } from '@cargoro/types/schema/reservation';

// 예약 생성 폼 스키마
const createReservationSchema = z.object({
  customer_id: z.string().min(1, '고객 ID를 입력해주세요.'),
  vehicle_id: z.string().min(1, '차량 ID를 입력해주세요.'),
  service_type: ServiceTypeSchema,
  date: z.string().min(1, '예약 날짜를 선택해주세요.'),
  notes: z.string().optional(),
});

type CreateReservationFormValues = z.infer<typeof createReservationSchema>;

type CreateReservationModalProps = {
  onSuccess?: () => void;
};

export function CreateReservationModal({ onSuccess }: CreateReservationModalProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createReservation, isPending } = useCreateReservation();

  const form = useForm({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      customer_id: '',
      vehicle_id: '',
      service_type: 'regular' as const,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    } as CreateReservationFormValues,
  });

  const onSubmit = (data: CreateReservationFormValues) => {
    createReservation(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        if (onSuccess) onSuccess();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>새 예약 등록</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 예약 등록</DialogTitle>
          <DialogDescription>
            새로운 예약을 등록합니다. 필수 항목을 모두 입력해주세요.
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
              name="service_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>서비스 유형</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="서비스 유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="regular">정기 점검</SelectItem>
                      <SelectItem value="repair">수리</SelectItem>
                      <SelectItem value="emergency">긴급 수리</SelectItem>
                      <SelectItem value="inspection">검사</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>예약 날짜</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Textarea placeholder="추가 정보를 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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
