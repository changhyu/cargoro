'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  User,
  Home,
  Mail,
  Phone,
  MapPin,
  Car,
  Wrench,
  FileText,
  DollarSign,
  Calendar,
  Edit,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cargoro/ui';

interface CustomerDetailProps {
  customerId: string;
}

// 고객 타입 색상
const customerTypeColors = {
  INDIVIDUAL: 'default',
  BUSINESS: 'secondary',
} as const;

// 고객 타입 한글 매핑
const customerTypeLabels: Record<string, string> = {
  INDIVIDUAL: '개인',
  BUSINESS: '사업자',
};

// 상태 색상
const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'destructive',
} as const;

// 상태 한글 매핑
const statusLabels: Record<string, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
};

// 정비 상태 색상
const repairStatusColors = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
} as const;

// 정비 상태 한글 매핑
const repairStatusLabels: Record<string, string> = {
  PENDING: '대기중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

// 결제 상태 색상
const paymentStatusColors = {
  PENDING: 'secondary',
  PAID: 'success',
  OVERDUE: 'destructive',
} as const;

// 결제 상태 한글 매핑
const paymentStatusLabels: Record<string, string> = {
  PENDING: '미결제',
  PAID: '결제완료',
  OVERDUE: '연체',
};

export function CustomerDetail({ customerId }: CustomerDetailProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('overview');

  // 고객 상세 정보 조회
  const {
    data: customer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch(`/api/customers/${customerId}`)
      // return response.json()

      // 임시 더미 데이터
      return {
        id: customerId,
        name: '(주)우리물류',
        email: 'info@woorilogistics.com',
        phone: '02-1234-5678',
        address: '서울시 중구 을지로 123',
        businessNumber: '123-45-67890',
        customerType: 'BUSINESS',
        status: 'ACTIVE',
        totalSpent: 15000000,
        notes: '우수 고객, VIP 관리 필요',
        createdAt: '2023-03-10',
        createdBy: {
          id: '1',
          name: '관리자',
        },
        vehicles: [
          {
            id: '1',
            vehicleNumber: '12가 3456',
            manufacturer: '현대',
            model: '포터II',
            year: 2022,
            engineType: 'DIESEL',
            _count: {
              repairs: 5,
            },
          },
          {
            id: '2',
            vehicleNumber: '34나 5678',
            manufacturer: '기아',
            model: '봉고III',
            year: 2021,
            engineType: 'DIESEL',
            _count: {
              repairs: 3,
            },
          },
        ],
        repairs: [
          {
            id: '1',
            repairNumber: 'REQ-202501-001',
            description: '정기 점검',
            status: 'COMPLETED',
            actualCost: 150000,
            completedDate: '2025-01-05',
            vehicle: {
              vehicleNumber: '12가 3456',
            },
            workshop: {
              name: '우리정비소',
            },
          },
          {
            id: '2',
            repairNumber: 'REQ-202501-002',
            description: '브레이크 교체',
            status: 'IN_PROGRESS',
            estimatedCost: 200000,
            scheduledDate: '2025-01-15',
            vehicle: {
              vehicleNumber: '34나 5678',
            },
            workshop: {
              name: '우리정비소',
            },
          },
        ],
        invoices: [
          {
            id: '1',
            invoiceNumber: 'INV-202501-001',
            issueDate: '2025-01-05',
            dueDate: '2025-02-05',
            amount: 150000,
            paymentStatus: 'PAID',
          },
          {
            id: '2',
            invoiceNumber: 'INV-202412-005',
            issueDate: '2024-12-15',
            dueDate: '2025-01-15',
            amount: 250000,
            paymentStatus: 'PENDING',
          },
        ],
        statistics: {
          totalVehicles: 15,
          totalRepairs: 45,
          totalInvoices: 30,
          activeRepairs: 3,
          unpaidInvoices: 2,
        },
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">로딩중...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-destructive">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            {customer.customerType === 'BUSINESS' ? (
              <Home className="h-8 w-8" />
            ) : (
              <User className="h-8 w-8" />
            )}
            {customer.name}
          </h1>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                customerTypeColors[customer.customerType as keyof typeof customerTypeColors] ||
                'default'
              }
            >
              {customerTypeLabels[customer.customerType]}
            </Badge>
            <Badge
              variant={statusColors[customer.status as keyof typeof statusColors] || 'default'}
            >
              {statusLabels[customer.status]}
            </Badge>
            {customer.businessNumber && (
              <span className="text-sm text-muted-foreground">
                사업자번호: {customer.businessNumber}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/vehicles/new?customerId=${customerId}`}>
              <Car className="mr-2 h-4 w-4" />
              차량 등록
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/customers/${customerId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Link>
          </Button>
        </div>
      </div>

      {/* 주요 정보 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">보유 차량</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.statistics.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">활성 차량 {customer.vehicles.length}대</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 정비</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.statistics.totalRepairs}</div>
            <p className="text-xs text-muted-foreground">
              진행중 {customer.statistics.activeRepairs}건
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">누적 거래</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{Math.round(customer.totalSpent / 1000000)}M</div>
            <p className="text-xs text-muted-foreground">
              총 {customer.statistics.totalInvoices}건
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미결제</CardTitle>
            <AlertCircle
              className={`h-4 w-4 ${customer.statistics.unpaidInvoices > 0 ? 'text-orange-500' : 'text-green-500'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${customer.statistics.unpaidInvoices > 0 ? 'text-orange-500' : 'text-green-500'}`}
            >
              {customer.statistics.unpaidInvoices}건
            </div>
            <p className="text-xs text-muted-foreground">미결제 송장</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="vehicles">차량</TabsTrigger>
          <TabsTrigger value="repairs">정비 이력</TabsTrigger>
          <TabsTrigger value="invoices">송장</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 고객 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>고객 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">이메일</p>
                      <p className="text-sm">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">전화번호</p>
                      <p className="text-sm">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">주소</p>
                      <p className="text-sm">{customer.address || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">가입일</p>
                      <p className="text-sm">
                        {format(new Date(customer.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 메모 및 특이사항 */}
            <Card>
              <CardHeader>
                <CardTitle>메모 및 특이사항</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.notes ? (
                  <p className="whitespace-pre-wrap text-sm">{customer.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">등록된 메모가 없습니다</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>보유 차량</CardTitle>
              <CardDescription>고객이 보유한 차량 목록입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.vehicles.map(vehicle => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span className="font-medium">{vehicle.vehicleNumber}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.manufacturer} {vehicle.model} ({vehicle.year})
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Badge variant="secondary">{vehicle.engineType}</Badge>
                        <span>정비 {vehicle._count.repairs}건</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/vehicles/${vehicle.id}`}>상세보기</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repairs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>정비 이력</CardTitle>
              <CardDescription>최근 정비 요청 내역입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.repairs.map(repair => (
                  <div
                    key={repair.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repair.repairNumber}</span>
                        <Badge
                          variant={
                            repairStatusColors[repair.status as keyof typeof repairStatusColors] ||
                            'default'
                          }
                        >
                          {repairStatusLabels[repair.status]}
                        </Badge>
                      </div>
                      <p className="text-sm">{repair.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>차량: {repair.vehicle.vehicleNumber}</span>
                        <span>{repair.workshop.name}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {repair.completedDate
                            ? format(new Date(repair.completedDate), 'yyyy.MM.dd', { locale: ko })
                            : repair.scheduledDate
                              ? format(new Date(repair.scheduledDate), 'yyyy.MM.dd 예정', {
                                  locale: ko,
                                })
                              : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₩{(repair.actualCost || repair.estimatedCost || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {repair.actualCost ? '실제 비용' : '예상 비용'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>송장 내역</CardTitle>
              <CardDescription>발행된 송장 목록입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.invoices.map(invoice => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{invoice.invoiceNumber}</span>
                        <Badge
                          variant={
                            paymentStatusColors[
                              invoice.paymentStatus as keyof typeof paymentStatusColors
                            ] || 'default'
                          }
                        >
                          {paymentStatusLabels[invoice.paymentStatus]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>발행일: {format(new Date(invoice.issueDate), 'yyyy.MM.dd')}</span>
                        <span>만기일: {format(new Date(invoice.dueDate), 'yyyy.MM.dd')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₩{invoice.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
