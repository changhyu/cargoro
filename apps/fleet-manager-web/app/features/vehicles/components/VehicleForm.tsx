'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
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
  Calendar as CalendarComponent,
} from '@cargoro/ui';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// 폼 스키마
const vehicleSchema = z.object({
  vehicleNumber: z.string().min(1, '차량번호를 입력해주세요'),
  manufacturer: z.string().min(1, '제조사를 입력해주세요'),
  model: z.string().min(1, '모델명을 입력해주세요'),
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1, '올바른 연식을 입력해주세요'),
  vin: z.string().optional(),
  engineType: z.enum(['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC']),
  color: z.string().optional(),
  mileage: z.number().min(0).optional(),
  registrationDate: z.date(),
  customerId: z.string().optional(),
  notes: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  vehicleId?: string;
  initialData?: Partial<VehicleFormValues>;
}

export function VehicleForm({ vehicleId, initialData }: VehicleFormProps): React.JSX.Element {
  const router = useRouter();
  const isEditing = !!vehicleId;
  const [customerSearch, setCustomerSearch] = useState('');
  interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
  }
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData || {
      engineType: 'GASOLINE',
      year: new Date().getFullYear(),
      registrationDate: new Date(),
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
          email: 'kim@example.com',
        },
        {
          id: '2',
          name: '이영희',
          phone: '010-2345-6789',
          email: 'lee@example.com',
        },
      ];
    },
    enabled: customerSearch.length > 0,
  });

  // 차량 생성/수정
  const mutation = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      // TODO: 실제 API 호출로 변경
      // isEditing ? 'Updating vehicle:' : 'Creating vehicle:', values
      return { id: vehicleId || 'new-vehicle-id' };
    },
    onSuccess: data => {
      toast.success(isEditing ? '차량이 수정되었습니다' : '차량이 등록되었습니다');
      router.push(`/vehicles/${data.id}`);
    },
    onError: () => {
      toast.error(isEditing ? '차량 수정에 실패했습니다' : '차량 등록에 실패했습니다');
    },
  });

  const onSubmit = (values: VehicleFormValues): void => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? '차량 수정' : '새 차량 등록'}</CardTitle>
            <CardDescription>
              {isEditing ? '차량 정보를 수정합니다' : '새로운 차량을 등록합니다'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="vehicleNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>차량번호</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 12가 3456" {...field} />
                    </FormControl>
                    <FormDescription>등록된 차량번호를 정확히 입력해주세요</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>차대번호 (VIN)</FormLabel>
                    <FormControl>
                      <Input placeholder="17자리 차대번호 (선택사항)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제조사</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 현대, 기아, 벤츠" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>모델명</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 소나타, K5, E-클래스" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연식</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        placeholder="예: 2023"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>엔진 타입</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GASOLINE">가솔린</SelectItem>
                        <SelectItem value="DIESEL">디젤</SelectItem>
                        <SelectItem value="HYBRID">하이브리드</SelectItem>
                        <SelectItem value="ELECTRIC">전기</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>색상</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 검정, 흰색, 은색" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재 주행거리</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="km 단위로 입력"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>현재 계기판의 주행거리를 입력하세요</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>등록일</FormLabel>
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
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>차량 등록증상의 최초등록일</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 소유자 정보 */}
            <div className="space-y-4">
              <FormLabel>소유자 정보 (선택사항)</FormLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="고객명, 전화번호, 이메일로 검색..."
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
                      }}
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.phone} · {customer.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCustomer && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">선택된 소유자</p>
                  <p className="text-sm">
                    {selectedCustomer.name} ({selectedCustomer.phone})
                  </p>
                </div>
              )}
            </div>

            {/* 비고 */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비고</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="차량에 대한 추가 정보나 특이사항을 입력하세요..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
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
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? isEditing
                ? '수정 중...'
                : '등록 중...'
              : isEditing
                ? '차량 수정'
                : '차량 등록'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
