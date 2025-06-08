'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { useCreatePayment } from '../hooks/use-invoices';
import type { CreatePaymentInput } from '../types';
import { CreditCard, DollarSign } from 'lucide-react';

// 결제 스키마
const paymentSchema = z.object({
  amount: z.number().min(1, '결제 금액을 입력하세요'),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'credit']),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  remainingAmount: number;
  customerName: string;
  invoiceNumber: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  invoiceId,
  remainingAmount,
  customerName,
  invoiceNumber,
}: PaymentModalProps) {
  const createPaymentMutation = useCreatePayment();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Omit<CreatePaymentInput, 'invoiceId'>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      paymentMethod: 'cash',
      transactionId: '',
      notes: '',
    },
  });

  const onSubmit = async (data: Omit<CreatePaymentInput, 'invoiceId'>) => {
    try {
      await createPaymentMutation.mutateAsync({
        invoiceId,
        ...data,
      });
      reset();
      onClose();
    } catch (error) {
      // TODO: 에러 처리 및 로깅 구현
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            결제 등록
          </DialogTitle>
          <DialogDescription>
            {customerName} - 송장번호: {invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">미결제 금액</span>
                <span className="text-xl font-bold">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">결제 금액</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                {...register('amount', { valueAsNumber: true })}
                id="amount"
                type="number"
                min="1"
                max={remainingAmount}
                className="pl-10"
              />
            </div>
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">결제 방법</Label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">현금</SelectItem>
                    <SelectItem value="card">카드</SelectItem>
                    <SelectItem value="transfer">계좌이체</SelectItem>
                    <SelectItem value="credit">외상</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && (
              <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">거래번호 (선택)</Label>
            <Input
              {...register('transactionId')}
              id="transactionId"
              placeholder="카드 승인번호 또는 이체 확인번호"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모 (선택)</Label>
            <Textarea {...register('notes')} id="notes" placeholder="결제 관련 메모" rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '결제 등록'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
