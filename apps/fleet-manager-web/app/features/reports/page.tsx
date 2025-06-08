'use client';

import { TrendingUp, Car, Users, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportsPage() {
  // 월별 매출 데이터
  const monthlyRevenueData = [
    { month: '1월', rental: 85000000, lease: 240000000, total: 325000000 },
    { month: '2월', rental: 92000000, lease: 245000000, total: 337000000 },
    { month: '3월', rental: 88000000, lease: 250000000, total: 338000000 },
    { month: '4월', rental: 95000000, lease: 248000000, total: 343000000 },
    { month: '5월', rental: 102000000, lease: 255000000, total: 357000000 },
    { month: '6월', rental: 98000000, lease: 260000000, total: 358000000 },
  ];

  // 차량 카테고리별 분포
  const vehicleCategoryData = [
    { name: '중형', value: 12 },
    { name: '대형', value: 8 },
    { name: 'SUV', value: 6 },
    { name: '밴', value: 4 },
    { name: '경제형', value: 3 },
  ];

  // 고객 유형별 매출
  const customerTypeRevenue = [
    { name: '개인 렌탈', value: 180000000 },
    { name: '법인 렌탈', value: 120000000 },
    { name: '개인 리스', value: 80000000 },
    { name: '법인 리스', value: 420000000 },
  ];

  // 차량 가동률 데이터
  const utilizationData = [
    { month: '1월', rate: 78 },
    { month: '2월', rate: 82 },
    { month: '3월', rate: 85 },
    { month: '4월', rate: 87 },
    { month: '5월', rate: 83 },
    { month: '6월', rate: 89 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      notation: 'compact',
    }).format(value);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">보고서 및 분석</h1>
        <p className="mt-2 text-gray-600">운영 현황 분석 및 보고서</p>
      </div>

      {/* 주요 지표 카드 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월평균 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩344.7M</div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              전년 대비 +23.5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 가동률</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.2%</div>
            <p className="text-xs text-muted-foreground">목표 대비 +4.2%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">고객당 평균 매출</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩2.8M</div>
            <p className="text-xs text-muted-foreground">전월 대비 +8.3%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">계약 갱신율</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">업계 평균 65%</p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 월별 매출 추이 */}
        <Card>
          <CardHeader>
            <CardTitle>월별 매출 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={value => `${value / 1000000}M`} />
                <Tooltip formatter={value => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="rental" fill="#8884d8" name="렌탈" />
                <Bar dataKey="lease" fill="#82ca9d" name="리스" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 차량 가동률 추이 */}
        <Card>
          <CardHeader>
            <CardTitle>차량 가동률 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} tickFormatter={value => `${value}%`} />
                <Tooltip formatter={value => `${value}%`} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="가동률"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 차량 카테고리별 분포 */}
        <Card>
          <CardHeader>
            <CardTitle>차량 카테고리별 보유 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehicleCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name} ${value}대 (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vehicleCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 고객 유형별 매출 */}
        <Card>
          <CardHeader>
            <CardTitle>고객 유형별 매출 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerTypeRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}\n${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerTypeRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={value => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 상세 분석 카드 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">인기 차량 TOP 5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['그랜저 IG FL', '카니발 KA4', 'K5 DL3', '아반떼 CN7', '아이오닉5'].map(
                (car, index) => (
                  <div key={car} className="flex items-center justify-between">
                    <span className="text-sm">
                      {index + 1}. {car}
                    </span>
                    <span className="text-sm font-medium">{95 - index * 5}%</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">수익성 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">평균 일일 수익</span>
                <span className="text-sm font-medium">₩11.5M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">차량당 평균 수익</span>
                <span className="text-sm font-medium">₩2.1M/월</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">운영 비용률</span>
                <span className="text-sm font-medium">23.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">순이익률</span>
                <span className="text-sm font-medium text-green-600">31.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">계약 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">신규 계약 (이번달)</span>
                <span className="text-sm font-medium">+23건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">만료 예정 (30일내)</span>
                <span className="text-sm font-medium text-yellow-600">8건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">평균 계약 기간</span>
                <span className="text-sm font-medium">18.5개월</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">조기 해지율</span>
                <span className="text-sm font-medium">4.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
