'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from '@cargoro/ui';

// 폼 스키마
const repairRequestSchema = z.object({
  customerId: z.string().min(1, '고객을 선택해주세요'),
  vehicleId: z.string().min(1, '차량을 선택해주세요'),
  description: z.string().min(10, '증상을 10자 이상 입력해주세요'),
  symptoms: z.array(z.string()).min(1, '최소 1개 이상의 증상을 입력해주세요'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  preferredDate: z.date().optional(),
  estimatedDuration: z.number().min(30).optional(),
});

type RepairRequestFormValues = z.infer<typeof repairRequestSchema>;

export function RepairRequestForm() {
  const router = useRouter();
  const [customerSearch, setCustomerSearch] = useState('');
  interface Customer {
    id: string;
    name: string;
    phone: string;
    vehicles: {
      id: string;
      vehicleNumber: string;
      model: string;
      manufacturer: string;
    }[];
  }

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [symptomInput, setSymptomInput] = useState('');

  const form = useForm<RepairRequestFormValues>({
    resolver: zodResolver(repairRequestSchema),
    defaultValues: {
      priority: 'NORMAL',
      symptoms: [],
    },
  });

  // 고객 검색
  const { data: customers } = useQuery({
    queryKey: ['customers', customerSearch],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch(`/api/customers?search=${customerSearch}`)
      // return response.json()

      return [
        {
          id: '1',
          name: '김철수',
          phone: '010-1234-5678',
          vehicles: [
            {
              id: '1',
              vehicleNumber: '12가 3456',
              model: '소나타',
              manufacturer: '현대',
            },
          ],
        },
        {
          id: '2',
          name: '이영희',
          phone: '010-2345-6789',
          vehicles: [
            {
              id: '2',
              vehicleNumber: '34나 5678',
              model: 'K5',
              manufacturer: '기아',
            },
          ],
        },
      ];
    },
    enabled: customerSearch.length > 0,
  });

  // 정비 요청 생성
  const createMutation = useMutation({
    mutationFn: async (_values: RepairRequestFormValues) => {
      // TODO: 실제 API 호출로 변경
      // 디버깅 로그는 프로덕션에서 제거
      return { id: 'new-request-id' };
    },
    onSuccess: data => {
      toast.success('정비 요청이 생성되었습니다');
      router.push(`/repairs/${data.id}`);
    },
    onError: () => {
      toast.error('정비 요청 생성에 실패했습니다');
    },
  });

  const onSubmit = (values: RepairRequestFormValues) => {
    createMutation.mutate(values);
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      const currentSymptoms = form.getValues('symptoms');
      form.setValue('symptoms', [...currentSymptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (index: number) => {
    const currentSymptoms = form.getValues('symptoms');
    form.setValue(
      'symptoms',
      currentSymptoms.filter((_, i) => i !== index)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>새 정비 요청</CardTitle>
            <CardDescription>고객의 차량 정비 요청을 등록합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 고객 선택 */}
            <div className="space-y-4">
              <FormLabel>고객 정보</FormLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="고객명 또는 전화번호로 검색..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {customers && customers.length > 0 && (
                <div className="space-y-2 rounded-lg border p-2">
                  {customers.map(customer => (
                    <div
                      key={customer.id}
                      className={cn(
                        'cursor-pointer rounded-md p-3 hover:bg-accent',
                        selectedCustomer?.id === customer.id && 'bg-accent'
                      )}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        form.setValue('customerId', customer.id);
                        form.setValue('vehicleId', '');
                      }}
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 차량 선택 */}
            {selectedCustomer && (
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>차량 선택</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="차량을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedCustomer.vehicles.map(vehicle => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.vehicleNumber} - {vehicle.manufacturer} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 증상 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>증상 설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="차량의 증상을 자세히 설명해주세요..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>고객이 설명한 증상을 가능한 자세히 기록해주세요</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 증상 태그 */}
            <div className="space-y-2">
              <FormLabel>주요 증상</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="증상 입력 후 Enter"
                  value={symptomInput}
                  onChange={e => setSymptomInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSymptom();
                    }
                  }}
                />
                <Button type="button" onClick={addSymptom}>
                  추가
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('symptoms').map((symptom, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-secondary-foreground"
                  >
                    <span className="text-sm">{symptom}</span>
                    <button
                      type="button"
                      onClick={() => removeSymptom(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {form.formState.errors.symptoms && (
                <p className="text-sm text-destructive">{form.formState.errors.symptoms.message}</p>
              )}
            </div>

            {/* 우선순위 */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우선순위</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">낮음</SelectItem>
                      <SelectItem value="NORMAL">보통</SelectItem>
                      <SelectItem value="HIGH">높음</SelectItem>
                      <SelectItem value="URGENT">긴급</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 희망 날짜 */}
            <FormField
              control={form.control}
              name="preferredDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>희망 정비일</FormLabel>
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
                            <span>날짜를 선택하세요</span>
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
                        disabled={date =>
                          date < new Date() ||
                          date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>고객이 희망하는 정비 날짜를 선택하세요</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 예상 소요 시간 */}
            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>예상 소요 시간 (분)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="30"
                      step="30"
                      placeholder="예: 120"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>정비에 필요한 예상 시간을 분 단위로 입력하세요</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? '생성 중...' : '정비 요청 생성'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
