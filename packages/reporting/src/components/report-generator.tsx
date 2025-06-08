'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Checkbox,
  cn,
} from '@cargoro/ui';
import { Loader2, CalendarIcon, FileText, Download } from 'lucide-react';
import { format as dateFormat } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ReportTemplate, ReportParameter, DateRange, DateRangeUtils } from '../types';
import { useGenerateReport } from '../hooks';

interface ReportGeneratorProps {
  readonly template: ReportTemplate;
  readonly onGenerated?: (reportId: string) => void;
}

export function ReportGenerator({ template, onGenerated }: ReportGeneratorProps) {
  const { generate, isGenerating, progress } = useGenerateReport();
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [format, setFormat] = useState<'pdf' | 'excel' | 'word'>('pdf');

  const handleParameterChange = (parameterId: string, value: any) => {
    setParameters({ ...parameters, [parameterId]: value });
  };

  const handleDateSelect = (paramId: string) => (date: Date | undefined) => {
    handleParameterChange(paramId, date);
  };

  const handleDateRangeSelect = (paramId: string) => (range: DateRange | undefined) => {
    handleParameterChange(paramId, range);
  };

  const handleSelectChange = (paramId: string) => (value: string) => {
    handleParameterChange(paramId, value);
  };

  const handleInputChange = (paramId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleParameterChange(paramId, e.target.value);
  };

  const handleNumberChange = (paramId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleParameterChange(paramId, parseInt(e.target.value));
  };

  const handleCheckboxChange = (paramId: string) => (checked: boolean | 'indeterminate') => {
    handleParameterChange(paramId, checked);
  };

  const handleMultiSelectChange = (
    paramId: string,
    optionValue: string,
    checked: boolean | 'indeterminate'
  ) => {
    const current = parameters[paramId] || [];
    if (checked) {
      handleParameterChange(paramId, [...current, optionValue]);
    } else {
      handleParameterChange(
        paramId,
        current.filter((v: any) => v !== optionValue)
      );
    }
  };

  const handleGenerate = async () => {
    // 필수 매개변수 검증
    const missingParams = template.parameters
      .filter(p => p.required && !parameters[p.id])
      .map(p => p.label);

    if (missingParams.length > 0) {
      alert(`필수 매개변수를 입력해주세요: ${missingParams.join(', ')}`);
      return;
    }
    try {
      const result = await generate({
        templateId: template.id,
        parameters,
        format: format,
        async: true,
      });

      // 이제 generate 함수가 Promise<{jobId: string}>를 반환합니다
      console.log('보고서 작업 생성됨:', result.jobId);

      if (onGenerated) {
        onGenerated(result.jobId);
      }
    } catch (error) {
      console.error('보고서 생성 중 오류 발생:', error);
      alert('보고서 생성 중 오류가 발생했습니다.');
    }
  };

  const renderParameter = (param: ReportParameter) => {
    switch (param.type) {
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !parameters[param.id] && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {parameters[param.id]
                  ? dateFormat(parameters[param.id], 'PPP', { locale: ko })
                  : '날짜 선택'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={parameters[param.id]}
                onSelect={handleDateSelect(param.id)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'dateRange':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !parameters[param.id] && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {DateRangeUtils.isValid(parameters[param.id])
                  ? DateRangeUtils.format(parameters[param.id])
                  : '기간 선택'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                selected={parameters[param.id]}
                onSelect={range => {
                  if (range && 'from' in range && 'to' in range) {
                    const dateRange: DateRange = {};
                    if (range.from) dateRange.from = range.from;
                    if (range.to) dateRange.to = range.to;
                    handleDateRangeSelect(param.id)(dateRange);
                  } else {
                    handleDateRangeSelect(param.id)(undefined);
                  }
                }}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'select':
        return (
          <Select value={parameters[param.id]} onValueChange={handleSelectChange(param.id)}>
            <SelectTrigger>
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiSelect':
        return (
          <div className="space-y-2">
            {param.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${param.id}_${option.value}`}
                  checked={(parameters[param.id] || []).includes(option.value)}
                  onCheckedChange={checked =>
                    handleMultiSelectChange(param.id, option.value, checked)
                  }
                />
                <Label htmlFor={`${param.id}_${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <Input
            value={parameters[param.id] || ''}
            onChange={handleInputChange(param.id)}
            placeholder={param.label}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={parameters[param.id] || ''}
            onChange={handleNumberChange(param.id)}
            placeholder={param.label}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={param.id}
              checked={parameters[param.id] || false}
              onCheckedChange={handleCheckboxChange(param.id)}
            />
            <Label htmlFor={param.id}>{param.label}</Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {template.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 매개변수 입력 */}
        {template.parameters.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">보고서 매개변수</h3>
            {template.parameters.map(param => (
              <div key={param.id} className="space-y-2">
                <Label>
                  {param.label}
                  {param.required && <span className="ml-1 text-destructive">*</span>}
                </Label>
                {renderParameter(param)}
              </div>
            ))}
          </div>
        )}

        {/* 파일 형식 선택 */}
        <div className="space-y-2">
          <Label>파일 형식</Label>
          <Select
            value={format}
            onValueChange={(value: string) => setFormat(value as 'pdf' | 'excel' | 'word')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="word">Word</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 생성 버튼 */}
        <Button className="w-full" size="lg" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중... {progress > 0 && `(${progress}%)`}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              보고서 생성
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
