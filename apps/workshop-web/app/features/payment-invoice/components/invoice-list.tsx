'use client';

import { useState } from 'react';
import { useInvoices, useDeleteInvoice } from '../hooks/use-invoices';
import { InvoiceFilter } from '../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Send,
  Edit,
  Trash,
  Eye,
  Download,
  CreditCard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface InvoiceListProps {
  customerId?: string;
  onCreateClick: () => void;
}

export function InvoiceList({ customerId, onCreateClick }: InvoiceListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<InvoiceFilter>({
    search: '',
    customerId,
    status: 'all',
    paymentStatus: 'all',
    sortBy: 'invoiceNumber',
    sortOrder: 'desc',
  });

  const { data: invoices, isLoading, error } = useInvoices(filter);
  const deleteInvoiceMutation = useDeleteInvoice();

  const handleFilterChange = (updates: Partial<InvoiceFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };

  const handleDelete = async (invoiceId: string) => {
    if (window.confirm('정말로 이 송장을 삭제하시겠습니까?')) {
      await deleteInvoiceMutation.mutateAsync(invoiceId);
    }
  };

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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">송장 목록을 불러오는데 실패했습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>송장 관리</CardTitle>
            <Button onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              송장 생성
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="송장번호, 고객명으로 검색"
                value={filter.search}
                onChange={e => handleFilterChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              value={filter.status || 'all'}
              onValueChange={value =>
                handleFilterChange({ status: value as InvoiceFilter['status'] })
              }
            >
              <option value="all">전체 상태</option>
              <option value="draft">초안</option>
              <option value="issued">발행됨</option>
              <option value="sent">발송됨</option>
              <option value="paid">결제완료</option>
              <option value="overdue">연체</option>
              <option value="cancelled">취소됨</option>
            </Select>

            <Select
              value={filter.paymentStatus || 'all'}
              onValueChange={value =>
                handleFilterChange({ paymentStatus: value as InvoiceFilter['paymentStatus'] })
              }
            >
              <option value="all">결제 상태</option>
              <option value="pending">미결제</option>
              <option value="partial">부분결제</option>
              <option value="paid">결제완료</option>
              <option value="refunded">환불됨</option>
            </Select>

            <Select
              value={filter.sortBy || 'invoiceNumber'}
              onValueChange={value =>
                handleFilterChange({ sortBy: value as InvoiceFilter['sortBy'] })
              }
            >
              <option value="invoiceNumber">송장번호순</option>
              <option value="issueDate">발행일순</option>
              <option value="dueDate">만기일순</option>
              <option value="total">금액순</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 송장 목록 테이블 */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">
              <p>송장 목록을 불러오는 중...</p>
            </div>
          ) : invoices?.length === 0 ? (
            <div className="p-6 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">등록된 송장이 없습니다.</p>
              <Button className="mt-4" onClick={onCreateClick}>
                첫 송장 생성하기
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>송장번호</TableHead>
                  <TableHead>고객</TableHead>
                  <TableHead>발행일</TableHead>
                  <TableHead>만기일</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>결제상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.issueDate), 'yyyy-MM-dd', { locale: ko })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.dueDate), 'yyyy-MM-dd', { locale: ko })}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(invoice.paymentStatus)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">메뉴 열기</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            상세 보기
                          </DropdownMenuItem>
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                          )}
                          {['issued', 'sent'].includes(invoice.status) && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/invoices/${invoice.id}/send`)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              이메일 발송
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => router.push(`/invoices/${invoice.id}/download`)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            PDF 다운로드
                          </DropdownMenuItem>
                          {invoice.paymentStatus !== 'paid' && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/invoices/${invoice.id}/payment`)}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              결제 등록
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
