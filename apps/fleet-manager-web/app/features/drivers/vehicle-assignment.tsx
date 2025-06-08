'use client';

// types 패키지의 VehicleAssignment 타입을 확장하여 사용

import React, { useState, useEffect } from 'react';
import { Car, Plus, Trash2, Search, Calendar, CheckCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  useToast,
} from '@cargoro/ui';

import { Driver, Vehicle, driverService, vehicleAssignmentService } from '../../../services/api';

// API 서비스에서 사용하는 VehicleAssignment 타입과 공유 패키지의 타입을 혼합하지 않고 별도 정의
interface VehicleAssignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignedAt: string;
  unassignedAt?: string;
  isActive: boolean;
  assignedBy?: string;
  createdAt?: string;
  vehicle?: {
    make: string;
    model: string;
    plateNumber: string;
    type?: string;
  };
}

interface VehicleAssignmentProps {
  driver: Driver;
  onUpdate?: () => void;
}

export default function VehicleAssignment({ driver, onUpdate }: VehicleAssignmentProps) {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assigning, setAssigning] = useState(false);

  // 배정된 차량 목록과 사용 가능한 차량 목록 조회
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assignmentsData, availableData] = await Promise.all([
          vehicleAssignmentService.getAssignmentsByDriver(driver.id),
          vehicleAssignmentService.getAvailableVehicles(),
        ]);
        setAssignments(assignmentsData);
        setAvailableVehicles(availableData);
      } catch (_error) {
        toast({
          title: '오류',
          description: '차량 배정 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [driver.id, toast]);

  // 차량 배정
  const handleAssignVehicle = async () => {
    if (!selectedVehicle) {
      toast({
        title: '알림',
        description: '배정할 차량을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setAssigning(true);
    try {
      await driverService.assignVehicle(driver.id, selectedVehicle);

      // 배정 목록 새로고침
      const updatedAssignments = await vehicleAssignmentService.getAssignmentsByDriver(driver.id);
      setAssignments(updatedAssignments);

      // 사용 가능한 차량 목록 새로고침
      const updatedAvailable = await vehicleAssignmentService.getAvailableVehicles();
      setAvailableVehicles(updatedAvailable);

      toast({
        title: '배정 완료',
        description: '차량이 성공적으로 배정되었습니다.',
      });

      setAssignDialogOpen(false);
      setSelectedVehicle('');
      onUpdate?.();
    } catch (_error) {
      toast({
        title: '오류',
        description: '차량 배정에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  // 차량 배정 해제
  const handleUnassignVehicle = async (vehicleId: string, vehicleName: string) => {
    if (!confirm(`${vehicleName} 차량의 배정을 해제하시겠습니까?`)) return;

    try {
      await driverService.unassignVehicle(driver.id, vehicleId);

      // 배정 목록 새로고침
      const updatedAssignments = await vehicleAssignmentService.getAssignmentsByDriver(driver.id);
      setAssignments(updatedAssignments);

      // 사용 가능한 차량 목록 새로고침
      const updatedAvailable = await vehicleAssignmentService.getAvailableVehicles();
      setAvailableVehicles(updatedAvailable);

      toast({
        title: '배정 해제 완료',
        description: `${vehicleName} 차량의 배정이 해제되었습니다.`,
      });

      onUpdate?.();
    } catch (_error) {
      toast({
        title: '오류',
        description: '차량 배정 해제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 필터링된 사용 가능한 차량 목록
  const filteredAvailableVehicles = availableVehicles.filter(
    vehicle =>
      (vehicle.make?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vehicle.model?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vehicle.plateNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Car className="mr-2 h-5 w-5" />
            배정된 차량 ({assignments.filter(a => a.isActive).length}대)
          </div>
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                차량 배정
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>차량 배정</DialogTitle>
                <DialogDescription>
                  {driver.name} 운전자에게 배정할 차량을 선택해주세요.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* 검색창 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="차량명, 모델, 번호판으로 검색..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>

                {/* 사용 가능한 차량 목록 */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredAvailableVehicles.length === 0 ? (
                    <div className="py-8 text-center">
                      <Car className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">배정 가능한 차량이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAvailableVehicles.map(vehicle => (
                        <div
                          key={vehicle.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedVehicle === vehicle.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedVehicle(vehicle.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {vehicle.make} {vehicle.model} ({vehicle.year})
                              </p>
                              <p className="text-sm text-muted-foreground">
                                번호판: {vehicle.plateNumber}
                              </p>
                              {vehicle.type && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {vehicle.type}
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={vehicle.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {vehicle.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAssignDialogOpen(false);
                    setSelectedVehicle('');
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleAssignVehicle} disabled={!selectedVehicle || assigning}>
                  {assigning ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                  ) : null}
                  배정
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assignments.filter(a => a.isActive).length === 0 ? (
          <div className="py-8 text-center">
            <Car className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">배정된 차량이 없습니다.</p>
            <Button className="mt-4" size="sm" onClick={() => setAssignDialogOpen(true)}>
              차량 배정하기
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>차량 정보</TableHead>
                <TableHead>배정일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments
                .filter(assignment => assignment.isActive)
                .map(assignment => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {assignment.vehicle?.make} {assignment.vehicle?.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.vehicle?.plateNumber}
                        </p>
                        {assignment.vehicle?.type && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {assignment.vehicle.type}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(assignment.assignedAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge variant="default">배정됨</Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleUnassignVehicle(
                            assignment.vehicleId,
                            `${assignment.vehicle?.make} ${assignment.vehicle?.model}`
                          )
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        배정 해제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}

        {/* 배정 이력 */}
        {assignments.filter(a => !a.isActive).length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 font-medium text-muted-foreground">배정 이력</h4>
            <div className="space-y-2">
              {assignments
                .filter(assignment => !assignment.isActive)
                .slice(0, 3)
                .map(assignment => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {assignment.vehicle?.make} {assignment.vehicle?.model}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(assignment.assignedAt).toLocaleDateString('ko-KR')} ~{' '}
                          {assignment.unassignedAt
                            ? new Date(assignment.unassignedAt).toLocaleDateString('ko-KR')
                            : '현재'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      배정 해제됨
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
