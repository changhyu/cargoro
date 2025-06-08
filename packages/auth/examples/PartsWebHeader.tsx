import { SignedIn, SignedOut, UserButton } from '@cargoro/auth/web';
import { useUser } from '@cargoro/auth/web';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

export function PartsWebHeader() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  const categories = [
    { name: '엔진 부품', href: '/parts/category/engine', icon: '🔧' },
    { name: '브레이크', href: '/parts/category/brakes', icon: '🛑' },
    { name: '서스펜션', href: '/parts/category/suspension', icon: '🏎️' },
    { name: '전기/전자', href: '/parts/category/electrical', icon: '⚡' },
    { name: '바디/외장', href: '/parts/category/body', icon: '🚗' },
    { name: '인테리어', href: '/parts/category/interior', icon: '🪑' },
    { name: '오일/필터', href: '/parts/category/oil-filters', icon: '🛢️' },
    { name: '타이어/휠', href: '/parts/category/tires-wheels', icon: '🛞' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* 상단 바 */}
      <div className="bg-gray-900 py-2 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex space-x-4">
              <span className="flex items-center">
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                1588-1234
              </span>
              <span>평일 09:00 - 18:00</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/parts/track-order" className="hover:text-orange-400">
                주문 조회
              </Link>
              <Link href="/parts/faq" className="hover:text-orange-400">
                고객센터
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 헤더 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/parts" className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">카고로 부품몰</span>
                <span className="block text-xs text-gray-500">정품 자동차 부품 전문</span>
              </div>
            </Link>
          </div>

          {/* 검색바 */}
          <div className="mx-8 max-w-lg flex-1">
            <form className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="부품명, 부품번호, 차종으로 검색"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 text-sm focus:border-orange-500 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-orange-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-6">
            <SignedIn>
              <Link
                href="/parts/wishlist"
                className="relative p-2 text-gray-600 hover:text-orange-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                  3
                </span>
              </Link>
              <Link href="/parts/cart" className="relative p-2 text-gray-600 hover:text-orange-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                  5
                </span>
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10 border-2 border-orange-200',
                    userButtonPopoverCard: 'mt-3 shadow-xl',
                    userButtonPopoverActionButton: 'hover:bg-orange-50 hover:text-orange-700',
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="rounded-xl border-2 border-orange-600 px-6 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-600 hover:text-white"
              >
                로그인
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* 카테고리 네비게이션 */}
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-12 items-center space-x-8">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center space-x-2 font-medium text-gray-700 hover:text-orange-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span>전체 카테고리</span>
            </button>
            <Link href="/parts/deals" className="font-medium text-red-600 hover:text-red-700">
              🔥 특가상품
            </Link>
            <Link href="/parts/new" className="font-medium text-gray-700 hover:text-orange-600">
              신상품
            </Link>
            <Link href="/parts/brands" className="font-medium text-gray-700 hover:text-orange-600">
              브랜드
            </Link>
            <Link href="/parts/oem" className="font-medium text-gray-700 hover:text-orange-600">
              순정부품
            </Link>
            <Link
              href="/parts/compatible"
              className="font-medium text-gray-700 hover:text-orange-600"
            >
              호환부품
            </Link>
          </nav>
        </div>
      </div>

      {/* 카테고리 드롭다운 */}
      {showCategories && (
        <div className="absolute left-0 top-full z-50 w-full border-t border-gray-200 bg-white shadow-lg">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-4">
              {categories.map(category => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="flex items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setShowCategories(false)}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
