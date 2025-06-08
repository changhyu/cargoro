import { Metadata } from 'next';

import DriverManagementDashboard from '../../../features/drivers/driver-management-dashboard';

export const metadata: Metadata = {
  title: '운전자 관리 대시보드 | 카고로',
  description: '운전자 알림, 면허증 만료, 성과 관리 및 데이터 내보내기를 통합적으로 관리합니다.',
};

export default function DriverManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <DriverManagementDashboard />
    </div>
  );
}
