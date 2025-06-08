import DashboardClient from '../(dashboard)/dashboard-client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 인증 확인은 클라이언트 컴포넌트인 DashboardClient에서 처리
  return <DashboardClient>{children}</DashboardClient>;
}
