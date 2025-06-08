'use client';

import React from 'react';

export default function MapPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">차량 위치 정보</h1>

        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-yellow-700">
              <strong>일시적인 시스템 문제:</strong> 현재 지도 기능에 문제가 발생했습니다. 개발팀이
              빠르게 해결하고 있으니 잠시 후 다시 시도해 주세요.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h2 className="mb-2 font-semibold">차량 현황 요약</h2>
            <ul className="space-y-1">
              <li className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                <span>운행 중: 5대</span>
              </li>
              <li className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
                <span>대기 중: 3대</span>
              </li>
              <li className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500"></div>
                <span>정비 중: 2대</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h2 className="mb-2 font-semibold">최근 알림</h2>
            <p className="text-sm text-gray-600">
              최근 알림을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
            </p>
          </div>
        </div>

        <div className="flex h-80 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-4 h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700">지도를 불러올 수 없습니다</h3>
            <p className="mx-auto mt-2 max-w-md text-gray-600">
              현재 지도 기능에 일시적인 문제가 발생했습니다. <br />
              개발팀이 문제를 인지하고 빠르게 해결하고 있습니다.
            </p>
            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
