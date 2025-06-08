/**
 * 기업 차량 관리 페이지
 */

import { Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/Breadcrumb';

// 임시 컴포넌트로 대체 (원본 컴포넌트를 찾을 수 없는 경우)
function VehicleFleetManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>차량 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <p>차량 관리 기능이 곧 제공될 예정입니다.</p>
      </CardContent>
    </Card>
  );
}

export default function VehicleManagementPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">
            <Home className="mr-1 h-4 w-4" />
            대시보드
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/vehicle-management">차량 관리</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <VehicleFleetManagement />
    </div>
  );
}
