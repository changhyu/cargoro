'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ScrollArea,
  cn,
} from '@cargoro/ui';
import { useRealtimeRoom, useTypingIndicator } from '../hooks';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  MoreVertical,
  Phone,
  Video,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
}

export function ChatRoom({
  roomId,
  roomName,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: ChatRoomProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, unreadCount, sendMessage, markAsRead } = useRealtimeRoom(roomId);

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(roomId);

  // 메시지가 추가될 때 스크롤을 맨 아래로
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // 채팅방 진입 시 읽음 처리
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  const handleSendMessage = () => {
    if (message.trim() && !isComposing) {
      sendMessage(message.trim());
      setMessage('');
      stopTyping();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const renderMessage = (msg: any) => {
    const isCurrentUser = msg.userId === currentUserId;
    const showAvatar =
      !isCurrentUser &&
      (messages.indexOf(msg) === 0 || messages[messages.indexOf(msg) - 1]?.userId !== msg.userId);

    return (
      <div key={msg.id} className={cn('mb-4 flex gap-3', isCurrentUser && 'flex-row-reverse')}>
        {showAvatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={msg.userAvatar} />
            <AvatarFallback>{msg.userName?.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8" />
        )}

        <div className={cn('flex max-w-[70%] flex-col gap-1')}>
          {showAvatar && !isCurrentUser && (
            <span className="pl-3 text-xs text-muted-foreground">{msg.userName}</span>
          )}

          <div
            className={cn(
              'rounded-2xl px-4 py-2',
              isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>

            {msg.attachments?.map((attachment: any) => (
              <div key={attachment.id} className="mt-2">
                {attachment.type === 'image' && (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-w-full rounded-lg"
                  />
                )}
                {attachment.type === 'file' && (
                  <div className="flex items-center gap-2 rounded bg-background/50 p-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">{attachment.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <span className="px-3 text-xs text-muted-foreground">
            {format(new Date(msg.timestamp), 'p', { locale: ko })}
          </span>
        </div>
      </div>
    );
  };

  const renderDateDivider = (date: Date) => (
    <div className="my-4 flex items-center gap-4">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{format(date, 'PPP', { locale: ko })}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );

  // 날짜별로 메시지 그룹화
  const messagesByDate = messages.reduce((acc: any, msg: any) => {
    const date = format(new Date(msg.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{roomName}</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          {Object.entries(messagesByDate).map(([date, msgs]: [string, any]) => (
            <div key={date}>
              {renderDateDivider(new Date(date))}
              {msgs.map(renderMessage)}
            </div>
          ))}

          {typingUsers.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span>
                {typingUsers.join(', ')}
                {typingUsers.length === 1 ? '님이' : '님들이'} 입력 중...
              </span>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <div className="border-t p-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button type="button" variant="ghost" size="icon">
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Input
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
          />

          <Button type="submit" size="icon" disabled={!message.trim() || isComposing}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
