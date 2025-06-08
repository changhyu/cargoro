'use client';

import { useState } from 'react';
import { useCustomers, useDeleteCustomer } from '../hooks/use-customers';
import { CustomerFilter } from '../types';
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
  Phone,
  Mail,
  Building,
  User,
  Edit,
  Trash,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CustomerListProps {
  onCreateClick: () => void;
  onEditClick: (customerId: string) => void;
  onViewClick: (customerId: string) => void;
}

export function CustomerList({ onCreateClick, onEditClick, onViewClick }: CustomerListProps) {
  // router 변수가 사용되지 않아 제거
  const [filter, setFilter] = useState<CustomerFilter>({
    search: '',
    customerType: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const { data: customers, isLoading, error } = useCustomers(filter);
  const deleteCustomerMutation = useDeleteCustomer();

  const handleFilterChange = (updates: Partial<CustomerFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };

  const handleDelete = async (customerId: string) => {
    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      const isConfirmed = window.confirm('정말로 이 고객을 삭제하시겠습니까?');
      if (isConfirmed) {
        await deleteCustomerMutation.mutateAsync(customerId);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">고객 목록을 불러오는데 실패했습니다.</p>
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
            <CardTitle>고객 관리</CardTitle>
            <Button onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              신규 고객 등록
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="고객명, 전화번호, 이메일로 검색"
                value={filter.search}
                onChange={e => handleFilterChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              value={filter.customerType || 'all'}
              onValueChange={value =>
                handleFilterChange({ customerType: value as 'individual' | 'business' | 'all' })
              }
            >
              <option value="all">전체 고객</option>
              <option value="individual">개인 고객</option>
              <option value="business">법인 고객</option>
            </Select>

            <Select
              value={filter.status || 'all'}
              onValueChange={value =>
                handleFilterChange({ status: value as 'active' | 'inactive' | 'all' })
              }
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </Select>

            <Select
              value={filter.sortBy || 'name'}
              onValueChange={value =>
                handleFilterChange({
                  sortBy: value as 'name' | 'registrationDate' | 'lastServiceDate' | 'totalSpent',
                })
              }
            >
              <option value="name">이름순</option>
              <option value="registrationDate">등록일순</option>
              <option value="lastServiceDate">최근 서비스순</option>
              <option value="totalSpent">누적 금액순</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 고객 목록 테이블 */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">
              <p>고객 목록을 불러오는 중...</p>
            </div>
          ) : customers?.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">등록된 고객이 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>고객 정보</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>최근 서비스</TableHead>
                  <TableHead>누적 금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers?.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      {customer.businessNumber && (
                        <div className="text-sm text-gray-500">
                          사업자번호: {customer.businessNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="mr-1 h-3 w-3" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {customer.customerType === 'business' ? (
                          <>
                            <Building className="mr-1 h-4 w-4" />
                            법인
                          </>
                        ) : (
                          <>
                            <User className="mr-1 h-4 w-4" />
                            개인
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(customer.registrationDate).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      {customer.lastServiceDate ? (
                        <div>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(customer.lastServiceDate), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            총 {customer.totalServiceCount}회
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                        {customer.status === 'active' ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => onViewClick(customer.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            상세 보기
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditClick(customer.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(customer.id)}
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
