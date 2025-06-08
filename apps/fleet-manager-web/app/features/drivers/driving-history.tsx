'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Gauge,
  Route,
  AlertTriangle,
  CheckCircle,
  Play,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from '@cargoro/ui';

import {
  Driver,
  DrivingRecord,
  ViolationRecord,
  drivingRecordService,
} from '../../../services/api';

// ViolationRecord 타입 확장 (details 속성 포함)
interface ViolationRecordWithDetails extends ViolationRecord {
  details?: string;
}

interface DrivingHistoryProps {
  driver: Driver;
}

export default function DrivingHistory({ driver }: DrivingHistoryProps) {
  const { toast } = useToast();
  const [records, setRecords] = useState<DrivingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('30'); // 최근 30일
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<DrivingRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // 운행 이력 조회
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(dateFilter));

        const filters = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: statusFilter !== 'all' ? statusFilter : undefined,
        };

        const recordsData = await drivingRecordService.getRecordsByDriver(driver.id, filters);
        setRecords(recordsData);
      } catch (_error) {
        toast({
          title: '오류',
          description: '운행 이력을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [driver.id, dateFilter, statusFilter, toast]);

  // 상태별 색상
  const getStatusColor = (status: DrivingRecord['status']) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 상태별 라벨
  const getStatusLabel = (status: DrivingRecord['status']) => {
    switch (status) {
      case 'ongoing':
        return '운행중';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소';
      default:
        return status;
    }
  };

  // 운행 시간 계산
  const getDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60)); // 분 단위

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  // 위반 사항 개수
  const getViolationCount = (violations?: DrivingRecord['violations']) => {
    if (!violations) return 0;
    return violations.length;
  };

  // 상세 정보 보기
  const handleViewDetail = (record: DrivingRecord) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  // 통계 계산
  const stats = {
    total: records.length,
    completed: records.filter(r => r.status === 'completed').length,
    ongoing: records.filter(r => r.status === 'ongoing').length,
    totalDistance: records.filter(r => r.distance).reduce((sum, r) => sum + (r.distance || 0), 0),
    totalViolations: records.reduce((sum, r) => sum + getViolationCount(r.violations), 0),
    averageSpeed: records
      .filter(r => r.averageSpeed)
      .reduce((sum, r, _, arr) => sum + (r.averageSpeed || 0) / arr.length, 0),
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Route className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">총 운행</p>
                <p className="text-xl font-bold">{stats.total}회</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">완료</p>
                <p className="text-xl font-bold">{stats.completed}회</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">총 거리</p>
                <p className="text-xl font-bold">{stats.totalDistance.toFixed(1)}km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">평균 속도</p>
                <p className="text-xl font-bold">{stats.averageSpeed.toFixed(1)}km/h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">위반 건수</p>
                <p className="text-xl font-bold">{stats.totalViolations}건</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 컨트롤 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              운행 이력
            </div>
            <div className="flex items-center space-x-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">최근 7일</SelectItem>
                  <SelectItem value="30">최근 30일</SelectItem>
                  <SelectItem value="90">최근 90일</SelectItem>
                  <SelectItem value="365">최근 1년</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="ongoing">운행중</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                내보내기
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="py-8 text-center">
              <Route className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">운행 이력이 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>운행 일시</TableHead>
                  <TableHead>차량</TableHead>
                  <TableHead>출발지 → 도착지</TableHead>
                  <TableHead>거리/시간</TableHead>
                  <TableHead>평균속도</TableHead>
                  <TableHead>위반</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {new Date(record.startTime).toLocaleDateString('ko-KR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.startTime).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {record.vehicle?.make} {record.vehicle?.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.vehicle?.plateNumber}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="max-w-[150px] truncate">
                            {record.startLocation?.address || '출발지'}
                          </span>
                        </div>
                        {record.endLocation && (
                          <div className="flex items-center text-sm">
                            <div className="mr-2 h-2 w-2 rounded-full bg-red-500"></div>
                            <span className="max-w-[150px] truncate">
                              {record.endLocation.address || '도착지'}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        {record.distance && (
                          <p className="font-medium">{record.distance.toFixed(1)}km</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {getDuration(record.startTime, record.endTime)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {record.averageSpeed && (
                        <div className="flex items-center">
                          <Gauge className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{record.averageSpeed.toFixed(1)}km/h</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {getViolationCount(record.violations) > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {getViolationCount(record.violations)}건
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          없음
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {record.status === 'ongoing' && <Play className="h-3 w-3 text-blue-500" />}
                        <Badge className={`text-xs ${getStatusColor(record.status)}`}>
                          {getStatusLabel(record.status)}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(record)}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 상세 정보 다이얼로그 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>운행 상세 정보</DialogTitle>
            <DialogDescription>
              {selectedRecord && new Date(selectedRecord.startTime).toLocaleString('ko-KR')} 운행
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">운행 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">시작 시간:</span>
                      <span>{new Date(selectedRecord.startTime).toLocaleString('ko-KR')}</span>
                    </div>
                    {selectedRecord.endTime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">종료 시간:</span>
                        <span>{new Date(selectedRecord.endTime).toLocaleString('ko-KR')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">운행 시간:</span>
                      <span>{getDuration(selectedRecord.startTime, selectedRecord.endTime)}</span>
                    </div>
                    {selectedRecord.purpose && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">운행 목적:</span>
                        <span>{selectedRecord.purpose}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">차량 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">차량:</span>
                      <span>
                        {selectedRecord.vehicle?.make} {selectedRecord.vehicle?.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">번호판:</span>
                      <span>{selectedRecord.vehicle?.plateNumber}</span>
                    </div>
                    {selectedRecord.distance && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">주행 거리:</span>
                        <span>{selectedRecord.distance.toFixed(1)}km</span>
                      </div>
                    )}
                    {selectedRecord.fuelConsumption && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">연료 소모:</span>
                        <span>{selectedRecord.fuelConsumption.toFixed(1)}L</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 속도 정보 */}
              {(selectedRecord.averageSpeed || selectedRecord.maxSpeed) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">속도 정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRecord.averageSpeed && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">평균 속도:</span>
                          <span>{selectedRecord.averageSpeed.toFixed(1)}km/h</span>
                        </div>
                      )}
                      {selectedRecord.maxSpeed && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">최고 속도:</span>
                          <span>{selectedRecord.maxSpeed.toFixed(1)}km/h</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 위반 사항 */}
              {selectedRecord.violations && selectedRecord.violations.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm">
                      <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                      위반 사항 ({selectedRecord.violations.length}건)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedRecord.violations.map((violation, index) => {
                        const violationWithDetails = violation as ViolationRecordWithDetails;
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-red-50 p-3"
                          >
                            <div>
                              <p className="font-medium text-red-800">
                                {violationWithDetails.type === 'speeding' && '과속'}
                                {violationWithDetails.type === 'harsh_braking' && '급제동'}
                                {violationWithDetails.type === 'harsh_acceleration' && '급가속'}
                                {violationWithDetails.type === 'sharp_turn' && '급회전'}
                              </p>
                              <p className="text-sm text-red-600">
                                {new Date(violationWithDetails.timestamp).toLocaleString('ko-KR')}
                              </p>
                              {violationWithDetails.details && (
                                <p className="text-sm text-red-600">
                                  {violationWithDetails.details}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={
                                violationWithDetails.severity === 'high'
                                  ? 'destructive'
                                  : violationWithDetails.severity === 'medium'
                                    ? 'default'
                                    : 'secondary'
                              }
                              className="text-xs"
                            >
                              {violationWithDetails.severity === 'high' && '심각'}
                              {violationWithDetails.severity === 'medium' && '보통'}
                              {violationWithDetails.severity === 'low' && '경미'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
