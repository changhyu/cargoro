'use client';

import { useState } from 'react';
import { useToast } from '@cargoro/ui';
import { Button } from '@cargoro/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@cargoro/ui/card';
import { Checkbox } from '@cargoro/ui/checkbox';
import { useSyncWithErp } from '../hooks';

interface ErpSyncPanelProps {
  onSyncComplete?: () => void;
}

export function ErpSyncPanel({ onSyncComplete }: ErpSyncPanelProps) {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncOptions, setSyncOptions] = useState({
    syncParts: true,
    syncSuppliers: true,
    syncPrices: true,
    syncQuantities: true,
  });
  const { toast } = useToast();
  const erpSync = useSyncWithErp();

  const handleSyncOptionChange = (option: keyof typeof syncOptions) => {
    setSyncOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleSync = async () => {
    // 최소한 하나의 옵션이 선택되어 있는지 확인
    if (!Object.values(syncOptions).some(value => value)) {
      toast({
        title: '오류',
        description: '최소한 하나의 동기화 옵션을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSyncInProgress(true);

      // 동기화 요청 데이터 준비
      const syncRequest = {
        syncParts: syncOptions.syncParts,
        syncSuppliers: syncOptions.syncSuppliers,
        syncPrices: syncOptions.syncPrices,
        syncQuantities: syncOptions.syncQuantities,
        timestamp: new Date().toISOString(),
      };

      const response = await erpSync.mutateAsync(syncRequest);

      // 성공 처리
      setLastSyncTime(new Date().toLocaleString());

      // response가 ErpSyncResponse 타입인지 확인
      interface ErpSyncResponse {
        data?: { syncedCount?: number };
        syncedCount?: number;
      }
      const syncedCount =
        (response as ErpSyncResponse)?.data?.syncedCount ||
        (response as ErpSyncResponse)?.syncedCount ||
        0;

      toast({
        title: '동기화 완료',
        description: `${syncedCount}개의 항목이 성공적으로 동기화되었습니다.`,
        variant: 'default',
      });

      // 동기화 완료 콜백 호출
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      // 오류 처리
      toast({
        title: '동기화 실패',
        description: 'ERP 시스템과의 동기화 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      // 로그는 production에서 제거되어야 함
    } finally {
      setSyncInProgress(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ERP 시스템 동기화</CardTitle>
        <CardDescription>재고 및 부품 정보를 ERP 시스템과 동기화합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sync-parts"
              checked={syncOptions.syncParts}
              onCheckedChange={() => handleSyncOptionChange('syncParts')}
            />
            <label htmlFor="sync-parts" className="text-sm font-medium">
              부품 정보 동기화
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sync-suppliers"
              checked={syncOptions.syncSuppliers}
              onCheckedChange={() => handleSyncOptionChange('syncSuppliers')}
            />
            <label htmlFor="sync-suppliers" className="text-sm font-medium">
              공급업체 정보 동기화
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sync-prices"
              checked={syncOptions.syncPrices}
              onCheckedChange={() => handleSyncOptionChange('syncPrices')}
            />
            <label htmlFor="sync-prices" className="text-sm font-medium">
              가격 정보 동기화
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sync-quantities"
              checked={syncOptions.syncQuantities}
              onCheckedChange={() => handleSyncOptionChange('syncQuantities')}
            />
            <label htmlFor="sync-quantities" className="text-sm font-medium">
              재고 수량 동기화
            </label>
          </div>
          {lastSyncTime && (
            <p className="mt-4 text-sm text-gray-500">마지막 동기화: {lastSyncTime}</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSync} disabled={syncInProgress} className="w-full">
          {syncInProgress ? '동기화 중...' : 'ERP 동기화 시작'}
        </Button>
      </CardFooter>
    </Card>
  );
}
