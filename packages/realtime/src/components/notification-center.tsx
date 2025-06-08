'use client';

import React, { useEffect } from 'react';
import { Badge, Button, Card, ScrollArea, cn, toast } from '@cargoro/ui';
import { useRealtimeNotifications, useRealtimeEvent } from '../hooks';
import {
  Bell,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  MessageSquare,
  Wrench,
  Car,
  Package,
  Users,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@cargoro/ui';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const notificationIcons = {
  message: MessageSquare,
  work_order: Wrench,
  vehicle: Car,
  parts: Package,
  customer: Users,
  appointment: Calendar,
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

const notificationColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  message: 'text-purple-500',
  work_order: 'text-indigo-500',
  vehicle: 'text-cyan-500',
  parts: 'text-orange-500',
  customer: 'text-pink-500',
  appointment: 'text-teal-500',
};

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, clear } = useRealtimeNotifications();

  // 새 알림 토스트 표시
  useRealtimeEvent('notification', (notification: any) => {
    const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Info;

    toast({
      title: notification.title,
      description: notification.message,
      action: (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
        </div>
      ),
    });

    // 브라우저 알림 권한이 있으면 브라우저 알림도 표시
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/notification-badge.png',
        tag: notification.id,
      });
    }
  });

  // 컴포넌트 마운트 시 브라우저 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    });
  };

  const renderNotification = (notification: any) => {
    const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Info;
    const colorClass =
      notificationColors[notification.type as keyof typeof notificationColors] || 'text-gray-500';

    return (
      <Card
        key={notification.id}
        className={cn(
          'cursor-pointer p-4 transition-all hover:shadow-md',
          !notification.isRead && 'border-primary/20 bg-muted/50'
        )}
        onClick={() => handleMarkAsRead(notification.id)}
      >
        <div className="flex gap-3">
          <div className={cn('mt-1 flex-shrink-0', colorClass)}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{notification.title}</p>
              {!notification.isRead && (
                <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />
              )}
            </div>

            <p className="text-sm text-muted-foreground">{notification.message}</p>

            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.timestamp), {
                addSuffix: true,
                locale: ko,
              })}
            </p>

            {notification.action && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={e => {
                  e.stopPropagation();
                  // 액션 처리 로직
                  window.location.href = notification.action.url;
                }}
              >
                {notification.action.label}
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100"
            onClick={e => {
              e.stopPropagation();
              // 개별 알림 삭제 로직
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>알림</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto p-1 text-xs"
              >
                모두 읽음
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clear} className="h-auto p-1 text-xs">
              모두 삭제
            </Button>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p className="text-sm">새로운 알림이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">{notifications.map(renderNotification)}</div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="justify-center">
          <Button variant="ghost" size="sm" className="w-full">
            모든 알림 보기
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
