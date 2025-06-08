'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, Calendar, Plus, Wrench } from 'lucide-react';
import Link from 'next/link';

// 테스트용 정비 중인 차량 데이터
const maintenanceVehicles = [
  {
    id: 'v-003',
    licensePlate: '서울 56다 7890',
    name: '차량 #3',
    status: 'maintenance' as const,
    location: '강남 정비소',
    technicianName: '김정비',
    startTime: '2023-05-15 09:30:00',
    estimatedCompletionTime: '2023-05-15 14:30:00',
    maintenanceType: '정기 점검',
    maintenanceItems: ['엔진 오일 교체', '필터 교체', '브레이크 패드 점검'],
    progress: 65,
  },
  {
    id: 'v-008',
    licensePlate: '경기 67바 3412',
    name: '차량 #8',
    status: 'maintenance' as const,
    location: '성남 서비스 센터',
    technicianName: '박수리',
    startTime: '2023-05-15 10:45:00',
    estimatedCompletionTime: '2023-05-16 12:00:00',
    maintenanceType: '고장 수리',
    maintenanceItems: ['배터리 교체', '전기 시스템 점검', '시동 문제 해결'],
    progress: 30,
  },
];

export default function MaintenanceVehiclesPage() {
  const [vehicles] = useState(maintenanceVehicles);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">정비 중인 차량</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            정비 일정
          </Button>
          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            정비 등록
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium text-amber-800">
              <div className="mr-2 rounded-full bg-amber-100 p-2">
                <Wrench className="h-4 w-4 text-amber-600" />
              </div>
              정비 중인 차량 {vehicles.length}대
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">
              현재 {vehicles.length}대의 차량이 정비 중입니다. 정비 현황과 예상 완료 시간을
              확인하세요.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {vehicles.map(vehicle => (
          <Card key={vehicle.id} className="overflow-hidden">
            <div className="flex items-center justify-between bg-amber-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold">{vehicle.licensePlate}</h3>
                <p className="text-sm text-gray-600">{vehicle.name}</p>
              </div>
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                정비 중 ({vehicle.progress}%)
              </Badge>
            </div>

            <CardContent className="p-6">
              <div className="mb-4">
                <div className="mb-2 h-2.5 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2.5 rounded-full bg-amber-500"
                    style={{ width: `${vehicle.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>시작: {new Date(vehicle.startTime).toLocaleString('ko-KR')}</span>
                  <span>
                    완료 예정: {new Date(vehicle.estimatedCompletionTime).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">정비소 위치</p>
                  <p>{vehicle.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">담당 정비사</p>
                  <p>{vehicle.technicianName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">정비 유형</p>
                  <p>{vehicle.maintenanceType}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">정비 항목</p>
                <div className="flex flex-wrap gap-2">
                  {vehicle.maintenanceItems.map((item, index) => (
                    <Badge key={index} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  상세 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
