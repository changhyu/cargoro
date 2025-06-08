'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { LEASE_STATUS_LABEL } from '../../constants';
import { leaseService, LeaseContract } from '../../services/api';

export default function LeaseList() {
  const router = useRouter();
  const [leases, setLeases] = useState<LeaseContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeases = async () => {
      setLoading(true);
      try {
        const response = await leaseService.getLeases();
        setLeases(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : '계약 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  // 상태 필터 적용
  const filteredLeases = leases.filter(
    lease => statusFilter === 'all' || lease.status === statusFilter
  );

  // 검색어 필터 적용
  const searchFilteredLeases = filteredLeases.filter(lease => {
    const provider = lease.provider || '';
    return (
      provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.vehicleId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 리스/렌트 계약 상세 페이지로 이동
  const handleLeaseClick = (id: string) => {
    router.push(`/dashboard/leases/${id}`);
  };

  // 리스/렌트 계약 생성 페이지로 이동
  const handleAddNewLease = () => {
    router.push('/dashboard/leases/new');
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        <p>오류가 발생했습니다: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">리스/렌트 계약 관리</h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <input
              type="text"
              placeholder="계약 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleAddNewLease}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            + 신규 계약 등록
          </button>
        </div>
      </div>

      <div className="mb-4 flex overflow-x-auto py-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`mr-2 whitespace-nowrap rounded-lg px-4 py-2 ${
            statusFilter === 'all'
              ? 'bg-blue-100 font-medium text-blue-800'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          전체 계약
        </button>
        {Object.entries(LEASE_STATUS_LABEL).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`mr-2 whitespace-nowrap rounded-lg px-4 py-2 ${
              statusFilter === key
                ? 'bg-blue-100 font-medium text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {searchFilteredLeases.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center">
          <p className="text-lg text-gray-500">
            {searchTerm
              ? '검색 결과가 없습니다.'
              : statusFilter !== 'all'
                ? `${LEASE_STATUS_LABEL[statusFilter]} 상태의 계약이 없습니다.`
                : '등록된 계약이 없습니다.'}
          </p>
          <button
            onClick={handleAddNewLease}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            신규 계약 등록하기
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  제공사
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  계약 기간
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  월 납부액
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  상태
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {searchFilteredLeases.map(lease => (
                <tr
                  key={lease.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleLeaseClick(lease.id)}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{lease.provider}</div>
                    <div className="text-sm text-gray-500">차량 ID: {lease.vehicleId}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {lease.startDate} ~ {lease.endDate}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {(lease.monthlyPayment || 0).toLocaleString()}원
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5
                      ${
                        lease.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : lease.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : lease.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : lease.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {LEASE_STATUS_LABEL[lease.status] || lease.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {lease.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
