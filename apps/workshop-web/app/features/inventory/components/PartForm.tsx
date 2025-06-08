'use client';

// useState import 제거됨
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
} from '@cargoro/ui';

// 폼 스키마
const partSchema = z.object({
  partNumber: z.string().min(1, '부품번호를 입력해주세요'),
  name: z.string().min(1, '부품명을 입력해주세요'),
  description: z.string().optional(),
  manufacturer: z.string().min(1, '제조사를 입력해주세요'),
  model: z.string().optional(),
  categoryId: z.string().min(1, '카테고리를 선택해주세요'),
  unit: z.enum(['EA', 'SET', 'BOX', 'L', 'KG']),
  currentStock: z.number().min(0, '재고는 0 이상이어야 합니다'),
  minStock: z.number().min(0, '최소재고는 0 이상이어야 합니다'),
  maxStock: z.number().min(1, '최대재고는 1 이상이어야 합니다'),
  location: z.string().min(1, '보관위치를 입력해주세요'),
  price: z.number().min(0, '판매가는 0 이상이어야 합니다'),
  cost: z.number().min(0, '원가는 0 이상이어야 합니다'),
  supplierId: z.string().optional(),
  barcode: z.string().optional(),
});

type PartFormValues = z.infer<typeof partSchema>;

interface PartFormProps {
  partId?: string;
  initialData?: Partial<PartFormValues>;
}

export function PartForm({ partId, initialData }: PartFormProps) {
  const router = useRouter();
  const isEditing = !!partId;

  const form = useForm<PartFormValues>({
    resolver: zodResolver(partSchema),
    defaultValues: initialData || {
      unit: 'EA',
      currentStock: 0,
      minStock: 0,
      maxStock: 100,
    },
  });

  // 카테고리 목록 조회
  const { data: categories } = useQuery({
    queryKey: ['partCategories'],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      return [
        { id: '1', name: '엔진부품' },
        { id: '2', name: '제동장치' },
        { id: '3', name: '오일/윤활유' },
        { id: '4', name: '전기장치' },
        { id: '5', name: '서스펜션' },
        { id: '6', name: '냉각계통' },
        { id: '7', name: '배기계통' },
        { id: '8', name: '기타' },
      ];
    },
  });

  // 공급업체 목록 조회
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      return [
        { id: '1', name: '현대모비스' },
        { id: '2', name: '상신브레이크' },
        { id: '3', name: 'SK루브리컨츠' },
        { id: '4', name: '한국타이어' },
        { id: '5', name: '델파이' },
      ];
    },
  });

  // 부품 생성/수정
  const mutation = useMutation({
    mutationFn: async (_values: PartFormValues) => {
      // TODO: 실제 API 호출로 변경
      // 디버깅 로그는 프로덕션에서 제거
      return { id: partId || 'new-part-id' };
    },
    onSuccess: () => {
      toast.success(isEditing ? '부품이 수정되었습니다' : '부품이 등록되었습니다');
      router.push('/inventory');
    },
    onError: () => {
      toast.error(isEditing ? '부품 수정에 실패했습니다' : '부품 등록에 실패했습니다');
    },
  });

  const onSubmit = (values: PartFormValues) => {
    // 최소/최대 재고 검증
    if (values.minStock > values.maxStock) {
      form.setError('minStock', {
        message: '최소재고는 최대재고보다 작아야 합니다',
      });
      return;
    }

    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? '부품 수정' : '새 부품 등록'}</CardTitle>
            <CardDescription>
              {isEditing ? '부품 정보를 수정합니다' : '새로운 부품을 등록합니다'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* 부품번호 */}
              <FormField
                control={form.control}
                name="partNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>부품번호</FormLabel>
                    <FormControl>
                      <Input placeholder="예: ENG-001" {...field} />
                    </FormControl>
                    <FormDescription>고유한 부품 식별 번호</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 부품명 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>부품명</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 엔진오일 필터" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 제조사 */}
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제조사</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 현대모비스" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 적용모델 */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>적용모델</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 소나타, K5" {...field} />
                    </FormControl>
                    <FormDescription>적용 가능한 차종 (선택사항)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 카테고리 */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 단위 */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>단위</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EA">개</SelectItem>
                        <SelectItem value="SET">세트</SelectItem>
                        <SelectItem value="BOX">박스</SelectItem>
                        <SelectItem value="L">리터</SelectItem>
                        <SelectItem value="KG">kg</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="부품에 대한 상세 설명을 입력하세요..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              {/* 현재재고 */}
              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재재고</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 최소재고 */}
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최소재고</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>이 수량 이하시 알림</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 최대재고 */}
              <FormField
                control={form.control}
                name="maxStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최대재고</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>보관 가능한 최대 수량</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* 보관위치 */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>보관위치</FormLabel>
                    <FormControl>
                      <Input placeholder="예: A-1-3" {...field} />
                    </FormControl>
                    <FormDescription>창고 내 보관 위치</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 바코드 */}
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>바코드</FormLabel>
                    <FormControl>
                      <Input placeholder="바코드 번호 (선택사항)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 원가 */}
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>원가</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>부품 구입 원가 (원)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 판매가 */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>판매가</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>고객 판매 가격 (원)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 공급업체 */}
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>공급업체</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="공급업체를 선택하세요 (선택사항)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                ? '부품 수정'
                : '부품 등록'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
