import { redirect } from 'next/navigation';

export default function Home() {
  // 메인 페이지 접속 시 렌터카/리스 대시보드로 리다이렉트
  redirect('/features/rental');
}
