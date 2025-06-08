'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, useToast } from '@cargoro/ui';

import DriverForm from '@/app/features/drivers/driver-form';
import { driverService, type Driver, DriverFormData } from '@/app/services/api';

interface EditDriverPageProps {
  params: {
    id: string;
  };
}

export default function EditDriverPage({ params }: EditDriverPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const data = await driverService.getDriverById(params.id);
        // API 응답을 로컬 Driver 타입에 맞게 완전히 변환
        const convertedDriver: Driver = {
          ...data,
          emergencyContact: (() => {
            const contact = data.emergencyContact as unknown;
            if (typeof contact === 'string') {
              return {
                name: contact.split(' (')[0] || '',
                phone: contact.match(/\(([^)]+)\)/)?.[1] || '',
                relationship: '기타',
              };
            }
            if (contact && typeof contact === 'object') {
              return contact as { name: string; phone: string; relationship: string };
            }
            return {
              name: '',
              phone: '',
              relationship: '기타',
            };
          })(),
          assignedVehicles: Array.isArray(data.assignedVehicles)
            ? data.assignedVehicles.map(vehicle =>
                typeof vehicle === 'string'
                  ? { id: vehicle, make: '', model: '', plateNumber: '', type: '' }
                  : vehicle
              )
            : [],
        };
        setDriver(convertedDriver);
      } catch {
        toast({
          title: '오류',
          description: '운전자 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
        router.push('/dashboard/drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [params.id, router, toast]);

  const handleSubmit = async (data: DriverFormData) => {
    if (!driver) return;

    try {
      await driverService.updateDriver(driver.id, data);
      toast({
        title: '수정 완료',
        description: `${data.name} 운전자 정보가 수정되었습니다.`,
      });
      router.push(`/dashboard/drivers/${driver.id}`);
    } catch {
      toast({
        title: '오류',
        description: '운전자 정보 수정에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">운전자 정보를 찾을 수 없습니다.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/drivers')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>
        <div>
          <h1 className="text-2xl font-bold">운전자 정보 수정</h1>
          <p className="text-muted-foreground">{driver.name} 운전자의 정보를 수정합니다</p>
        </div>
      </div>

      {/* 폼 */}
      <DriverForm driver={driver} onSubmit={handleSubmit} />
    </div>
  );
}
