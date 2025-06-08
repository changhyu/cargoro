import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO, addHours } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@cargoro/ui';
import { Button } from '@cargoro/ui';
import { Input } from '@cargoro/ui';
import { Textarea } from '@cargoro/ui';
import { Calendar } from '@cargoro/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@cargoro/ui';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '../../../utils/cn';
import {
  useCreateSchedule,
  useUpdateSchedule,
  TechnicianSchedule,
} from '../hooks/useTechnicianSchedule';

// 스키마 정의
const scheduleFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  date: z.date(),
  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '시간 형식은 HH:MM 이어야 합니다'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '시간 형식은 HH:MM 이어야 합니다'),
  description: z.string().optional(),
  repairId: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface TechnicianScheduleFormProps {
  technicianId: string;
  initialDate?: Date;
  schedule?: TechnicianSchedule;
  onClose: () => void;
}

const TechnicianScheduleForm: React.FC<TechnicianScheduleFormProps> = ({
  technicianId,
  initialDate = new Date(),
  schedule,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: createSchedule } = useCreateSchedule();
  const { mutate: updateSchedule } = useUpdateSchedule();

  // 수정 모드인지 확인
  const isEditMode = !!schedule;

  // 기본값 설정
  const defaultValues: ScheduleFormValues = isEditMode
    ? {
        title: schedule.title,
        date: parseISO(schedule.startTime),
        startTime: format(parseISO(schedule.startTime), 'HH:mm'),
        endTime: format(parseISO(schedule.endTime), 'HH:mm'),
        description: schedule.description || '',
        repairId: schedule.repairId || '',
      }
    : {
        title: '',
        date: initialDate,
        startTime: format(new Date().setMinutes(0, 0, 0), 'HH:mm'),
        endTime: format(addHours(new Date().setMinutes(0, 0, 0), 1), 'HH:mm'),
        description: '',
        repairId: '',
      };

  // 폼 설정
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues,
  });

  // 제출 핸들러
  const onSubmit = async (values: ScheduleFormValues) => {
    try {
      setIsSubmitting(true);

      // 날짜와 시간 결합
      const [startHour, startMinute] = values.startTime.split(':').map(Number);
      const [endHour, endMinute] = values.endTime.split(':').map(Number);

      const startDate = new Date(values.date);
      startDate.setHours(startHour || 0, startMinute || 0, 0, 0);

      const endDate = new Date(values.date);
      endDate.setHours(endHour || 0, endMinute || 0, 0, 0);

      // 종료 시간이 시작 시간보다 이전인 경우 에러
      if (endDate <= startDate) {
        form.setError('endTime', {
          type: 'manual',
          message: '종료 시간은 시작 시간보다 나중이어야 합니다',
        });
        setIsSubmitting(false);
        return;
      }

      const scheduleData = {
        technicianId,
        title: values.title,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        ...(values.description && { description: values.description }),
        ...(values.repairId && { repairId: values.repairId }),
      };

      if (isEditMode) {
        // 기존 일정 수정
        updateSchedule(
          { scheduleId: schedule.id, data: scheduleData },
          {
            onSuccess: () => {
              setIsSubmitting(false);
              onClose();
            },
            onError: () => {
              // TODO: 에러 처리 및 로깅 구현
              setIsSubmitting(false);
            },
          }
        );
      } else {
        // 새 일정 생성
        createSchedule(scheduleData, {
          onSuccess: () => {
            setIsSubmitting(false);
            onClose();
          },
          onError: () => {
            // TODO: 에러 처리 및 로깅 구현
            setIsSubmitting(false);
          },
        });
      }
    } catch (error) {
      // TODO: 에러 처리 및 로깅 구현
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="일정 제목" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>날짜</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: ko })
                        ) : (
                          <span>날짜 선택</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시작 시간</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="09:00" type="time" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>종료 시간</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="10:00" type="time" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택사항)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="일정에 대한 설명을 입력하세요..."
                  className="h-20 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repairId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>연결된 정비 작업 ID (선택사항)</FormLabel>
              <FormControl>
                <Input placeholder="정비 작업 ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : isEditMode ? '수정' : '추가'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TechnicianScheduleForm;
