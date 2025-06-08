'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cargoro/ui';
import { ClipboardCheck, Clock, Hammer, Package, XCircle } from 'lucide-react';

import { RepairJobList } from '../components/repair-job-list';
import { useRepairJobs } from '../hooks/useRepairJobApi';

export default function RepairDashboardPage() {
  const { data: response } = useRepairJobs();
  const jobs = response?.jobs || [];

  // 상태별 작업 수 계산
  const calculateJobsByStatus = () => {
    if (!jobs.length) {
      return { pending: 0, in_progress: 0, waiting_parts: 0, completed: 0, cancelled: 0, total: 0 };
    }

    const counts = {
      pending: 0,
      in_progress: 0,
      waiting_parts: 0,
      completed: 0,
      cancelled: 0,
      total: 0,
    };

    jobs.forEach(job => {
      if (job.status && Object.prototype.hasOwnProperty.call(counts, job.status)) {
        // 타입 안전성을 위해 타입 가드 사용
        const status = job.status as keyof typeof counts;
        if (status !== 'total') {
          counts[status]++;
        }
      }
      counts.total++;
    });

    return counts;
  };

  const jobCounts = calculateJobsByStatus();

  // 통계 카드 데이터
  const stats = [
    {
      title: '대기 중',
      value: jobCounts.pending,
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      description: '처리 대기 중인 작업',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: '진행 중',
      value: jobCounts.in_progress,
      icon: <Hammer className="h-5 w-5 text-amber-500" />,
      description: '현재 작업 중인 건',
      color: 'bg-amber-50 border-amber-200',
    },
    {
      title: '부품 대기',
      value: jobCounts.waiting_parts,
      icon: <Package className="h-5 w-5 text-purple-500" />,
      description: '부품 도착 대기 중',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      title: '완료',
      value: jobCounts.completed,
      icon: <ClipboardCheck className="h-5 w-5 text-green-500" />,
      description: '완료된 작업',
      color: 'bg-green-50 border-green-200',
    },
    {
      title: '취소',
      value: jobCounts.cancelled,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      description: '취소된 작업',
      color: 'bg-red-50 border-red-200',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">정비 대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(stat => (
          <Card key={stat.title} className={`${stat.color} border`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 작업 목록 탭 */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="pending">대기 중</TabsTrigger>
          <TabsTrigger value="in_progress">진행 중</TabsTrigger>
          <TabsTrigger value="waiting_parts">부품 대기</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <RepairJobList />
        </TabsContent>
        <TabsContent value="pending">
          <RepairJobList />
        </TabsContent>
        <TabsContent value="in_progress">
          <RepairJobList />
        </TabsContent>
        <TabsContent value="waiting_parts">
          <RepairJobList />
        </TabsContent>
        <TabsContent value="completed">
          <RepairJobList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
