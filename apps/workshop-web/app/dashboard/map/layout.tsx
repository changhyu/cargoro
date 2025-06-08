import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '차량 위치 지도 | 카고로',
  description: '실시간으로 차량 위치를 추적하는 지도입니다.',
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <section className="h-full">{children}</section>;
}
