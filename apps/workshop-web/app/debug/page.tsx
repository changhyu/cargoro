export default function DebugPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>환경 변수 디버그</h1>
      <div
        style={{
          backgroundColor: '#f3f4f6',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '1rem',
        }}
      >
        <p>
          <strong>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</strong>
        </p>
        <p>{publishableKey ? `설정됨 (${publishableKey.substring(0, 20)}...)` : '설정되지 않음'}</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <p>Clerk 키가 설정되지 않았다면:</p>
        <ol>
          <li>.env.local 파일 생성</li>
          <li>Clerk 대시보드에서 키 복사</li>
          <li>개발 서버 재시작</li>
        </ol>
      </div>
    </div>
  );
}
