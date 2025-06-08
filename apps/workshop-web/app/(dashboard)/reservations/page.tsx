/**
 * 예약 관리 페이지
 */
import { ReservationList, CreateReservationModal } from '../../features/reservation-management';

// 동적 렌더링 강제 (Clerk 인증 때문에 SSG 불가능)
export const dynamic = 'force-dynamic';

export default function ReservationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">예약 관리</h1>
        <CreateReservationModal />
      </div>
      <ReservationList />
    </div>
  );
}
