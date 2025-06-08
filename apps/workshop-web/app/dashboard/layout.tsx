import { DashboardLayout } from '../components/dashboard-layout';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  // 인증 확인은 클라이언트 컴포넌트인 DashboardLayout에서 처리됨
  return <DashboardLayout>{children}</DashboardLayout>;
}
