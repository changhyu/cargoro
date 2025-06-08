'use client';

import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';

interface PaymentFailProps {
  onRetry?: () => void;
}

export function PaymentFail({ onRetry }: PaymentFailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const getErrorMessage = (code: string | null): string => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '결제가 취소되었습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었습니다.';
      case 'INVALID_CARD_COMPANY':
        return '지원하지 않는 카드입니다.';
      case 'EXCEED_MAX_AMOUNT':
        return '결제 한도를 초과했습니다.';
      case 'BELOW_MIN_AMOUNT':
        return '최소 결제 금액보다 적습니다.';
      default:
        return message || '결제 처리 중 오류가 발생했습니다.';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <CardTitle className="text-destructive">결제 실패</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">{getErrorMessage(code)}</p>

          {orderId && <p className="text-sm text-muted-foreground">주문번호: {orderId}</p>}

          {code && <p className="text-xs text-muted-foreground">오류 코드: {code}</p>}

          <div className="space-y-2 pt-4">
            <Button
              className="w-full"
              onClick={() => {
                if (onRetry) {
                  onRetry();
                } else {
                  router.back();
                }
              }}
            >
              다시 시도하기
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              홈으로 가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
