import { NextResponse } from 'next/server';

/**
 * 사용자 권한 서비스 API 라우트 (간소화 버전)
 */

export async function GET(_request: Request, _params: { params: { id: string } }) {
  try {
    // 임시 모킹 데이터
    const permissions = ['admin', 'user:read', 'user:write'];

    return NextResponse.json({ permissions });
  } catch (_error) {
    return NextResponse.json({ error: '권한 정보를 가져올 수 없습니다.' }, { status: 500 });
  }
}

export async function PUT(_request: Request, _params: { params: { id: string } }) {
  try {
    return NextResponse.json({
      success: true,
      message: '권한이 업데이트되었습니다.',
    });
  } catch (_error) {
    return NextResponse.json({ error: '권한을 업데이트할 수 없습니다.' }, { status: 500 });
  }
}
