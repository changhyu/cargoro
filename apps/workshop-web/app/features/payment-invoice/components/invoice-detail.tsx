'use client';

import { useInvoice, useInvoicePayments, useSendInvoice } from '../hooks/use-invoices';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { ArrowLeft, Download, Send, Edit, CreditCard, Printer, Car } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface InvoiceDetailProps {
  invoiceId: string;
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const router = useRouter();
  const { data: invoice, isLoading: invoiceLoading } = useInvoice(invoiceId);
  const { data: payments } = useInvoicePayments(invoiceId);
  const sendInvoiceMutation = useSendInvoice();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: '초안', variant: 'secondary' as const },
      issued: { label: '발행됨', variant: 'default' as const },
      sent: { label: '발송됨', variant: 'outline' as const },
      paid: { label: '결제완료', variant: 'success' as const },
      overdue: { label: '연체', variant: 'destructive' as const },
      cancelled: { label: '취소됨', variant: 'secondary' as const },
    };

    const config = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: 'default' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: '미결제', variant: 'outline' as const },
      partial: { label: '부분결제', variant: 'secondary' as const },
      paid: { label: '결제완료', variant: 'success' as const },
      refunded: { label: '환불됨', variant: 'destructive' as const },
    };

    const config = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: 'default' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;
    await sendInvoiceMutation.mutateAsync(invoice.id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // PDF 다운로드 로직 구현
    router.push(`/api/invoices/${invoiceId}/pdf`);
  };

  if (invoiceLoading) {
    return <div className="p-6 text-center">송장 정보를 불러오는 중...</div>;
  }

  if (!invoice) {
    return <div className="p-6 text-center">송장 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">송장 상세</h1>
          {getStatusBadge(invoice.status)}
          {getPaymentStatusBadge(invoice.paymentStatus)}
        </div>
        <div className="flex gap-2">
          {invoice.status === 'draft' && (
            <Button variant="outline" onClick={() => router.push(`/invoices/${invoiceId}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Button>
          )}
          {['issued', 'sent'].includes(invoice.status) && (
            <Button variant="outline" onClick={handleSendInvoice}>
              <Send className="mr-2 h-4 w-4" />
              이메일 발송
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            인쇄
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF 다운로드
          </Button>
          {invoice.paymentStatus !== 'paid' && (
            <Button onClick={() => router.push(`/invoices/${invoiceId}/payment`)}>
              <CreditCard className="mr-2 h-4 w-4" />
              결제 등록
            </Button>
          )}
        </div>
      </div>

      {/* 송장 내용 */}
      <div className="invoice-content">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold">송장</h2>
                <p className="mt-1 text-lg text-gray-600">#{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold">CarGoro 정비소</h3>
                <p className="text-sm text-gray-600">서울시 강남구 테헤란로 123</p>
                <p className="text-sm text-gray-600">Tel: 02-1234-5678</p>
                <p className="text-sm text-gray-600">사업자번호: 123-45-67890</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 고객 정보 및 날짜 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">청구 대상</h4>
                <p className="font-medium">{invoice.customerName}</p>
                {invoice.vehicleInfo && (
                  <p className="mt-1 text-sm text-gray-600">
                    <Car className="mr-1 inline h-3 w-3" />
                    {invoice.vehicleInfo}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex justify-end gap-2">
                    <span className="text-gray-600">발행일:</span>
                    <span className="font-medium">
                      {format(new Date(invoice.issueDate), 'yyyy년 MM월 dd일', { locale: ko })}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="text-gray-600">만기일:</span>
                    <span className="font-medium">
                      {format(new Date(invoice.dueDate), 'yyyy년 MM월 dd일', { locale: ko })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 송장 항목 */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">설명</th>
                    <th className="py-2 text-center">구분</th>
                    <th className="py-2 text-center">수량</th>
                    <th className="py-2 text-right">단가</th>
                    <th className="py-2 text-right">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-center">
                        <Badge variant="outline">
                          {item.type === 'service'
                            ? '서비스'
                            : item.type === 'part'
                              ? '부품'
                              : '기타'}
                        </Badge>
                      </td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 금액 요약 */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>소계</span>
                  <span>{formatCurrency(invoice.subtotal + (invoice.discount || 0))}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>할인</span>
                    <span>-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>공급가액</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>부가세</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>총 금액</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* 메모 */}
            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-2 font-semibold">메모</h4>
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              </>
            )}

            {/* 결제 내역 */}
            {payments && payments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-3 font-semibold">결제 내역</h4>
                  <div className="space-y-2">
                    {payments.map(payment => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded bg-gray-50 p-3"
                      >
                        <div>
                          <p className="font-medium">
                            {format(new Date(payment.paymentDate), 'yyyy년 MM월 dd일', {
                              locale: ko,
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.paymentMethod === 'cash'
                              ? '현금'
                              : payment.paymentMethod === 'card'
                                ? '카드'
                                : payment.paymentMethod === 'transfer'
                                  ? '계좌이체'
                                  : '외상'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <Badge variant={payment.status === 'completed' ? 'success' : 'secondary'}>
                            {payment.status === 'completed' ? '완료' : '대기중'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
