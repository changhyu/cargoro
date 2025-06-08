import React from 'react';
import Image from 'next/image';
import { cn } from '../lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import { StatusBadge } from './status-badge';
import { Button } from './button';

interface VehicleCardProps {
  id: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  image?: string;
  status: 'active' | 'maintenance' | 'inactive' | 'repair' | 'completed' | 'pending';
  lastMaintenance?: string;
  owner?: string;
  className?: string;
  vin?: string;
  fuelType?: string;
  mileage?: number;
  onClick?: (id: string) => void;
  actions?: React.ReactNode;
}

const getStatusText = (status: VehicleCardProps['status']) => {
  const statusMap = {
    active: '운행 중',
    maintenance: '정비 중',
    inactive: '비활성',
    repair: '수리 중',
    completed: '완료됨',
    pending: '대기 중',
  };
  return statusMap[status] || status;
};

const getStatusColor = (
  status: VehicleCardProps['status']
): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' => {
  const colorMap: Record<
    VehicleCardProps['status'],
    'default' | 'secondary' | 'success' | 'warning' | 'destructive'
  > = {
    active: 'success',
    maintenance: 'warning',
    inactive: 'destructive',
    repair: 'warning',
    completed: 'success',
    pending: 'secondary',
  };
  return colorMap[status] || 'secondary';
};

export const VehicleCard: React.FC<VehicleCardProps> = ({
  id,
  brand,
  model,
  year,
  licensePlate,
  image,
  status,
  lastMaintenance,
  owner,
  className,
  vin,
  fuelType,
  mileage,
  onClick,
  actions,
}) => {
  const defaultImage = '/images/vehicle-placeholder.png';

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <Card
      className={cn(
        'w-full overflow-hidden transition-shadow duration-200 hover:shadow-md',
        className
      )}
      variant="default"
      hoverEffect={!!onClick}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 overflow-hidden md:h-auto md:w-1/3">
          <Image
            src={image || defaultImage}
            alt={`${brand} ${model}`}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute right-2 top-2">
            <StatusBadge variant={getStatusColor(status)}>{getStatusText(status)}</StatusBadge>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {brand} {model}
                </h3>
                <p className="text-lg font-semibold text-primary">{licensePlate}</p>
              </div>
              <p className="text-sm text-muted-foreground">{year}년식</p>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
            {owner && (
              <div>
                <p className="text-xs text-muted-foreground">소유자</p>
                <p className="font-medium">{owner}</p>
              </div>
            )}
            {vin && (
              <div>
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="truncate font-medium">{vin}</p>
              </div>
            )}
            {fuelType && (
              <div>
                <p className="text-xs text-muted-foreground">연료</p>
                <p className="font-medium">{fuelType}</p>
              </div>
            )}
            {mileage !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground">주행거리</p>
                <p className="font-medium">{mileage.toLocaleString()}km</p>
              </div>
            )}
            {lastMaintenance && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">최근 정비</p>
                <p className="font-medium">{lastMaintenance}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="mt-auto justify-end gap-2">
            {actions}
            {!actions && onClick && (
              <Button size="sm" variant="default">
                상세 보기
              </Button>
            )}
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};
