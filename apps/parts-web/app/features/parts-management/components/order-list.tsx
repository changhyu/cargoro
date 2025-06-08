'use client';

import { useState } from 'react';
import { useToast } from '@cargoro/ui';

import Link from 'next/link';

import { formatCurrency, formatDate } from '@/utils/formatters';
import { useGetOrders, useUpdateOrderStatus } from '../hooks';
import { OrderStatus, Order } from '../types';

interface OrderListProps {
  orders?: Order[];
  isLoading?: boolean;
  onStatusChange?: () => void;
}

export function OrderList({
  orders: propOrders,
  isLoading: propIsLoading,
  onStatusChange,
}: OrderListProps) {
  const {
    data: fetchedOrdersData,
    isLoading: fetchIsLoading,
    error,
  } = useGetOrders(undefined, {
    enabled: !propOrders, // 외부에서 orders를 받으면 자체 쿼리는 비활성화
  });

  interface OrdersData {
    data?: { orders?: Order[] };
    orders?: Order[];
  }
  const fetchedOrders =
    (fetchedOrdersData as OrdersData)?.data?.orders || (fetchedOrdersData as OrdersData)?.orders;
  const updateOrderStatus = useUpdateOrderStatus();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // props 또는 자체 fetch 데이터 사용
  const orders = propOrders || fetchedOrders;
  const isLoading = propIsLoading !== undefined ? propIsLoading : fetchIsLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
        role="alert"
      >
        <strong className="font-bold">오류!</strong>
        <span className="block sm:inline"> 주문 데이터를 불러오는 데 실패했습니다.</span>
      </div>
    );
  }

  // 필터링 및 검색 로직
  const filteredOrders = orders?.filter((order: Order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof order.supplier === 'object' && order.supplier?.name
        ? order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
        : (typeof order.supplier === 'string' ? order.supplier : '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  // 주문 상태 변경 핸들러
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
      onStatusChange?.();
    } catch {
      // 오류 처리
      toast({
        title: '오류',
        description: '주문 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">부품 주문 관리</h2>

        <div className="flex flex-col gap-4 md:flex-row">
          {/* 검색창 */}
          <div className="relative">
            <input
              type="text"
              placeholder="주문번호 또는 공급업체 검색..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* 상태 필터 */}
          <select
            className="rounded-md border border-gray-300 px-3 py-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">모든 상태</option>
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* 주문 생성 버튼 */}
          <Link
            href="/dashboard/orders/create"
            className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            새 주문 생성
          </Link>
        </div>
      </div>

      {/* 주문 테이블 */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                주문번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                공급업체
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                주문일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                예상 배송일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                총액
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
            {filteredOrders && filteredOrders.length > 0 ? (
              filteredOrders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {typeof order.supplier === 'object' && order.supplier?.name
                      ? order.supplier.name
                      : '공급업체 정보 없음'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatCurrency(order.total || 0)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5
                        ${order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${order.status === OrderStatus.APPROVED ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === OrderStatus.ORDERED ? 'bg-indigo-100 text-indigo-800' : ''}
                        ${order.status === OrderStatus.RECEIVED ? 'bg-green-100 text-green-800' : ''}
                        ${order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        상세보기
                      </Link>

                      {/* 상태 변경 드롭다운 */}
                      {order.status !== OrderStatus.RECEIVED &&
                        order.status !== OrderStatus.CANCELLED && (
                          <div className="relative inline-block text-left">
                            <select
                              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700"
                              value={order.status}
                              onChange={e =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                            >
                              <option value={order.status}>상태 변경</option>
                              {Object.values(OrderStatus)
                                .filter(status => status !== order.status)
                                .map(status => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm || statusFilter
                    ? '검색 또는 필터 조건에 맞는 주문이 없습니다.'
                    : '등록된 주문이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
