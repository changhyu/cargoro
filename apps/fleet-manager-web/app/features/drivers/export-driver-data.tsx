'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';
import { saveAs } from 'file-saver';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  Car,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { DateRange as UIDateRange, DateRangePicker, useToast } from '@cargoro/ui';
import { Button } from '@cargoro/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui/card';
import { Checkbox } from '@cargoro/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui/select';

import { driverService } from '../../services/api';

export default function ExportDriverData() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState<UIDateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange({
      from: range.from,
      to: range.to,
    });
  };

  const [selectedOptions, setSelectedOptions] = useState({
    includePerformanceData: true,
    includeVehicleAssignments: true,
    includeDrivingHistory: true,
    includeInactiveDrivers: false,
  });
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');

  // 옵션 변경 핸들러
  const handleOptionChange = (option: string, value: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: value,
    }));
  };

  // 내보내기 실행
  const handleExport = async () => {
    setLoading(true);
    try {
      // 내보내기 옵션 구성
      const exportOptions = {
        ...selectedOptions,
        dateFrom: format(dateRange.from!, 'yyyy-MM-dd'),
        dateTo: format(dateRange.to!, 'yyyy-MM-dd'),
        format: exportFormat,
      };

      // API 호출
      const blob = await driverService.exportDriversToExcel(exportOptions);

      // 파일명 생성
      const fileName = `운전자_데이터_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`;

      // 파일 다운로드
      saveAs(blob, fileName);

      toast({
        title: '내보내기 완료',
        description: '운전자 데이터가 성공적으로 내보내기 되었습니다.',
      });
    } catch (error) {
      // console.error('내보내기 오류:', error);
      toast({
        title: '내보내기 오류',
        description: '운전자 데이터 내보내기에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center text-xl font-bold">
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          운전자 데이터 내보내기
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 기간 선택 */}
          <div className="flex flex-col space-y-2">
            <h3 className="flex items-center font-medium">
              <Calendar className="mr-2 h-4 w-4" />
              기간 선택
            </h3>
            <DateRangePicker
              value={dateRange}
              onChange={(value: UIDateRange | undefined) => {
                if (value && value.from && value.to) {
                  handleDateRangeChange({ from: value.from, to: value.to });
                }
              }}
              locale={ko as Locale}
              className="w-full sm:w-auto"
            />
          </div>

          {/* 포함할 데이터 선택 */}
          <div className="flex flex-col space-y-2">
            <h3 className="flex items-center font-medium">
              <Filter className="mr-2 h-4 w-4" />
              포함할 데이터
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePerformanceData"
                  checked={selectedOptions.includePerformanceData}
                  onCheckedChange={checked =>
                    handleOptionChange('includePerformanceData', checked as boolean)
                  }
                />
                <label
                  htmlFor="includePerformanceData"
                  className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  성과 데이터
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeVehicleAssignments"
                  checked={selectedOptions.includeVehicleAssignments}
                  onCheckedChange={checked =>
                    handleOptionChange('includeVehicleAssignments', checked as boolean)
                  }
                />
                <label
                  htmlFor="includeVehicleAssignments"
                  className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Car className="mr-2 h-4 w-4" />
                  차량 배정 정보
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDrivingHistory"
                  checked={selectedOptions.includeDrivingHistory}
                  onCheckedChange={checked =>
                    handleOptionChange('includeDrivingHistory', checked as boolean)
                  }
                />
                <label
                  htmlFor="includeDrivingHistory"
                  className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  운행 이력
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInactiveDrivers"
                  checked={selectedOptions.includeInactiveDrivers}
                  onCheckedChange={checked =>
                    handleOptionChange('includeInactiveDrivers', checked as boolean)
                  }
                />
                <label
                  htmlFor="includeInactiveDrivers"
                  className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  비활성 운전자 포함
                </label>
              </div>
            </div>
          </div>

          {/* 파일 형식 선택 */}
          <div className="flex flex-col space-y-2">
            <h3 className="font-medium">파일 형식</h3>
            <Select
              value={exportFormat}
              onValueChange={value => setExportFormat(value as 'excel' | 'csv')}
            >
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue>{exportFormat === 'excel' ? 'Excel (XLSX)' : 'CSV'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (XLSX)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 내보내기 버튼 */}
          <div className="mt-4 flex justify-end">
            <Button onClick={handleExport} disabled={loading} className="flex items-center">
              {loading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              내보내기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
