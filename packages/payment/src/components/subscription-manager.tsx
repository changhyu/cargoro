'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Textarea,
} from '@cargoro/ui';
import { useSubscription } from '../hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@cargoro/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui';
import {
  Crown,
  Check,
  // X,
  // Calendar,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { SubscriptionPlan } from '../types';
import { formatNumber } from '../utils';
import { usePaymentMethods } from '../hooks';

interface SubscriptionManagerProps {
  customerId: string;
}

export function SubscriptionManager({ customerId }: SubscriptionManagerProps) {
  const {
    activeSubscription,
    availablePlans,
    isLoading,
    fetchSubscriptions,
    fetchAvailablePlans,
    subscribeToPlan,
    cancelSubscription,
  } = useSubscription();

  const { paymentMethods, defaultPaymentMethodId } = usePaymentMethods();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchSubscriptions(customerId);
    fetchAvailablePlans();
  }, [customerId, fetchSubscriptions, fetchAvailablePlans]);

  useEffect(() => {
    if (defaultPaymentMethodId) {
      setSelectedMethodId(defaultPaymentMethodId);
    }
  }, [defaultPaymentMethodId]);

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedMethodId) return;

    try {
      await subscribeToPlan(selectedPlan.id, customerId, selectedMethodId);
      setIsSubscribeOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('구독 신청 실패:', error);
    }
  };

  const handleCancel = async () => {
    if (!activeSubscription || !cancelReason) return;

    try {
      await cancelSubscription(activeSubscription.id, cancelReason);
      setIsCancelOpen(false);
      setCancelReason('');
    } catch (error) {
      console.error('구독 취소 실패:', error);
    }
  };

  const getDaysRemaining = () => {
    if (!activeSubscription) return 0;
    return differenceInDays(new Date(activeSubscription.currentPeriodEnd), new Date());
  };

  const getProgressPercentage = () => {
    if (!activeSubscription) return 0;
    const totalDays = differenceInDays(
      new Date(activeSubscription.currentPeriodEnd),
      new Date(activeSubscription.currentPeriodStart)
    );
    const elapsedDays = differenceInDays(
      new Date(),
      new Date(activeSubscription.currentPeriodStart)
    );
    return (elapsedDays / totalDays) * 100;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 현재 구독 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>구독 관리</CardTitle>
          <CardDescription>현재 구독 상태와 플랜을 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{activeSubscription.planName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeSubscription.billingCycle === 'MONTHLY' ? '월간' : '연간'} 구독
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  활성
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">다음 결제일</span>
                  <span className="font-medium">
                    {format(new Date(activeSubscription.nextBillingDate!), 'PPP', { locale: ko })}
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
                <p className="text-right text-xs text-muted-foreground">
                  {getDaysRemaining()}일 남음
                </p>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">월 결제 금액</p>
                  <p className="text-2xl font-bold">{formatNumber(activeSubscription.amount)}원</p>
                </div>

                <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-destructive">
                      구독 취소
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>구독을 취소하시겠습니까?</DialogTitle>
                      <DialogDescription>
                        구독을 취소하면 현재 결제 주기가 끝날 때까지 서비스를 이용할 수 있습니다.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">취소 사유</label>
                        <Textarea
                          placeholder="구독 취소 사유를 입력해주세요"
                          value={cancelReason}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setCancelReason(e.target.value)
                          }
                        />
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm">
                          <strong>서비스 이용 종료일:</strong>{' '}
                          {format(new Date(activeSubscription.currentPeriodEnd), 'PPP', {
                            locale: ko,
                          })}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
                        계속 구독
                      </Button>
                      <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason}>
                        구독 취소
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Crown className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold">구독중인 플랜이 없습니다</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                프리미엄 기능을 이용하려면 구독을 시작하세요
              </p>
              <Dialog open={isSubscribeOpen} onOpenChange={setIsSubscribeOpen}>
                <DialogTrigger asChild>
                  <Button>구독 시작하기</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>구독 플랜 선택</DialogTitle>
                    <DialogDescription>비즈니스에 맞는 플랜을 선택하세요</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    {availablePlans.map(plan => (
                      <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all ${
                          selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="text-lg font-semibold">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground">{plan.description}</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">
                                  {formatNumber(plan.amount)}
                                </span>
                                <span className="text-muted-foreground">
                                  원/{plan.interval === 'MONTHLY' ? '월' : '년'}
                                </span>
                              </div>
                            </div>
                            {selectedPlan?.id === plan.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>

                          <div className="mt-4 space-y-2">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-600" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedPlan && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">결제 수단</label>
                        <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                          <SelectTrigger>
                            <SelectValue placeholder="결제 수단을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map(method => (
                              <SelectItem key={method.id} value={method.id}>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  {method.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <p>구독은 자동으로 갱신되며, 언제든지 취소할 수 있습니다.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSubscribeOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSubscribe} disabled={!selectedPlan || !selectedMethodId}>
                      구독 시작
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 구독 플랜 비교 */}
      {!activeSubscription && availablePlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>플랜 비교</CardTitle>
            <CardDescription>각 플랜의 기능을 비교해보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {availablePlans.map(plan => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold">
                      {formatNumber(plan.amount)}원
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.interval === 'MONTHLY' ? '월' : '년'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
