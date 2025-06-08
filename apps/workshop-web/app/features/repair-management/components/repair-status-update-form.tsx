import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddRepairStatusHistory } from '../hooks/useRepairStatusHistory';
import { useUpdateRepairJobStatus } from '../hooks/useRepairJobApi';
import { RepairStatus } from '../types';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '@cargoro/ui';

// 상태 변경 양식 스키마
const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'waiting_parts']),
  note: z.string().optional(),
});

type StatusUpdateFormValues = z.infer<typeof statusUpdateSchema>;

interface RepairStatusUpdateFormProps {
  repairId: string;
  currentStatus: RepairStatus;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const statusLabels = {
  pending: '대기 중',
  in_progress: '진행 중',
  completed: '완료',
  cancelled: '취소됨',
  waiting_parts: '부품 대기 중',
};

const RepairStatusUpdateForm: React.FC<RepairStatusUpdateFormProps> = ({
  repairId,
  currentStatus,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 상태 변경 API 훅
  const { mutate: updateStatus } = useUpdateRepairJobStatus();
  const { mutate: addStatusHistory } = useAddRepairStatusHistory();

  // 폼 초기화
  const form = useForm<StatusUpdateFormValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: currentStatus,
      note: '',
    },
  });

  // 폼 제출 핸들러
  const onSubmit = async (values: StatusUpdateFormValues) => {
    try {
      setIsSubmitting(true);

      // 상태가 변경된 경우에만 API 호출
      if (values.status !== currentStatus) {
        // 1. 정비 작업 상태 업데이트
        updateStatus(
          {
            id: repairId,
            status: values.status as RepairStatus,
            ...(values.note && { note: values.note }),
          },
          {
            onSuccess: () => {
              // 2. 상태 변경 기록 추가
              addStatusHistory(
                {
                  repairId,
                  status: values.status,
                  ...(values.note && { note: values.note }),
                },
                {
                  onSuccess: () => {
                    setIsSubmitting(false);
                    onSuccess?.();
                  },
                  onError: () => {
                    // TODO: 에러 처리 및 로깅 구현
                    setIsSubmitting(false);
                  },
                }
              );
            },
            onError: () => {
              // TODO: 에러 처리 및 로깅 구현
              setIsSubmitting(false);
            },
          }
        );
      } else {
        // 상태 변경 없이 메모만 추가하는 경우
        addStatusHistory(
          {
            repairId,
            status: values.status,
            ...(values.note && { note: values.note }),
          },
          {
            onSuccess: () => {
              setIsSubmitting(false);
              onSuccess?.();
            },
            onError: () => {
              // TODO: 에러 처리 및 로깅 구현
              setIsSubmitting(false);
            },
          }
        );
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
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>상태 변경</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {(Object.entries(statusLabels) as [RepairStatus, string][]).map(
                    ([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`status-${value}`} />
                        <label
                          htmlFor={`status-${value}`}
                          className="text-sm font-medium leading-none"
                        >
                          {label}
                        </label>
                      </div>
                    )
                  )}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모 (선택사항)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="상태 변경에 대한 메모를 작성하세요..."
                  className="h-24 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '상태 변경'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RepairStatusUpdateForm;
