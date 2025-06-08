'use client';

import React, { useState } from 'react';
import { ChevronDown, ClipboardCheck, ClockIcon, DollarSign, Hammer, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatDate, formatNumber } from '../../../utils/format';
import { DiagnosticInfo, RepairJob, PartInfo, RepairStatus } from '../types';
import { RepairStatusTimeline } from './repair-status-timeline';
import { useUpdateRepairStatus } from '../hooks/useRepairStatusHistory';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@cargoro/ui';

// 작업 상태별 배지 색상 설정
const statusColorMap: Record<RepairStatus, string> = {
  pending: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  waiting_parts: 'bg-purple-100 text-purple-800',
};

// 작업 상태별 한글 표시
const statusKoreanMap: Record<RepairStatus, string> = {
  pending: '대기 중',
  in_progress: '진행 중',
  completed: '완료',
  cancelled: '취소됨',
  waiting_parts: '부품 대기',
};

// 작업 상태별 아이콘
const statusIconMap: Record<RepairStatus, React.ReactNode> = {
  pending: <ClockIcon className="h-4 w-4" />,
  in_progress: <Hammer className="h-4 w-4" />,
  completed: <ClipboardCheck className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  waiting_parts: <DollarSign className="h-4 w-4" />,
};

// 상태에 따른 스타일 및 아이콘 변형
const getStatusVariant = (
  status: RepairStatus
): 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'warning' => {
  const variantMap: Record<
    RepairStatus,
    'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'warning'
  > = {
    pending: 'secondary',
    in_progress: 'default',
    waiting_parts: 'warning',
    completed: 'success',
    cancelled: 'destructive',
  };

  return variantMap[status] || 'default';
};

// 탭 정의
interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

const tabs: TabItem[] = [
  { id: 'info', label: '기본 정보' },
  { id: 'status', label: '상태 변경 이력' },
  { id: 'parts', label: '부품 정보' },
  { id: 'diagnostics', label: '진단 결과' },
];

interface RepairJobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: RepairJob;
  onJobUpdated: () => void;
}

