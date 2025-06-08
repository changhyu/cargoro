'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Calendar, Info, Gauge, ShieldAlert } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  useToast,
} from '@cargoro/ui';

import { Driver, Notification, notificationService } from '../../services/api';

// Notification 타입 확장
interface ExtendedNotification extends Notification {
  severity?: 'error' | 'warning' | 'success' | 'info';
}

interface NotificationSystemProps {
  readonly driver?: Driver; // 특정 운전자용 알림을 볼 때 전달
}

export default function NotificationSystem({ driver }: NotificationSystemProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 알림 목록 조회
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const notificationsData = await notificationService.getNotifications(
          driver ? driver.id : undefined
        );
        setNotifications(notificationsData);

        // 읽지 않은 알림 수 조회 - getUnreadCount가 없으므로 수동 계산
        const count = notificationsData.filter(n => !n.isRead && !n.read).length;
        setUnreadCount(count);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : '알림 목록을 불러오는데 실패했습니다.';

        toast({
          title: '오류',
          description: '알림 목록을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [driver, toast]);

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);

      // 상태 업데이트
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );

      // 읽지 않은 알림 수 업데이트
      setUnreadCount(prev => Math.max(0, prev - 1));

      toast({
        title: '알림',
        description: '알림을 읽음 처리했습니다.',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '알림 읽음 처리에 실패했습니다.';

      toast({
        title: '오류',
        description: '알림 읽음 처리에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      // 상태 업데이트
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );

      // 읽지 않은 알림 수 초기화
      setUnreadCount(0);

      toast({
        title: '알림',
        description: '모든 알림을 읽음 처리했습니다.',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '알림 읽음 처리에 실패했습니다.';

      toast({
        title: '오류',
        description: '알림 읽음 처리에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: ExtendedNotification['type'] | string) => {
    switch (type) {
      case 'license_expiry':
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case 'warning':
        return <Gauge className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // 알림 심각도별 색상
  const getSeverityColor = (severity?: ExtendedNotification['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  // 알림 심각도별 라벨
  const getSeverityLabel = (severity?: ExtendedNotification['severity']) => {
    switch (severity) {
      case 'error':
        return '긴급';
      case 'warning':
        return '주의';
      case 'success':
        return '완료';
      default:
        return '정보';
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            알림 센터
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{driver ? `${driver.name} 운전자의 알림` : '모든 알림'}</CardDescription>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            모두 읽음 처리
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">알림이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`relative rounded-lg border p-4 ${
                  !notification.isRead
                    ? getSeverityColor(notification.severity)
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={notification.severity === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {getSeverityLabel(notification.severity)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{notification.message}</p>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-2"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        확인
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
