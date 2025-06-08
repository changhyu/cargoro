import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VehicleLocationData } from '@/app/features/vehicles/vehicle-tracking/types';
import { LocationStatus } from '@cargoro/types/schema/vehicle';
import { ApiResponse } from './types';
import logger from '../../../../utils/logger';

// 이 라우트를 항상 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 테스트용 차량 위치 데이터 생성 함수
const generateVehicleLocation = (vehicleId: string): VehicleLocationData => {
  // 서울 시내 기준 랜덤 위치 생성 (테스트용)
  const baseLat = 37.5665;
  const baseLng = 126.978;
  const randomLat = baseLat + (Math.random() - 0.5) * 0.05;
  const randomLng = baseLng + (Math.random() - 0.5) * 0.05;

  // 상태 및 속도 랜덤 생성
  const statuses: LocationStatus[] = [
    LocationStatus.ACTIVE,
    LocationStatus.IDLE,
    LocationStatus.MAINTENANCE,
  ];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const speed = randomStatus === LocationStatus.ACTIVE ? Math.floor(Math.random() * 60) + 10 : 0;

  return {
    vehicleId,
    latitude: randomLat,
    longitude: randomLng,
    speed,
    heading: Math.floor(Math.random() * 360),
    timestamp: new Date().toISOString(),
    // status 값이 undefined일 경우 기본값 설정
    status: randomStatus || LocationStatus.IDLE,
  };
};

/**
 * 차량 위치 정보를 제공하는 API 라우트 핸들러
 * GET /api/vehicles/[id]/location
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 인증 체크
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const vehicleId = params.id;

    // 실제 구현에서는 여기서 GPS 추적 서비스나 DB에서 데이터를 가져와야 합니다.
    // 현재는 테스트를 위해 가상 데이터를 생성합니다.
    const locationData = generateVehicleLocation(vehicleId);

    return NextResponse.json<ApiResponse<{ location: VehicleLocationData }>>({
      status: 'success',
      data: {
        location: locationData,
      },
    });
  } catch (error) {
    logger.error('차량 위치 정보 조회 오류:', error);

    return NextResponse.json<ApiResponse<never>>(
      {
        status: 'error',
        error: {
          code: 'LOCATION_FETCH_ERROR',
          message: '차량 위치 정보를 불러오는데 실패했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
