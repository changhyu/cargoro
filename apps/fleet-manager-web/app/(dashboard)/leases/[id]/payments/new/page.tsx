'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useToast,
  Label,
} from '@cargoro/ui';

import { CreatePaymentDto, leaseService } from '../../../../../services/api';

interface PaymentFormProps {
  params: {
    id: string;
  };
}

export default function AddPaymentPage({ params }: PaymentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [payment, setPayment] = useState<Omit<CreatePaymentDto, 'contractId'>>({
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentType: '월 납입금',
    status: 'completed', // 기본값으로 completed 설정
    referenceNumber: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPayment(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPayment(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // CreatePaymentDto에는 contractId가 포함되지 않음
      await leaseService.addLeasePayment(params.id, payment);

      toast({
        title: '결제 정보 추가 완료',
        description: '결제 정보가 성공적으로 추가되었습니다.',
        variant: 'default',
      });

      // 계약 상세 페이지로 돌아가기
      router.push(`/dashboard/leases/${params.id}?tab=payments`);
    } catch (error) {
      toast({
        title: '결제 정보 추가 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive',
      });
      // 에러는 toast로만 표시
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">결제 정보 추가</h1>
        <Button variant="outline" onClick={() => router.push(`/dashboard/leases/${params.id}`)}>
          취소
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>결제 정보 입력</CardTitle>
          <CardDescription>계약에 새로운 결제 정보를 추가합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">결제일 *</Label>
                <Input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  value={payment.paymentDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">결제 금액 *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={payment.amount}
                  onChange={handleChange}
                  min={0}
                  step={1000}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentType">결제 유형 *</Label>
                <Select
                  value={payment.paymentType}
                  onValueChange={value => handleSelectChange('paymentType', value)}
                >
                  <SelectTrigger id="paymentType">
                    <SelectValue placeholder="결제 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="월 납입금">월 납입금</SelectItem>
                    <SelectItem value="보증금">보증금</SelectItem>
                    <SelectItem value="선급금">선급금</SelectItem>
                    <SelectItem value="위약금">위약금</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">참조번호</Label>
                <Input
                  id="referenceNumber"
                  name="referenceNumber"
                  value={payment.referenceNumber}
                  onChange={handleChange}
                  placeholder="결제 참조 번호 (선택사항)"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">비고</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={payment.notes}
                  onChange={handleChange}
                  placeholder="추가 정보 (선택사항)"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/leases/${params.id}`)}
                disabled={loading}
              >
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '처리중...' : '결제 정보 추가'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
