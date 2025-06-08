'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';
import { DollarSign, AlertCircle, XCircle, Clock } from 'lucide-react';

import { paymentApi } from '@/app/lib/api/payment';
import { PaymentStatus, PaymentMethod, Payment } from '@/app/types/payment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// 결제 상태별 스타일
const getStatusBadge = (status: PaymentStatus) => {
  const styles = {
    PENDING: { label: '대기중', className: 'bg-yellow-100 text-yellow-800' },
    COMPLETED: { label: '완료', className: 'bg-green-100 text-green-800' },
    FAILED: { label: '실패', className: 'bg-red-100 text-red-800' },
    CANCELLED: { label: '취소', className: 'bg-gray-100 text-gray-800' },
    REFUNDED: { label: '환불', className: 'bg-purple-100 text-purple-800' },
  };

  const style = styles[status] || styles.PENDING;
  return <Badge className={style.className}>{style.label}</Badge>;
};

// 결제 수단 라벨
const getPaymentMethodLabel = (method: PaymentMethod) => {
  const labels = {
    CARD: '신용카드',
    BANK_TRANSFER: '계좌이체',
    CASH: '현금',
    CORPORATE_CARD: '법인카드',
  };
  return labels[method] || method;
};

export default function PaymentsPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CARD
  );

  // 결제 통계 조회
  const { data: statistics } = useQuery({
    queryKey: ['payment-statistics'],
    queryFn: () => paymentApi.getStatistics(),
  });

  // 결제 목록 조회
  const { data: payments, refetch: refetchPayments } = useQuery({
    queryKey: ['payments', selectedTab],
    queryFn: () => {
      const params: Record<string, unknown> = {};
      if (selectedTab !== 'all') {
        params.status = selectedTab.toUpperCase();
      }
      return paymentApi.getPayments(params);
    },
  });

  // 연체 결제 조회
  const { data: overduePayments } = useQuery({
    queryKey: ['overdue-payments'],
    queryFn: () => paymentApi.getOverduePayments(),
  });

  // 결제 처리
  const handleProcessPayment = async () => {
    if (!selectedPayment) return;

    try {
      await paymentApi.processPayment(selectedPayment!.id, {
        payment_method: selectedPaymentMethod,
      });

      toast({
        title: '결제 완료',
        description: '결제가 성공적으로 처리되었습니다.',
      });

      setProcessDialogOpen(false);
      refetchPayments();
    } catch (_error) {
      toast({
        title: '결제 실패',
        description: '결제 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 환불 처리
  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) return;

    try {
      await paymentApi.refundPayment(selectedPayment!.id, {
        refund_amount: parseFloat(refundAmount),
        refund_reason: refundReason,
      });

      toast({
        title: '환불 완료',
        description: '환불이 성공적으로 처리되었습니다.',
      });

      setRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      refetchPayments();
    } catch (_error) {
      toast({
        title: '환불 실패',
        description: '환불 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 알림 발송
  const handleSendReminder = async (paymentId: string) => {
    try {
      await paymentApi.sendReminder(paymentId);
      toast({
        title: '알림 발송',
        description: '결제 알림이 발송되었습니다.',
      });
    } catch (_error) {
      toast({
        title: '알림 발송 실패',
        description: '알림 발송 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">결제 관리</h1>
        <p className="mt-2 text-muted-foreground">렌탈 및 리스 계약 결제 내역을 관리합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 결제액</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total_amount.toLocaleString()}원</div>
            <p className="text-xs text-muted-foreground">
              완료된 결제 {statistics?.completed_payments}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미수금</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.pending_amount.toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground">
              대기중 결제 {statistics?.pending_payments}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연체 금액</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics?.overdue_amount.toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground">
              연체 결제 {statistics?.overdue_payments}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">실패 결제</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.failed_payments}건</div>
            <p className="text-xs text-muted-foreground">처리 실패</p>
          </CardContent>
        </Card>
      </div>

      {/* 결제 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
          <CardDescription>전체 결제 내역을 확인하고 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="pending">대기중</TabsTrigger>
              <TabsTrigger value="completed">완료</TabsTrigger>
              <TabsTrigger value="failed">실패</TabsTrigger>
              <TabsTrigger value="refunded">환불</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>결제일</TableHead>
                      <TableHead>고객명</TableHead>
                      <TableHead>계약번호</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>결제수단</TableHead>
                      <TableHead className="text-right">금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments?.items.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.due_date), 'yyyy-MM-dd', { locale: ko })}
                        </TableCell>
                        <TableCell>{payment.customer_name}</TableCell>
                        <TableCell>{payment.contract_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.contract_type === 'RENTAL' ? '렌탈' : '리스'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getPaymentMethodLabel(payment.payment_method)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {payment.amount.toLocaleString()}원
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {payment.status === PaymentStatus.PENDING && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setProcessDialogOpen(true);
                                  }}
                                >
                                  결제처리
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSendReminder(payment.id)}
                                >
                                  알림
                                </Button>
                              </>
                            )}
                            {payment.status === PaymentStatus.COMPLETED && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setRefundDialogOpen(true);
                                }}
                              >
                                환불
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 연체 결제 섹션 */}
      {overduePayments && overduePayments.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              연체 결제 현황
            </CardTitle>
            <CardDescription>납부 기한이 지난 결제 내역입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>납부예정일</TableHead>
                    <TableHead>고객명</TableHead>
                    <TableHead>계약번호</TableHead>
                    <TableHead className="text-right">연체금액</TableHead>
                    <TableHead>연체일수</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overduePayments.map(payment => {
                    const overdueDays = Math.floor(
                      (new Date().getTime() - new Date(payment.due_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <TableRow key={payment.id} className="bg-red-50">
                        <TableCell>
                          {format(new Date(payment.due_date), 'yyyy-MM-dd', { locale: ko })}
                        </TableCell>
                        <TableCell>{payment.customer_name}</TableCell>
                        <TableCell>{payment.contract_number}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {payment.amount.toLocaleString()}원
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{overdueDays}일</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(payment.id)}
                          >
                            독촉 알림
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 결제 처리 다이얼로그 */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결제 처리</DialogTitle>
            <DialogDescription>
              선택한 결제를 처리합니다. 결제 수단을 선택해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>결제 금액</Label>
              <Input value={selectedPayment?.amount?.toLocaleString() + '원'} disabled />
            </div>
            <div className="grid gap-2">
              <Label>결제 수단</Label>
              <Select
                value={selectedPaymentMethod}
                onValueChange={value => setSelectedPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CARD}>신용카드</SelectItem>
                  <SelectItem value={PaymentMethod.BANK_TRANSFER}>계좌이체</SelectItem>
                  <SelectItem value={PaymentMethod.CASH}>현금</SelectItem>
                  <SelectItem value={PaymentMethod.CORPORATE_CARD}>법인카드</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleProcessPayment}>결제 처리</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 환불 처리 다이얼로그 */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환불 처리</DialogTitle>
            <DialogDescription>환불 금액과 사유를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>원 결제 금액</Label>
              <Input value={selectedPayment?.amount?.toLocaleString() + '원'} disabled />
            </div>
            <div className="grid gap-2">
              <Label>환불 금액</Label>
              <Input
                type="number"
                placeholder="환불할 금액을 입력하세요"
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>환불 사유</Label>
              <Textarea
                placeholder="환불 사유를 입력하세요"
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleRefund} variant="destructive">
              환불 처리
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
