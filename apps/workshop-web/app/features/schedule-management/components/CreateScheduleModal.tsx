'use client';

// useState import 제거됨
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@cargoro/ui';
import { Button } from '@cargoro/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@cargoro/ui';
import { Input } from '@cargoro/ui';
import { Textarea } from '@cargoro/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui';
import { format, addHours } from 'date-fns';
import { useCreateSchedule } from '../hooks/useScheduleApi';

// 폼 스키마 정의
const formSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.'),
  technicianId: z.string().min(1, '정비사를 선택해주세요.'),
  startTime: z.string().min(1, '시작 시간은 필수입니다.'),
  endTime: z.string().min(1, '종료 시간은 필수입니다.'),
  repairId: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTechnicianId?: string;
  technicians: { id: string; name: string }[];
}

export function CreateScheduleModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTechnicianId = '',
  technicians,
}: CreateScheduleModalProps) {
  const createSchedule = useCreateSchedule();

  // 시작 시간과 종료 시간 기본값 설정 (현재 시간부터 1시간)
  const startTimeDefault = format(new Date(selectedDate), "yyyy-MM-dd'T'HH:mm");
  const endTimeDefault = format(addHours(new Date(selectedDate), 1), "yyyy-MM-dd'T'HH:mm");

  // 폼 설정
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      technicianId: selectedTechnicianId,
      startTime: startTimeDefault,
      endTime: endTimeDefault,
      repairId: '',
      description: '',
    },
  });

  // 폼 제출 처리
  const onSubmit = async (values: FormValues) => {
    try {
      await createSchedule.mutateAsync({
        title: values.title,
        technician_id: values.technicianId,
        start_time: values.startTime,
        end_time: values.endTime,
        repair_id: values.repairId || undefined,
        description: values.description || undefined,
      });

      onClose();
    } catch (error) {
      // TODO: 에러 처리 및 로깅 구현
      // eslint-disable-next-line no-console
      console.error('일정 생성 실패:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 일정 추가</DialogTitle>
          <DialogDescription>
            새로운 일정을 추가합니다. 필수 정보를 모두 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>일정 제목</FormLabel>
                  <FormControl>
                    <Input placeholder="일정 제목을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technicianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>담당 정비사</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="담당 정비사 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {technicians.map(technician => (
                        <SelectItem key={technician.id} value={technician.id}>
                          {technician.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작 시간</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="repairId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>연결된 정비 작업 ID (선택사항)</FormLabel>
                  <FormControl>
                    <Input placeholder="정비 작업 ID를 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 (선택사항)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="일정에 대한 추가 설명을 입력하세요"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={createSchedule.isPending}>
                {createSchedule.isPending ? '생성 중...' : '일정 생성'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
