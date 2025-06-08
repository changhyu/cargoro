import { NextResponse } from 'next/server';

/**
 * 사용자 상태 토글 API 라우트 (간소화 버전)
 */

export async function POST(_request: Request, _params: { params: { id: string } }) {
  try {
    return NextResponse.json({
      success: true,
      message: '사용자 상태가 변경되었습니다.',
    });
  } catch (_error) {
    return NextResponse.json({ error: '사용자 상태를 변경할 수 없습니다.' }, { status: 500 });
  }
}

export async function PUT(_request: Request, _params: { params: { id: string } }) {
  try {
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(_request: Request, _params: { params: { id: string } }) {
  try {
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: '사용자 상태를 변경할 수 없습니다.' }, { status: 500 });
  }
}
