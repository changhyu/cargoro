'use client';

import { useState, useEffect } from 'react';
import { useAuth, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// 임시 데이터 (추후 API 연동)
const MOCK_EXPENSES = [
  {
    id: '1',
    vehicleNumber: '서울12가3456',
    model: '제네시스 G90',
    category: '연료비',
    amount: 150000,
    date: '2024-05-20',
    description: '주유 - 휘발유 50L',
    vendor: 'GS칼텍스 강남점',
    status: '승인',
    receipt: true,
  },
  {
    id: '2',
    vehicleNumber: '서울78나9012',
    model: '포터 II',
    category: '정비비',
    amount: 850000,
    date: '2024-05-18',
    description: '엔진오일 교환, 브레이크 패드 교체',
    vendor: '서울트럭정비',
    status: '대기',
    receipt: true,
  },
  {
    id: '3',
    vehicleNumber: '경기45다6789',
    model: '스타렉스',
    category: '보험료',
    amount: 320000,
    date: '2024-05-15',
    description: '종합보험료 (월납)',
    vendor: '삼성화재',
    status: '승인',
    receipt: false,
  },
  {
    id: '4',
    vehicleNumber: '서울12가3456',
    model: '제네시스 G90',
    category: '리스료',
    amount: 1200000,
    date: '2024-05-01',
    description: '월 리스료',
    vendor: '현대캐피탈',
    status: '승인',
    receipt: true,
  },
  {
    id: '5',
    vehicleNumber: '서울78나9012',
    model: '포터 II',
    category: '통행료',
    amount: 85000,
    date: '2024-05-22',
    description: '고속도로 통행료',
    vendor: '한국도로공사',
    status: '반려',
    receipt: false,
  },
];

export default function ExpensesPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // 클라이언트 사이드에서만 리다이렉트 처리
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (!isSignedIn) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  const filteredExpenses = MOCK_EXPENSES.filter(expense => {
    const matchesCategory = selectedCategory === '전체' || expense.category === selectedCategory;
    const matchesStatus = selectedStatus === '전체' || expense.status === selectedStatus;
    const matchesSearch =
      expense.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = expenseDate >= startDate && expenseDate <= endDate;
    }

    return matchesCategory && matchesStatus && matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '승인':
        return 'bg-green-100 text-green-800';
      case '대기':
        return 'bg-yellow-100 text-yellow-800';
      case '반려':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '연료비':
        return 'bg-blue-100 text-blue-800';
      case '정비비':
        return 'bg-orange-100 text-orange-800';
      case '보험료':
        return 'bg-purple-100 text-purple-800';
      case '리스료':
        return 'bg-green-100 text-green-800';
      case '통행료':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 통계 계산
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedExpenses = filteredExpenses
    .filter(e => e.status === '승인')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const pendingCount = MOCK_EXPENSES.filter(e => e.status === '대기').length;
  const rejectedCount = MOCK_EXPENSES.filter(e => e.status === '반려').length;

  // 카테고리별 통계
  const categoryStats = MOCK_EXPENSES.reduce(
    (acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">비용 관리</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{userId}</span>
              <SignOutButton>
                <button className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700">
                  로그아웃
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <nav className="min-h-screen w-64 bg-white shadow-sm">
          <div className="p-6">
            <div className="space-y-3">
              <a href="/dashboard" className="sidebar-link-inactive">
                대시보드
              </a>
              <a href="/dashboard/vehicles" className="sidebar-link-inactive">
                차량 관리
              </a>
              <a href="/dashboard/leases" className="sidebar-link-inactive">
                리스 관리
              </a>
              <a href="/dashboard/maintenance" className="sidebar-link-inactive">
                정비 일정
              </a>
              <a href="/dashboard/expenses" className="sidebar-link-active">
                비용 관리
              </a>
            </div>
          </div>
        </nav>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          {/* 요약 통계 */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="rounded-md bg-blue-500 p-2">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 비용</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="rounded-md bg-green-500 p-2">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">승인된 비용</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(approvedExpenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="rounded-md bg-yellow-500 p-2">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">승인 대기</p>
                  <p className="text-2xl font-semibold text-gray-900">{pendingCount}건</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="rounded-md bg-red-500 p-2">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">반려</p>
                  <p className="text-2xl font-semibold text-gray-900">{rejectedCount}건</p>
                </div>
              </div>
            </div>
          </div>

          {/* 카테고리별 통계 */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-medium text-gray-900">카테고리별 비용</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {Object.entries(categoryStats).map(([category, amount]) => (
                <div key={category} className="text-center">
                  <p className="text-sm text-gray-600">{category}</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(amount)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 필터 및 검색 */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  비용 내역 검색
                </label>
                <input
                  type="text"
                  placeholder="차량번호, 업체명, 내용으로 검색..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">카테고리</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="전체">전체</option>
                  <option value="연료비">연료비</option>
                  <option value="정비비">정비비</option>
                  <option value="보험료">보험료</option>
                  <option value="리스료">리스료</option>
                  <option value="통행료">통행료</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">상태</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  <option value="전체">전체</option>
                  <option value="승인">승인</option>
                  <option value="대기">대기</option>
                  <option value="반려">반려</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">시작일</label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={dateRange.start}
                  onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">종료일</label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={dateRange.end}
                  onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectedCategory('전체');
                  setSelectedStatus('전체');
                  setSearchTerm('');
                  setDateRange({ start: '', end: '' });
                }}
              >
                필터 초기화
              </button>
              <button className="btn-primary">+ 비용 등록</button>
            </div>
          </div>

          {/* 비용 내역 목록 */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                비용 내역 ({filteredExpenses.length}건)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      차량번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      업체
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      영수증
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatDate(expense.date)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {expense.vehicleNumber}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getCategoryColor(expense.category)}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {expense.vendor}
                      </td>
                      <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        {expense.receipt ? (
                          <svg
                            className="mx-auto h-5 w-5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="mx-auto h-5 w-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(expense.status)}`}
                        >
                          {expense.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">수정</button>
                          <button className="text-green-600 hover:text-green-900">승인</button>
                          <button className="text-purple-600 hover:text-purple-900">상세</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
