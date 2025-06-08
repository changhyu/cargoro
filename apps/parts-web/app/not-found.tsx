export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-800">404</h1>
        <h2 className="mb-3 text-2xl font-medium text-gray-600">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-500">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      </div>
      <a href="/" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        홈으로 돌아가기
      </a>
    </div>
  );
}
