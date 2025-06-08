'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, useToast } from '@cargoro/ui';

import { driverService, DriverFormData } from '@/app/services/api';

import DriverForm from '../../../features/drivers/driver-form';

export default function NewDriverPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: DriverFormData) => {
    try {
      await driverService.createDriver(data);
      toast({
        title: '등록 완료',
        description: `${data.name} 운전자가 성공적으로 등록되었습니다.`,
      });
      router.push('/dashboard/drivers');
    } catch {
      toast({
        title: '오류',
        description: '운전자 등록에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>
        <div>
          <h1 className="text-2xl font-bold">새 운전자 등록</h1>
          <p className="text-muted-foreground">새로운 운전자 정보를 입력하여 등록합니다</p>
        </div>
      </div>

      {/* 폼 */}
      <DriverForm onSubmit={handleSubmit} />
    </div>
  );
}
