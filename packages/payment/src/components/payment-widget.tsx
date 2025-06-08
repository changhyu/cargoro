'use client';

import React, { useState } from 'react';
import {
  // Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Separator,
} from '@cargoro/ui';
import { usePayment } from '../hooks';
import { PaymentRequest } from '../types';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CircleDollarSign,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { usePaymentStore } from '../store';
import { formatNumber } from '../utils';

interface PaymentWidgetProps {
  orderId: string;
  orderName: string;
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  // onSuccess?: (paymentKey: string) => void;
  onError?: (error: Error) => void;
  metadata?: Record<string, any>;
}

type PaymentMethodType = 'card' | 'bank' | 'virtual' | 'mobile' | 'points';

const paymentMethodConfig = {
  card: {
    icon: CreditCard,
    label: '신용/체크카드',
    description: '국내 모든 카드 결제 가능',
  },
  bank: {
    icon: Building2,
    label: '계좌이체',
    description: '실시간 계좌이체',
  },
  virtual: {
    icon: Wallet,
    label: '가상계좌',
    description: '무통장 입금',
  },
  mobile: {
    icon: Smartphone,
    label: '휴대폰',
    description: '휴대폰 소액결제',
  },
  points: {
    icon: CircleDollarSign,
    label: '포인트',
    description: '보유 포인트로 결제',
  },
};

export function PaymentWidget({
  orderId,
  orderName,
  amount,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  // onSuccess,
  onError,
  metadata,
}: PaymentWidgetProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('card');
  const [usePoints, setUsePoints] = useState(false);
  const [pointAmount, setPointAmount] = useState(0);

  const { requestPayment, isLoading, error } = usePayment();
  const { userPoints } = usePaymentStore();

  const availablePoints = userPoints?.availablePoints || 0;
  const finalAmount = usePoints ? amount - pointAmount : amount;

  const handlePayment = async () => {
    try {
      const paymentRequest: PaymentRequest = {
        orderId,
        orderName,
        amount: finalAmount,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        metadata: {
          ...metadata,
          usePoints,
          pointAmount: usePoints ? pointAmount : 0,
        },
      };

      await requestPayment(paymentRequest);

      // 토스페이먼츠 SDK가 결제 페이지로 리다이렉트함
      // 성공/실패는 successUrl/failUrl에서 처리
    } catch (err) {
      console.error('결제 요청 실패:', err);
      onError?.(err as Error);
    }
  };

  const handlePointToggle = () => {
    if (!usePoints && availablePoints > 0) {
      const maxPoints = Math.min(availablePoints, amount);
      setPointAmount(maxPoints);
      setUsePoints(true);
    } else {
      setPointAmount(0);
      setUsePoints(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          결제하기
          <Shield className="h-5 w-5 text-green-600" />
        </CardTitle>
        <CardDescription>안전한 결제를 위해 토스페이먼츠를 사용합니다</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 주문 정보 */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
          <h3 className="text-sm font-medium text-muted-foreground">주문 정보</h3>
          <div className="space-y-1">
            <p className="text-sm">{orderName}</p>
            <p className="text-2xl font-bold">{formatNumber(amount)}원</p>
          </div>
        </div>

        {/* 포인트 사용 */}
        {availablePoints > 0 && (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CircleDollarSign className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">포인트 사용</p>
                  <p className="text-sm text-muted-foreground">
                    사용 가능: {formatNumber(availablePoints)}P
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {usePoints && (
                  <Input
                    type="number"
                    value={pointAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = Math.min(
                        Math.max(0, parseInt(e.target.value) || 0),
                        Math.min(availablePoints, amount)
                      );
                      setPointAmount(value);
                    }}
                    className="w-32 text-right"
                  />
                )}
                <Button
                  variant={usePoints ? 'default' : 'outline'}
                  size="sm"
                  onClick={handlePointToggle}
                >
                  {usePoints ? '사용' : '사용안함'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* 결제 수단 선택 */}
        <div>
          <h3 className="mb-4 font-medium">결제 수단 선택</h3>
          <RadioGroup
            value={selectedMethod}
            onValueChange={(value: string) => setSelectedMethod(value as PaymentMethodType)}
          >
            <div className="grid gap-3">
              {Object.entries(paymentMethodConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isDisabled = key === 'points' && availablePoints < amount;

                return (
                  <Label
                    key={key}
                    htmlFor={key}
                    className={`
                      flex cursor-pointer items-center gap-3 rounded-lg border p-4
                      transition-colors hover:bg-muted/50
                      ${selectedMethod === key ? 'border-primary bg-primary/5' : ''}
                      ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                  >
                    <RadioGroupItem value={key} id={key} disabled={isDisabled} />
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">{config.label}</p>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                  </Label>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* 최종 결제 금액 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>상품 금액</span>
            <span>{formatNumber(amount)}원</span>
          </div>
          {usePoints && pointAmount > 0 && (
            <div className="flex items-center justify-between text-sm text-orange-600">
              <span>포인트 사용</span>
              <span>-{formatNumber(pointAmount)}원</span>
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>최종 결제 금액</span>
            <span className="text-primary">{formatNumber(finalAmount)}원</span>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* 결제 버튼 */}
        <Button
          className="h-12 w-full text-lg"
          size="lg"
          onClick={handlePayment}
          disabled={isLoading || finalAmount <= 0}
        >
          {isLoading ? '처리중...' : `${formatNumber(finalAmount)}원 결제하기`}
        </Button>

        {/* 안내 문구 */}
        <p className="text-center text-xs text-muted-foreground">
          결제를 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
