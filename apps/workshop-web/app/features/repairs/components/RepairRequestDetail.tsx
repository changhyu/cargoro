'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from '@cargoro/ui';
import { User, Car, DollarSign, FileText, Edit, Save, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

interface RepairRequestDetailProps {
  requestId: string;
}

// 정비 요청 상세 타입
interface RepairRequestDetail {
  id: string;
  requestNumber: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  vehicle: {
    id: string;
    vehicleNumber: string;
    model: string;
    manufacturer: string;
    year: number;
    mileage?: number;
  };
  description: string;
  symptoms: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  technician?: {
    id: string;
    name: string;
  };
  scheduledDate?: string;
  startDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  diagnosis?: string;
  repairNotes?: string;
  partsUsed?: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}

// 상태별 뱃지 색상
const statusColors = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
} as const;

// 우선순위별 뱃지 색상
const priorityColors = {
  LOW: 'secondary',
  NORMAL: 'default',
  HIGH: 'warning',
  URGENT: 'destructive',
} as const;

// 상태 한글 매핑
const statusLabels = {
  PENDING: '대기중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

// 우선순위 한글 매핑
const priorityLabels = {
  LOW: '낮음',
  NORMAL: '보통',
  HIGH: '높음',
  URGENT: '긴급',
};

export function RepairRequestDetail({ requestId }: RepairRequestDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<RepairRequestDetail>>({});

  // 정비 요청 상세 조회
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['repairRequest', requestId],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch(`/api/repair-requests/${requestId}`)
      // return response.json()

      // 임시 더미 데이터
      return {
        id: requestId,
        requestNumber: 'REQ-202501-001',
        customer: {
          id: '1',
          name: '김철수',
          phone: '010-1234-5678',
          email: 'kim@example.com',
        },
        vehicle: {
          id: '1',
          vehicleNumber: '12가 3456',
          model: '소나타',
          manufacturer: '현대',
          year: 2020,
          mileage: 45000,
        },
        description: '엔진 이상음 발생',
        symptoms: ['시동시 이상음', '가속시 진동', '연비 감소'],
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        technician: {
          id: '1',
          name: '박기술',
        },
        scheduledDate: '2025-01-10T10:00:00',
        startDate: '2025-01-10T10:30:00',
        estimatedCost: 500000,
        diagnosis: '엔진 마운트 교체 필요',
        repairNotes: '엔진 마운트 노후로 인한 진동 발생',
        partsUsed: [
          {
            name: '엔진 마운트',
            quantity: 2,
            unitPrice: 150000,
          },
        ],
        createdAt: '2025-01-08T09:00:00',
        updatedAt: '2025-01-10T11:00:00',
      } as RepairRequestDetail;
    },
  });

  // 정비 요청 업데이트
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RepairRequestDetail>) => {
      // TODO: 실제 API 호출로 변경
      // 디버깅 로그는 프로덕션에서 제거
      return data;
    },
    onSuccess: () => {
      toast.success('정비 요청이 업데이트되었습니다');
      setIsEditing(false);
      refetch();
    },
    onError: () => {
      toast.error('업데이트에 실패했습니다');
    },
  });

  const handleEdit = () => {
    setFormData(data || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">로딩중...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-destructive">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.requestNumber}</h1>
          <p className="text-muted-foreground">
            등록일: {format(new Date(data.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                취소
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                저장
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">상태</span>
              {isEditing ? (
                <Select
                  value={formData.status}
                  onValueChange={value =>
                    setFormData({ ...formData, status: value as RepairRequestDetail['status'] })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">대기중</SelectItem>
                    <SelectItem value="IN_PROGRESS">진행중</SelectItem>
                    <SelectItem value="COMPLETED">완료</SelectItem>
                    <SelectItem value="CANCELLED">취소됨</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={statusColors[data.status]}>{statusLabels[data.status]}</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">우선순위</span>
              {isEditing ? (
                <Select
                  value={formData.priority}
                  onValueChange={value =>
                    setFormData({ ...formData, priority: value as RepairRequestDetail['priority'] })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">낮음</SelectItem>
                    <SelectItem value="NORMAL">보통</SelectItem>
                    <SelectItem value="HIGH">높음</SelectItem>
                    <SelectItem value="URGENT">긴급</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={priorityColors[data.priority]}>
                  {priorityLabels[data.priority]}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">담당 기술자</span>
              <span className="text-sm">{data.technician?.name || '미배정'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">예약일시</span>
              <span className="text-sm">
                {data.scheduledDate
                  ? format(new Date(data.scheduledDate), 'MM/dd HH:mm', { locale: ko })
                  : '미정'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 고객 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              고객 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">이름</span>
              <span className="text-sm">{data.customer.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">전화번호</span>
              <span className="text-sm">{data.customer.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">이메일</span>
              <span className="text-sm">{data.customer.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* 차량 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              차량 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">차량번호</span>
              <span className="text-sm">{data.vehicle.vehicleNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">차종</span>
              <span className="text-sm">
                {data.vehicle.manufacturer} {data.vehicle.model}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">연식</span>
              <span className="text-sm">{data.vehicle.year}년</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">주행거리</span>
              <span className="text-sm">{data.vehicle.mileage?.toLocaleString() || '-'} km</span>
            </div>
          </CardContent>
        </Card>

        {/* 증상 및 진단 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              증상 및 진단
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>증상</Label>
              <div className="mt-1 space-y-1">
                {data.symptoms.map((symptom, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>진단</Label>
              {isEditing ? (
                <Textarea
                  value={formData.diagnosis || ''}
                  onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-sm">{data.diagnosis || '진단 내용 없음'}</p>
              )}
            </div>
            <div>
              <Label>정비 노트</Label>
              {isEditing ? (
                <Textarea
                  value={formData.repairNotes || ''}
                  onChange={e => setFormData({ ...formData, repairNotes: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-sm">{data.repairNotes || '정비 노트 없음'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 사용 부품 및 비용 */}
      {data.partsUsed && data.partsUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              사용 부품 및 비용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left text-sm font-medium">부품명</th>
                      <th className="p-2 text-center text-sm font-medium">수량</th>
                      <th className="p-2 text-right text-sm font-medium">단가</th>
                      <th className="p-2 text-right text-sm font-medium">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.partsUsed.map((part, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 text-sm">{part.name}</td>
                        <td className="p-2 text-center text-sm">{part.quantity}</td>
                        <td className="p-2 text-right text-sm">
                          ₩{part.unitPrice.toLocaleString()}
                        </td>
                        <td className="p-2 text-right text-sm font-medium">
                          ₩{(part.quantity * part.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="p-2 text-right font-medium">
                        예상 비용
                      </td>
                      <td className="p-2 text-right font-bold">
                        ₩{data.estimatedCost?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
