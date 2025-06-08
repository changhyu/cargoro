import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Vehicle, VehicleStatus } from './types';
import { formatDate } from '../../utils/format';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cargoro/ui';

interface VehicleListProps {
  vehicles: Vehicle[] | undefined;
  onVehicleSelect: (vehicle: Vehicle) => void;
  onAddVehicle: () => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles = [],
  onVehicleSelect,
  onAddVehicle,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');

  // 안전하게 vehicles가 배열인지 확인하고 필터링
  const filteredVehicles = useMemo(() => {
    // vehicles가 없거나 배열이 아닌 경우 빈 배열 반환
    if (!vehicles || !Array.isArray(vehicles)) return [];

    return vehicles.filter(vehicle => {
      // 상태 필터링
      const statusMatch = statusFilter === 'all' || vehicle.status === statusFilter;

      // 검색어 필터링 (차량 정보, 소유자 정보 등에서 검색)
      const searchLower = searchTerm.toLowerCase();
      const plateNumber = vehicle.licensePlate || '';
      const searchMatch =
        searchTerm === '' ||
        plateNumber.toLowerCase().includes(searchLower) ||
        vehicle.manufacturer?.toLowerCase().includes(searchLower) ||
        vehicle.model?.toLowerCase().includes(searchLower) ||
        vehicle.vin?.toLowerCase().includes(searchLower) ||
        vehicle.owner?.name?.toLowerCase().includes(searchLower) ||
        vehicle.owner?.phone?.toLowerCase().includes(searchLower);

      return statusMatch && searchMatch;
    });
  }, [vehicles, searchTerm, statusFilter]);

  // 상태별 배지 색상
  const getStatusBadgeVariant = (status: VehicleStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status: VehicleStatus) => {
    return t(`vehicles.status.${status}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('vehicles.title')}</h2>
        <Button onClick={onAddVehicle}>{t('vehicles.addNew')}</Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        {/* 검색 필드 */}
        <div className="relative w-full md:w-2/3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('vehicles.search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 상태 필터 */}
        <Select
          value={statusFilter}
          onValueChange={value => setStatusFilter(value as VehicleStatus | 'all')}
        >
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder={t('vehicles.status.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('vehicles.status.all')}</SelectItem>
            <SelectItem value="active">{t('vehicles.status.active')}</SelectItem>
            <SelectItem value="inactive">{t('vehicles.status.inactive')}</SelectItem>
            <SelectItem value="maintenance">{t('vehicles.status.maintenance')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 차량 목록 */}
      {filteredVehicles.length === 0 ? (
        <div className="rounded-md border py-10 text-center">
          <p className="text-muted-foreground">
            {searchTerm ? t('vehicles.noResults') : t('vehicles.noVehicles')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map(vehicle => (
            <Card
              key={vehicle.id}
              className="cursor-pointer transition-colors hover:bg-accent/20"
              onClick={() => onVehicleSelect(vehicle)}
              data-testid={`vehicle-card-${vehicle.id}`}
            >
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {vehicle.manufacturer} {vehicle.model} ({vehicle.year})
                    </h3>
                    <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                    {getStatusText(vehicle.status)}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('vehicles.owner')}:</span>
                    <span>{vehicle.owner?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('vehicles.phone')}:</span>
                    <span>{vehicle.owner?.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('vehicles.vin')}:</span>
                    <span className="text-xs">{vehicle.vin || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('vehicles.lastService')}:</span>
                    <span>{formatDate(vehicle.lastServiceDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
