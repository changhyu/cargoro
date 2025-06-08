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
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cargoro/ui';
import { usePaymentHistory } from '../hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@cargoro/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@cargoro/ui';
import {
  CreditCard,
  FileText,
  Download,
  MoreVertical,
  RefreshCw,
  // AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PaymentStatus } from '../types';
import { formatNumber } from '../utils';

interface PaymentHistoryListProps {
  customerId: string;
}

const statusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  READY: { label: '준비중', color: 'bg-gray-500' },
  IN_PROGRESS: { label: '진행중', color: 'bg-blue-500' },
  WAITING_FOR_DEPOSIT: { label: '입금대기', color: 'bg-yellow-500' },
  DONE: { label: '완료', color: 'bg-green-500' },
  CANCELED: { label: '취소됨', color: 'bg-red-500' },
  PARTIAL_CANCELED: { label: '부분취소', color: 'bg-orange-500' },
  ABORTED: { label: '중단됨', color: 'bg-gray-700' },
  EXPIRED: { label: '만료됨', color: 'bg-gray-600' },
};

export function PaymentHistoryList({ customerId }: PaymentHistoryListProps) {
  const { paymentHistory, isLoading, fetchPaymentHistory } = usePaymentHistory();
  const [activeTab, setActiveTab] = React.useState('all');

  useEffect(() => {
    fetchPaymentHistory(customerId);
  }, [customerId, fetchPaymentHistory]);

  const filteredHistory = paymentHistory.filter(payment => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return payment.status === 'DONE';
    if (activeTab === 'canceled')
      return payment.status === 'CANCELED' || payment.status === 'PARTIAL_CANCELED';
    if (activeTab === 'pending')
      return (
        payment.status === 'READY' ||
        payment.status === 'IN_PROGRESS' ||
        payment.status === 'WAITING_FOR_DEPOSIT'
      );
    return true;
  });

  const handleRefresh = () => {
    fetchPaymentHistory(customerId);
  };

  const handleDownloadReceipt = async (paymentKey: string) => {
    // 영수증 다운로드 로직
    console.log('영수증 다운로드:', paymentKey);
  };

  const handleViewDetails = async (paymentKey: string) => {
    // 상세 보기 로직
    console.log('상세 보기:', paymentKey);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>결제 내역</CardTitle>
            <CardDescription>최근 결제 내역을 확인하세요</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="completed">완료</TabsTrigger>
            <TabsTrigger value="canceled">취소</TabsTrigger>
            <TabsTrigger value="pending">대기중</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredHistory.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                <CreditCard className="mb-4 h-12 w-12" />
                <p>결제 내역이 없습니다</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문명</TableHead>
                      <TableHead>결제일시</TableHead>
                      <TableHead>결제수단</TableHead>
                      <TableHead className="text-right">금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.orderName}</TableCell>
                        <TableCell>
                          {payment.paidAt
                            ? format(new Date(payment.paidAt), 'PPP p', { locale: ko })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {payment.method}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatNumber(payment.amount)}원
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${statusConfig[payment.status].color} text-white`}
                          >
                            {statusConfig[payment.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>작업</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(payment.paymentKey)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                상세 보기
                              </DropdownMenuItem>
                              {payment.status === 'DONE' && (
                                <DropdownMenuItem
                                  onClick={() => handleDownloadReceipt(payment.paymentKey)}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  영수증 다운로드
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