const RepairJobDetailModal: React.FC<RepairJobDetailModalProps> = ({
  isOpen,
  onClose,
  job,
  onJobUpdated,
}) => {
  const { t } = useTranslation('repair-management');
  const [activeTab, setActiveTab] = useState<string>('info');
  const [isStatusChanging, setIsStatusChanging] = useState<boolean>(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus | null>(null);
  const [statusNote, setStatusNote] = useState<string>('');

  // 상태 변경 훅 사용
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateRepairStatus();

  // 상태 변경 대화상자 열기
  const openStatusChangeDialog = (status: RepairStatus) => {
    setSelectedStatus(status);
    setStatusNote('');
    setStatusChangeDialogOpen(true);
  };

  // 상태 변경 대화상자 닫기
  const closeStatusChangeDialog = () => {
    setStatusChangeDialogOpen(false);
    setSelectedStatus(null);
  };

  // 상태 변경 대화상자에서 상태 변경 확인
  const confirmStatusChange = async () => {
    if (!selectedStatus || !job.id) {
      return;
    }

    setIsStatusChanging(true);
    try {
      await updateStatus({
        repairId: job.id,
        status: selectedStatus,
        ...(statusNote.trim() && { note: statusNote.trim() }),
      });

      // 상태 변경 후 작업 갱신
      onJobUpdated();
      closeStatusChangeDialog();
    } catch (error) {
      // 상태 변경 중 오류 처리
    } finally {
      setIsStatusChanging(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-xl">
              <span>정비 작업 상세 정보</span>
              <Badge className={statusColorMap[job.status]}>
                {statusIconMap[job.status]}
                <span className="ml-1">{statusKoreanMap[job.status]}</span>
              </Badge>
            </DialogTitle>
            <DialogDescription>
              작업 ID: {job.id} | 등록일: {formatDate(job.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex-1">
                    {tab.icon && <span className="mr-1">{tab.icon}</span>}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* 기본 정보 탭 */}
              <TabsContent value="info" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle data-testid="customer-info-title">{t('info.customer')}</CardTitle>
                    </CardHeader>
                    <CardContent data-testid="customer-info-content">
                      <div className="space-y-2">
                        <p className="font-medium">{job.customerInfo.name}</p>
                        <p>{job.customerInfo.phone}</p>
                        <p>{job.customerInfo.email}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle data-testid="technician-info-title">
                        {t('info.technician')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent data-testid="technician-info-content">
                      {job.technicianInfo ? (
                        <div className="space-y-2">
                          <p className="font-medium">{job.technicianInfo.name}</p>
                          <p>{job.technicianInfo.role}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t('info.technician.unassigned')}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle data-testid="description-title">{t('info.description')}</CardTitle>
                    </CardHeader>
                    <CardContent data-testid="description-content">
                      <p>{job.description}</p>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle data-testid="notes-title">{t('info.notes')}</CardTitle>
                    </CardHeader>
                    <CardContent data-testid="notes-content">
                      <p>{job.notes}</p>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle data-testid="cost-info-title">{t('info.cost')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4" data-testid="cost-info-content">
                        <div>
                          <p className="text-sm text-muted-foreground">{t('info.cost.labor')}</p>
                          <p className="text-xl font-semibold">{formatNumber(job.cost.labor)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('info.cost.parts')}</p>
                          <p className="text-xl font-semibold">{formatNumber(job.cost.parts)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('info.cost.total')}</p>
                          <p className="text-xl font-semibold">{formatNumber(job.cost.total)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* 상태 변경 이력 탭 */}
              <TabsContent value="status" className="p-2">
                <RepairStatusTimeline repairId={job.id} />
              </TabsContent>

              {/* 부품 정보 탭 */}
              <TabsContent value="parts" className="mt-4">
                {job.usedParts && job.usedParts.length > 0 ? (
                  <div className="space-y-4">
                    {job.usedParts.map(part => (
                      <Card key={part.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{part.name}</p>
                              <p className="text-sm text-muted-foreground">{part.partNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatNumber(part.cost)}</p>
                              <p className="text-sm text-muted-foreground">
                                {part.quantity} × {formatNumber(part.cost / part.quantity)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    이 작업에 사용된 부품이 없습니다.
                  </div>
                )}
              </TabsContent>

              {/* 진단 결과 탭 */}
              <TabsContent value="diagnostics" className="mt-4">
                {job.diagnostics && job.diagnostics.length > 0 ? (
                  <div className="space-y-4">
                    {job.diagnostics.map(diagnostic => (
                      <Card key={diagnostic.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <p className="font-semibold">{diagnostic.code}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(diagnostic.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm">{diagnostic.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    진단 결과가 없습니다.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="mt-6 flex items-center justify-between">
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isStatusChanging || isUpdatingStatus}>
                  <Button variant="outline" className="flex items-center">
                    상태 변경
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    disabled={job.status === 'pending'}
                    onClick={() => openStatusChangeDialog('pending')}
                  >
                    {statusIconMap.pending}
                    <span className="ml-2">대기 중으로 변경</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={job.status === 'in_progress'}
                    onClick={() => openStatusChangeDialog('in_progress')}
                  >
                    {statusIconMap.in_progress}
                    <span className="ml-2">진행 중으로 변경</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={job.status === 'waiting_parts'}
                    onClick={() => openStatusChangeDialog('waiting_parts')}
                  >
                    {statusIconMap.waiting_parts}
                    <span className="ml-2">부품 대기로 변경</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={job.status === 'completed'}
                    onClick={() => openStatusChangeDialog('completed')}
                  >
                    {statusIconMap.completed}
                    <span className="ml-2">완료로 변경</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={job.status === 'cancelled'}
                    onClick={() => openStatusChangeDialog('cancelled')}
                  >
                    {statusIconMap.cancelled}
                    <span className="ml-2">취소로 변경</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 상태 변경 대화상자 */}
      <AlertDialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정비 작업 상태 변경</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus && (
                <>
                  정비 작업 상태를
                  <Badge variant={getStatusVariant(selectedStatus)} className="mx-1">
                    {statusKoreanMap[selectedStatus]}
                  </Badge>
                  (으)로 변경합니다. 변경 사유를 입력해 주세요.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="상태 변경 사유 또는 메모 (선택사항)"
              className="min-h-[100px]"
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeStatusChangeDialog}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={isStatusChanging || isUpdatingStatus}
            >
              {isStatusChanging || isUpdatingStatus ? '처리 중...' : '변경하기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// 진단 결과 아이템 컴포넌트
export const DiagnosticResultItem: React.FC<{ diagnostic: DiagnosticInfo }> = ({ diagnostic }) => {
  // 심각도 정보가 없으므로 기본값 적용
  const severity = 'medium'; // 기본값으로 'medium' 설정

  const severityColorMap: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const severityKoreanMap: Record<string, string> = {
    low: '낮음',
    medium: '보통',
    high: '높음',
    critical: '심각',
  };

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <h4 className="font-medium text-gray-900">{diagnostic.code}</h4>
            <Badge className={`ml-2 ${severityColorMap[severity]}`}>
              {severityKoreanMap[severity]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">{formatDate(diagnostic.timestamp)}</p>
        </div>
        <div>
          <span className="text-sm">진단자: 시스템</span>
        </div>
      </div>
      <p className="mt-2 text-sm">{diagnostic.description}</p>
    </div>
  );
};

// 사용 부품 아이템 컴포넌트
export const UsedPartItem: React.FC<{ part: PartInfo }> = ({ part }) => {
  // 현재 재고 상태와 입고 예정일 관련 정보가 없으므로 기본값 설정
  const isAvailable = true; // 기본적으로 재고 있음으로 설정

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{part.name}</h4>
          <p className="mt-1 text-sm text-gray-500">부품번호: {part.partNumber}</p>
        </div>
        <Badge variant={isAvailable ? 'default' : 'outline'}>
          {isAvailable ? '재고 있음' : '재고 없음'}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500">단가</p>
          <p className="text-sm">{formatNumber(part.cost / part.quantity)}원</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">수량</p>
          <p className="text-sm">{part.quantity}개</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">합계</p>
          <p className="text-sm font-medium">{formatNumber(part.cost)}원</p>
        </div>
      </div>
      {/* 예상 입고일 정보가 없으므로 조건부 렌더링 제거 */}
    </div>
  );
};

// 정보 아이템 컴포넌트
export const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className="rounded-md bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
};

export default RepairJobDetailModal;
