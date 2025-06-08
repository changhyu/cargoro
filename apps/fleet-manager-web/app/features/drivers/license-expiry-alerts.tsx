'use client';

import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Shield, Calendar, Mail, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cargoro/ui';

import { notificationService } from '../../../services/api';

import type { Notification } from '../../../services/api';

// 간단한 DataTable 컴포넌트
interface ColumnDef<T> {
  id?: string;
  accessorKey?: string;
  header: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
}

function DataTable<T>({ columns, data, loading }: DataTableProps<T>) {
  if (loading) {
    return <div className="py-4 text-center">로딩 중...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(column => (
            <TableHead key={column.accessorKey || column.id}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            {columns.map(column => (
              <TableCell key={column.accessorKey || column.id}>
                {column.cell
                  ? column.cell({ row: { original: row } })
                  : column.accessorKey
                    ? String((row as Record<string, unknown>)[column.accessorKey] || '')
                    : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Notification Row 타입 정의
interface NotificationRow {
  original: Notification;
}

// 알림 데이터 필터링 및 그룹화 함수
const groupNotificationsByExpiration = (notifications: Notification[]) => {
  // 만료 임박 기간별로 그룹화
  const critical = notifications.filter(
    n =>
      n.type === 'license_expiry' &&
      n.targetType === 'driver' &&
      differenceInDays(new Date(n.createdAt), new Date()) <= 7
  );

  const warning = notifications.filter(
    n =>
      n.type === 'license_expiry' &&
      n.targetType === 'driver' &&
      differenceInDays(new Date(n.createdAt), new Date()) > 7 &&
      differenceInDays(new Date(n.createdAt), new Date()) <= 30
  );

  const upcoming = notifications.filter(
    n =>
      n.type === 'license_expiry' &&
      n.targetType === 'driver' &&
      differenceInDays(new Date(n.createdAt), new Date()) > 30
  );

  return { critical, warning, upcoming };
};

// 데이터 테이블용 컬럼 정의
const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: 'driverName',
    header: '운전자명',
    cell: ({ row }: { row: NotificationRow }) => {
      const message = row.original.message as string;
      // 정규식으로 운전자 이름 추출 (가정: "XXX 운전자의 면허증이..." 형식)
      const match = message.match(/(.+?) 운전자의 면허증/);
      return match ? match[1] : '알 수 없음';
    },
  },
  {
    accessorKey: 'expiryDate',
    header: '만료일',
    cell: ({ row }: { row: NotificationRow }) => {
      const message = row.original.message as string;
      // 정규식으로 날짜 추출 (가정: "...YYYY-MM-DD에 만료됩니다" 형식)
      const match = message.match(/(\d{4}-\d{2}-\d{2})에 만료됩니다/);
      const date = match ? match[1] : null;
      return date ? format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko }) : '알 수 없음';
    },
  },
  {
    accessorKey: 'daysRemaining',
    header: '남은 기간',
    cell: ({ row }: { row: NotificationRow }) => {
      const message = row.original.message as string;
      // 정규식으로 날짜 추출
      const match = message.match(/(\d{4}-\d{2}-\d{2})에 만료됩니다/);
      if (!match) return '알 수 없음';

      const expiryDate = new Date(match[1]);
      const today = new Date();
      const daysRemaining = differenceInDays(expiryDate, today);

      if (daysRemaining <= 0) {
        return <Badge variant="destructive">만료됨</Badge>;
      } else if (daysRemaining <= 7) {
        return <Badge variant="destructive">위험 ({daysRemaining}일)</Badge>;
      } else if (daysRemaining <= 30) {
        return <Badge variant="warning">주의 ({daysRemaining}일)</Badge>;
      } else {
        return <Badge variant="outline">여유 ({daysRemaining}일)</Badge>;
      }
    },
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }: { row: NotificationRow }) => {
      const isRead = row.original.isRead as boolean;
      return isRead ? (
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> 확인됨
        </Badge>
      ) : (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> 미확인
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: '액션',
    cell: ({ row }: { row: NotificationRow }) => {
      const notification = row.original;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              상세
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>면허증 만료 알림</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">알림 내용:</p>
                <p className="text-sm">{notification.message}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">생성일:</p>
                <p className="text-sm">
                  {format(new Date(notification.createdAt), 'yyyy년 MM월 dd일 HH:mm', {
                    locale: ko,
                  })}
                </p>
              </div>
              {notification.updatedAt && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">확인일:</p>
                  <p className="text-sm">
                    {format(new Date(notification.updatedAt), 'yyyy년 MM월 dd일 HH:mm', {
                      locale: ko,
                    })}
                  </p>
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                {!notification.isRead && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      // 이 부분은 실제 구현에서 처리할 것
                      // markAsRead(notification.id);
                    }}
                  >
                    확인 처리
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // 이 부분은 실제 구현에서 처리할 것
                    // sendReminderEmail(notification.targetId);
                  }}
                >
                  이메일 발송
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];

export default function LicenseExpiryAlerts() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('critical');

  // 알림 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await notificationService.getLicenseExpiryAlerts();
        setNotifications(data);
      } catch (_error) {
        toast({
          title: '데이터 로드 오류',
          description: '면허 만료 알림을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // 알림 데이터 그룹화
  const { critical, warning, upcoming } = groupNotificationsByExpiration(notifications);

  // 선택된 탭에 따라 표시할 데이터 결정
  // 현재 unused로 경고가 발생하지만, 향후 사용할 수 있으므로 주석 처리
  /*
  const getActiveData = () => {
    switch (activeTab) {
      case 'critical':
        return critical;
      case 'warning':
        return warning;
      case 'upcoming':
        return upcoming;
      default:
        return critical;
    }
  };
  */

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast({
        title: '알림 확인 완료',
        description: '모든 면허 만료 알림이 확인 처리되었습니다.',
      });

      // 상태 업데이트 (간소화를 위해 전체 새로고침)
      const data = await notificationService.getLicenseExpiryAlerts();
      setNotifications(data);
    } catch (_error) {
      toast({
        title: '오류 발생',
        description: '알림 확인 처리에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center text-xl font-bold">
          <Shield className="mr-2 h-5 w-5" />
          면허증 만료 알림
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden items-center md:flex"
            onClick={() => markAllAsRead()}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            모두 확인
          </Button>
          <Button variant="outline" size="sm" className="hidden items-center md:flex">
            <Mail className="mr-2 h-4 w-4" />
            일괄 알림
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="critical" className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
              위험 ({critical.length})
            </TabsTrigger>
            <TabsTrigger value="warning" className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              주의 ({warning.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-blue-500" />
              예정 ({upcoming.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="critical">
            {critical.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Shield className="mb-4 h-12 w-12" />
                <p>위험 수준의 면허 만료 알림이 없습니다.</p>
              </div>
            ) : (
              <DataTable columns={columns} data={critical} loading={loading} />
            )}
          </TabsContent>

          <TabsContent value="warning">
            {warning.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Shield className="mb-4 h-12 w-12" />
                <p>주의 수준의 면허 만료 알림이 없습니다.</p>
              </div>
            ) : (
              <DataTable columns={columns} data={warning} loading={loading} />
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Shield className="mb-4 h-12 w-12" />
                <p>예정된 면허 만료 알림이 없습니다.</p>
              </div>
            ) : (
              <DataTable columns={columns} data={upcoming} loading={loading} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
