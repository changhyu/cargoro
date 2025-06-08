'use client';

import React, { useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePayment } from '../hooks';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PaymentSuccessProps {
  onSuccess?: (paymentKey: string, orderId: string) => void;
}

export function PaymentSuccess({ onSuccess }: PaymentSuccessProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmPayment } = usePayment();

  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = React.useState<string | null>(null);

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (paymentKey && orderId && amount) {
      handlePaymentConfirmation();
    } else {
      setStatus('error');
      setError('결제 정보가 누락되었습니다.');
    }
  }, [paymentKey, orderId, amount]);

  const handlePaymentConfirmation = async () => {
    try {
      const response = await confirmPayment(paymentKey!, orderId!, parseInt(amount!));

      setStatus('success');
      onSuccess?.(response.paymentKey, response.orderId);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || '결제 승인에 실패했습니다.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
              <CardTitle>결제 처리중...</CardTitle>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <CardTitle className="text-green-600">결제 완료!</CardTitle>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <CardTitle className="text-destructive">결제 실패</CardTitle>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          {status === 'loading' && (
            <p className="text-muted-foreground">결제를 확인하고 있습니다. 잠시만 기다려주세요.</p>
          )}

          {status === 'success' && (
            <>
              <p className="text-muted-foreground">결제가 성공적으로 완료되었습니다.</p>
              <div className="space-y-2 text-sm">
                <p>주문번호: {orderId}</p>
                <p>결제금액: {parseInt(amount!).toLocaleString()}원</p>
              </div>
              <Button className="w-full" onClick={() => router.push('/orders')}>
                주문 내역 보기
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <p className="text-muted-foreground">{error}</p>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => router.push('/payment')}>
                  다시 시도하기
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
                  홈으로 가기
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
