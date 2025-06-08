'use client';

import { useEffect, useState } from 'react';
import { cn } from '@cargoro/ui';

import { Button } from '@cargoro/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@cargoro/ui';
// import {
//   AlertCircle,
//   AlertTriangle,
//   Info,
// } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cargoro/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@cargoro/ui';
import { Skeleton } from '@cargoro/ui';
import { Label } from '@cargoro/ui';

import { AuditLog } from '../types';

// 로그 레벨별 아이콘 설정 - 필요시 사용
// const levelIconMap: Record<AuditLogLevel, React.ReactNode> = {
//   info: <Info className="h-4 w-4 text-blue-600" />,
//   warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
//   error: <AlertCircle className="h-4 w-4 text-red-600" />,
//   critical: <AlertCircle className="h-4 w-4 text-purple-600" />,
// };

interface AuditLogDetailProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
  onExport: (id: string, format: 'json') => void;
}

export const AuditLogDetail: React.FC<AuditLogDetailProps> = ({
  log,
  isOpen,
  onClose,
  onExport,
}) => {
  const { t } = useTranslation('system-audit');
  const [activeTab, setActiveTab] = useState('details');
  const [isExporting, setIsExporting] = useState(false);

  // 탭 리셋
  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
    }
  }, [isOpen]);

  // 로그가 없거나 모달이 열려있지 않으면 렌더링 중단
  if (!isOpen) return null;

  // 시간 포맷팅
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (_error) {
      return timestamp;
    }
  };

  // JSON 데이터 렌더링
  const renderJsonData = (data: Record<string, unknown>) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (_error) {
      return '{}';
    }
  };

  // 카테고리별 아이콘 설정
  const getCategoryIcon = () => {
    if (!log) return null;

    const categoryClasses = {
      authentication: 'bg-blue-100 text-blue-800',
      authorization: 'bg-indigo-100 text-indigo-800',
      data_access: 'bg-green-100 text-green-800',
      configuration: 'bg-purple-100 text-purple-800',
      operation: 'bg-yellow-100 text-yellow-800',
      security: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={cn(
          'rounded-full px-2 py-1 text-xs font-medium',
          categoryClasses[log.category as keyof typeof categoryClasses] ||
            'bg-gray-100 text-gray-800'
        )}
      >
        {t(`category.${log.category}`)}
      </span>
    );
  };

  // 로그 내보내기
  const handleExport = async () => {
    if (!log) return;
    setIsExporting(true);
    try {
      await onExport(log.id, 'json');
    } finally {
      setIsExporting(false);
    }
  };

  // 로딩 중 스켈레톤
  if (!log) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="h-6 w-48" />
            </DialogTitle>
            <DialogDescription>
              <Skeleton className="mt-2 h-4 w-full" />
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 로그 레벨에 따른 스타일
  const getLevelStyles = () => {
    const styles = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-purple-100 text-purple-800',
    };
    return styles[log.level as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{t('detail.message_details')}</span>
            <span className={cn('rounded-full px-2 py-1 text-xs font-medium', getLevelStyles())}>
              {t(`level.${log.level}`)}
            </span>
          </DialogTitle>
          <DialogDescription>{log.message}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">상세 정보</TabsTrigger>
            <TabsTrigger value="metadata">메타데이터</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">{t('detail.timestamp')}</Label>
                <p className="text-sm">{formatTimestamp(log.timestamp)}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('detail.category')}</Label>
                <div>{getCategoryIcon()}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('detail.service')}</Label>
                <p className="text-sm">{t(`service.${log.serviceType}`)}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('detail.ip_address')}</Label>
                <p className="text-sm">{log.ipAddress}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('detail.user')}</Label>
                <p className="text-sm">{log.userName || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('detail.action')}</Label>
                <p className="text-sm">{log.category}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('detail.resource')}</Label>
                <p className="text-sm">
                  {log.resourceType} {log.resourceId ? `(${log.resourceId})` : ''}
                </p>
              </div>
            </div>

            <div>
              <Label className="mb-2 text-sm text-gray-500">{t('detail.message_details')}</Label>
              <div className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm">
                {log.details}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4 pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>키</TableHead>
                  <TableHead>값</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.metadata &&
                  Object.entries(log.metadata).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell>
                        {typeof value === 'object' ? (
                          <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                            {renderJsonData(value as Record<string, unknown>)}
                          </pre>
                        ) : (
                          String(value)
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {(!log.metadata || Object.keys(log.metadata).length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-4 text-center text-sm text-gray-500">
                      메타데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? '내보내는 중...' : t('detail.export')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
