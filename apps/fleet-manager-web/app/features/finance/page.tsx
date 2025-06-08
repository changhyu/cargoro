'use client';

import { useState } from 'react';
import { DollarSign, CreditCard, FileText, TrendingUp, AlertCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  type: 'rental' | 'lease';
  contractId: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

// 더미 데이터
const mockPayments: Payment[] = [
  {
    id: '1',
    customerId: 'c1',
    customerName: '김철수',
    amount: 500000,
    dueDate: '2024-03-25',
    status: 'pending',
    type: 'rental',
    contractId: 'r1',
  },
  {
    id: '2',
    customerId: 'c2',
    customerName: '(주)테크솔루션',
    amount: 2000000,
    dueDate: '2024-03-20',
    status: 'overdue',
    type: 'lease',
    contractId: 'l1',
  },
  {
    id: '3',
    customerId: 'c3',
    customerName: '이영희',
    amount: 300000,
    dueDate: '2024-03-15',
    status: 'paid',
    type: 'rental',
    contractId: 'r2',
  },
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: 'c1',
    customerName: '김철수',
    amount: 500000,
    issueDate: '2024-03-01',
    dueDate: '2024-03-25',
    status: 'sent',
    items: [
      {
        description: '렌탈료 (3월)',
        quantity: 1,
        unitPrice: 500000,
        total: 500000,
      },
    ],
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerId: 'c2',
    customerName: '(주)테크솔루션',
    amount: 2000000,
    issueDate: '2024-02-20',
    dueDate: '2024-03-20',
    status: 'overdue',
    items: [
      {
        description: '리스료 (3월)',
        quantity: 1,
        unitPrice: 2000000,
        total: 2000000,
      },
    ],
  },
];

export default function FinancePage() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = payments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const getPaymentStatusBadge = (status: Payment['status']) => {
    const configs = {
      pending: { label: '대기중', variant: 'secondary' as const },
      paid: { label: '완료', variant: 'success' as const },
      overdue: { label: '연체', variant: 'destructive' as const },
    };
    const config = configs[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getInvoiceStatusBadge = (status: Invoice['status']) => {
    const configs = {
      draft: { label: '초안', variant: 'secondary' as const },
      sent: { label: '발송됨', variant: 'default' as const },
      paid: { label: '결제완료', variant: 'success' as const },
      overdue: { label: '연체', variant: 'destructive' as const },
    };
    const config = configs[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const processPayment = (paymentId: string) => {
    // 실제로는 API를 호출하여 결제 처리
    // TODO: API 호출로 결제 처리 구현
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">재무 관리</h1>
        <p className="mt-2 text-gray-600">결제 현황과 청구서를 관리합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수익</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">이번 달 수금 완료</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미수금</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
              }).format(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">수금 대기중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연체금액</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
              }).format(overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">즉시 조치 필요</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수금률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue > 0
                ? Math.round((totalRevenue / (totalRevenue + pendingAmount + overdueAmount)) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">이번 달 기준</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">결제 관리</TabsTrigger>
          <TabsTrigger value="invoices">청구서 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>결제 현황</CardTitle>
              <CardDescription>렌탈 및 리스 계약의 결제 현황을 확인하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>고객명</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>납부기한</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.type === 'rental' ? '렌탈' : '리스'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.status === 'pending' && (
                          <Button size="sm" onClick={() => processPayment(payment.id)}>
                            수금 처리
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>청구서 목록</CardTitle>
              <CardDescription>발행된 청구서를 확인하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>청구서 번호</TableHead>
                    <TableHead>고객명</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>발행일</TableHead>
                    <TableHead>납부기한</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(invoice.amount)}
                      </TableCell>
                      <TableCell>{invoice.issueDate}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <FileText className="mr-1 h-4 w-4" />
                          보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
