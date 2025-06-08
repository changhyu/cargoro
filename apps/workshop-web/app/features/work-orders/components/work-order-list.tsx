'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
} from '@cargoro/ui';
import { toast } from 'sonner';

// import { useRealtimeEvent, useRealtimeConnection } from '@cargoro/realtime';
import { AlertCircle, CheckCircle, Clock, Wrench, Users, Car, RefreshCw } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface WorkOrder {
  id: string;
  orderNumber: string;
  vehicleNumber: string;
  customerName: string;
  technicianName?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletion?: Date;
  totalAmount?: number;
  services: {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
}

const statusConfig = {
  pending: {
    label: '대기중',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
  in_progress: {
    label: '진행중',
    icon: Wrench,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  },
  completed: {
    label: '완료',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  },
  cancelled: {
    label: '취소됨',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  },
};

export function WorkOrderList() {
  const [activeTab, setActiveTab] = useState('all');
  // const queryClient = useQueryClient();
  // const { isConnected } = useRealtimeConnection();
  const isConnected = false; // 임시로 false로 설정

  // 작업 오더 목록 조회
  const {
    data: workOrders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['work-orders', activeTab],
    queryFn: async () => {
      const response = await fetch(`/api/work-orders?status=${activeTab}`);
      if (!response.ok) throw new Error('작업 오더 조회 실패');
      return response.json();
    },
  });

  // 실시간 업데이트 리스너는 임시로 주석 처리
  // useRealtimeEvent('workOrderCreated', (data: WorkOrder) => {
  //   queryClient.setQueryData(['work-orders', activeTab], (old: WorkOrder[] = []) => {
  //     return [data, ...old];
  //   });
  //   toast.success(`새 작업 오더: ${data.vehicleNumber} - ${data.customerName}`);
  // });

  // 작업 상태 변경 뮤테이션
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: WorkOrder['status'] }) => {
      const response = await fetch(`/api/work-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('상태 변경 실패');
      return response.json();
    },
    onSuccess: () => {
      toast.success('작업 오더 상태가 성공적으로 변경되었습니다.');
    },
  });

  const filteredOrders: WorkOrder[] =
    activeTab === 'all'
      ? workOrders
      : workOrders.filter((order: WorkOrder) => order.status === activeTab);

  const getStatusIcon = (status: WorkOrder['status']) => {
    const Icon = statusConfig[status].icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">작업 오더</h2>
          {isConnected && (
            <Badge variant="outline" className="text-green-600">
              <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-green-600" />
              실시간 연결됨
            </Badge>
          )}
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="pending">대기중</TabsTrigger>
          <TabsTrigger value="in_progress">진행중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="cancelled">취소됨</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex h-64 flex-col items-center justify-center">
                <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">작업 오더가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {filteredOrders.map((order: WorkOrder) => (
                  <Card key={order.id} className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Car className="h-5 w-5" />
                          {order.vehicleNumber}
                        </CardTitle>
                        <Badge className={statusConfig[order.status].color}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{statusConfig[order.status].label}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">고객:</span>
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                        {order.technicianName && (
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">기술자:</span>
                            <span className="font-medium">{order.technicianName}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>접수일: {format(new Date(order.createdAt), 'PPP p', { locale: ko })}</p>
                        {order.estimatedCompletion && (
                          <p>
                            예상 완료:{' '}
                            {format(new Date(order.estimatedCompletion), 'PPP p', { locale: ko })}
                          </p>
                        )}
                      </div>

                      {order.services.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">서비스 항목:</p>
                          <div className="space-y-1">
                            {order.services.map(
                              (service: {
                                id: string;
                                name: string;
                                status: 'pending' | 'in_progress' | 'completed';
                              }) => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span>{service.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {statusConfig[service.status].label}
                                  </Badge>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {order.totalAmount && (
                        <div className="border-t pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">총 금액:</span>
                            <span className="font-semibold">
                              {new Intl.NumberFormat('ko-KR', {
                                style: 'currency',
                                currency: 'KRW',
                              }).format(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      )}

                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <div className="flex gap-2 pt-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  orderId: order.id,
                                  status: 'in_progress',
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              작업 시작
                            </Button>
                          )}
                          {order.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  orderId: order.id,
                                  status: 'completed',
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              작업 완료
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                orderId: order.id,
                                status: 'cancelled',
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            취소
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
