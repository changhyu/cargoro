'use client';

import {
  useCustomer,
  useCustomerVehicles,
  useCustomerServiceHistory,
} from '../hooks/use-customers';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Calendar,
  Car,
  Wrench,
  DollarSign,
  Edit,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CustomerDetailProps {
  customerId: string;
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const router = useRouter();
  const { data: customer, isLoading: customerLoading } = useCustomer(customerId);
  const { data: vehicles, isLoading: vehiclesLoading } = useCustomerVehicles(customerId);
  const { data: serviceHistory, isLoading: historyLoading } = useCustomerServiceHistory(customerId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  if (customerLoading) {
    return <div className="p-6 text-center">고객 정보를 불러오는 중...</div>;
  }

  if (!customer) {
    return <div className="p-6 text-center">고객 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
            {customer.status === 'active' ? '활성' : '비활성'}
          </Badge>
        </div>
        <Button onClick={() => router.push(`/dashboard/customers/${customerId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          정보 수정
        </Button>
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              {customer.customerType === 'business' ? (
                <Building className="h-5 w-5 text-gray-400" />
              ) : (
                <User className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm text-gray-500">고객 구분</p>
                <p className="font-medium">
                  {customer.customerType === 'business' ? '법인' : '개인'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">전화번호</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">이메일</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            </div>

            {customer.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">주소</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            )}

            {customer.businessNumber && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">사업자번호</p>
                  <p className="font-medium">{customer.businessNumber}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">등록일</p>
                <p className="font-medium">
                  {new Date(customer.registrationDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-sm text-gray-500">메모</p>
              <p className="text-sm">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 통계 정보 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">등록 차량</p>
                <p className="text-2xl font-bold">{vehicles?.length || 0}대</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">총 서비스</p>
                <p className="text-2xl font-bold">{customer.totalServiceCount}회</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">누적 금액</p>
                <p className="text-2xl font-bold">{formatCurrency(customer.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">최근 서비스</p>
                <p className="text-lg font-medium">
                  {customer.lastServiceDate
                    ? formatDistanceToNow(new Date(customer.lastServiceDate), {
                        addSuffix: true,
                        locale: ko,
                      })
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 콘텐츠 */}
      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles">차량 정보</TabsTrigger>
          <TabsTrigger value="history">서비스 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          {vehiclesLoading ? (
            <Card>
              <CardContent className="p-6 text-center">차량 정보를 불러오는 중...</CardContent>
            </Card>
          ) : vehicles?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">등록된 차량이 없습니다.</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push(`/dashboard/vehicles/new?customerId=${customerId}`)}
                >
                  차량 등록하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            vehicles?.map(vehicle => (
              <Card key={vehicle.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">
                        {vehicle.manufacturer} {vehicle.model}
                      </h4>
                      <p className="text-gray-500">{vehicle.vehicleNumber}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      상세 보기
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">연식</span>
                      <span>{vehicle.year}년</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">엔진 타입</span>
                      <span>{vehicle.engineType}</span>
                    </div>
                    {vehicle.mileage && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">주행거리</span>
                        <span>{vehicle.mileage.toLocaleString()}km</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {historyLoading ? (
            <Card>
              <CardContent className="p-6 text-center">서비스 이력을 불러오는 중...</CardContent>
            </Card>
          ) : serviceHistory?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">서비스 이력이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            serviceHistory?.map(service => (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{service.serviceType}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(service.serviceDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <Badge variant={service.paymentStatus === 'paid' ? 'default' : 'outline'}>
                      {service.paymentStatus === 'paid' ? '결제완료' : '미결제'}
                    </Badge>
                  </div>
                  <p className="mb-4 text-sm">{service.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">담당: {service.technician}</span>
                    <span className="font-semibold">{formatCurrency(service.totalCost)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
