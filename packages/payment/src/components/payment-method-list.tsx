'use client';

import React, { useEffect } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cargoro/ui';
import { usePaymentMethods } from '../hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@cargoro/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@cargoro/ui';
import { CreditCard, Plus, Trash2, Star, Building2, Smartphone } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodListProps {
  customerId: string;
}

// const getCardIcon = (_issuer: string) => {
//   // 카드사별 아이콘 매핑 (실제로는 카드사 로고 이미지 사용)
//   return CreditCard;
// };

const getMethodIcon = (type: PaymentMethod['type']) => {
  switch (type) {
    case 'CARD':
      return CreditCard;
    case 'BANK_TRANSFER':
      return Building2;
    case 'MOBILE':
      return Smartphone;
    default:
      return CreditCard;
  }
};

export function PaymentMethodList({ customerId }: PaymentMethodListProps) {
  const {
    paymentMethods,
    defaultPaymentMethodId,
    fetchPaymentMethods,
    registerCard,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  } = usePaymentMethods();

  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  // const [deletingId, setDeletingId] = React.useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods(customerId);
  }, [customerId, fetchPaymentMethods]);

  const handleRegisterCard = async () => {
    try {
      await registerCard(customerId);
      setIsRegisterOpen(false);
      // 토스페이먼츠 빌링 등록 페이지로 리다이렉트됨
    } catch (error) {
      console.error('카드 등록 실패:', error);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    try {
      await deletePaymentMethod(methodId);
      // setDeletingId(null);
    } catch (error) {
      console.error('결제 수단 삭제 실패:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>결제 수단 관리</CardTitle>
            <CardDescription>등록된 결제 수단을 관리하세요</CardDescription>
          </div>
          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                결제 수단 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>결제 수단 추가</DialogTitle>
                <DialogDescription>
                  새로운 결제 수단을 등록합니다. 토스페이먼츠 결제 창으로 이동합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Button className="w-full" onClick={handleRegisterCard}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  카드 등록하기
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  * 카드 정보는 토스페이먼츠에 안전하게 저장됩니다
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <CreditCard className="mb-4 h-12 w-12" />
            <p>등록된 결제 수단이 없습니다</p>
            <p className="text-sm">결제 수단을 추가해주세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map(method => {
              const Icon = getMethodIcon(method.type);
              const isDefault = method.id === defaultPaymentMethodId;

              return (
                <div
                  key={method.id}
                  className={`
                    flex items-center justify-between rounded-lg border p-4
                    ${isDefault ? 'border-primary bg-primary/5' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{method.name}</p>
                        {isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="mr-1 h-3 w-3" />
                            기본
                          </Badge>
                        )}
                      </div>
                      {method.details && 'cardNumber' in method.details && (
                        <p className="text-sm text-muted-foreground">{method.details.cardNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultPaymentMethod(method.id)}
                      >
                        기본으로 설정
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>결제 수단 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 결제 수단을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMethod(method.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
