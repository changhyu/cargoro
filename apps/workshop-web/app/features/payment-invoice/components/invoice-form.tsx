'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useCreateInvoice, useUpdateInvoice } from '../hooks/use-invoices';
import { useCustomers } from '../../customer-management/hooks/use-customers';
import type { Invoice, CreateInvoiceInput } from '../types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';
import { format, addDays } from 'date-fns';

// 송장 항목 스키마
const invoiceItemSchema = z.object({
  description: z.string().min(1, '설명을 입력하세요'),
  quantity: z.number().min(1, '수량은 1 이상이어야 합니다'),
  unitPrice: z.number().min(0, '단가는 0 이상이어야 합니다'),
  type: z.enum(['service', 'part', 'other']),
});

// 송장 스키마
const invoiceSchema = z.object({
  customerId: z.string().min(1, '고객을 선택하세요'),
  vehicleId: z.string().optional(),
  repairId: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().min(1, '만기일을 선택하세요'),
  items: z.array(invoiceItemSchema).min(1, '최소 하나의 항목을 추가하세요'),
  discount: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

interface InvoiceFormProps {
  invoice?: Invoice;
  customerId?: string;
  repairId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InvoiceForm({
  invoice,
  customerId,
  repairId,
  onSuccess,
  onCancel,
}: InvoiceFormProps) {
  const router = useRouter();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const { data: customers } = useCustomers();

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const isEditing = !!invoice;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: customerId || invoice?.customerId || '',
      vehicleId: invoice?.vehicleId || '',
      repairId: repairId || invoice?.repairId || '',
      issueDate: invoice?.issueDate || format(new Date(), 'yyyy-MM-dd'),
      dueDate: invoice?.dueDate || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      items: invoice?.items || [
        { description: '', quantity: 1, unitPrice: 0, type: 'service' as const },
      ],
      discount: invoice?.discount || 0,
      notes: invoice?.notes || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchDiscount = watch('discount') || 0;

  // 금액 계산
  useEffect(() => {
    const calculateTotals = () => {
      const itemsTotal = watchItems.reduce((sum, item) => {
        return sum + item.quantity * item.unitPrice;
      }, 0);

      const discountAmount = (itemsTotal * watchDiscount) / 100;
      const subtotalAmount = itemsTotal - discountAmount;
      const taxAmount = subtotalAmount * 0.1; // 10% 부가세
      const totalAmount = subtotalAmount + taxAmount;

      setSubtotal(subtotalAmount);
      setTax(taxAmount);
      setTotal(totalAmount);
    };

    calculateTotals();
  }, [watchItems, watchDiscount]);

  const onSubmit = async (data: CreateInvoiceInput) => {
    try {
      // 각 항목에 amount 추가
      const itemsWithAmount = data.items.map(item => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      }));

      const invoiceData = {
        ...data,
        items: itemsWithAmount,
      };

      if (isEditing && invoice) {
        await updateInvoiceMutation.mutateAsync({
          id: invoice.id,
          data: invoiceData,
        });
      } else {
        await createInvoiceMutation.mutateAsync(invoiceData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/invoices');
      }
    } catch (error) {
      // TODO: 에러 처리 및 로깅 구현
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isEditing ? '송장 수정' : '송장 생성'}</CardTitle>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로가기
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerId">고객</Label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="customerId">
                      <SelectValue placeholder="고객을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerId && (
                <p className="text-sm text-red-500">{errors.customerId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">만기일</Label>
              <Input {...register('dueDate')} id="dueDate" type="date" />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message}</p>}
            </div>
          </div>

          {/* 송장 항목 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>송장 항목</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ description: '', quantity: 1, unitPrice: 0, amount: 0, type: 'service' })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                항목 추가
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="grid gap-4 md:grid-cols-12">
                      <div className="md:col-span-5">
                        <Label htmlFor={`items.${index}.description`}>설명</Label>
                        <Input
                          {...register(`items.${index}.description`)}
                          placeholder="서비스 또는 부품 설명"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`items.${index}.type`}>구분</Label>
                        <Controller
                          name={`items.${index}.type`}
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="service">서비스</SelectItem>
                                <SelectItem value="part">부품</SelectItem>
                                <SelectItem value="other">기타</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`items.${index}.quantity`}>수량</Label>
                        <Input
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          type="number"
                          min="1"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`items.${index}.unitPrice`}>단가</Label>
                        <Input
                          {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                          type="number"
                          min="0"
                        />
                      </div>

                      <div className="flex items-end md:col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {errors.items && <p className="text-sm text-red-500">{errors.items.message}</p>}
          </div>

          {/* 할인 및 메모 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discount">할인율 (%)</Label>
              <Input
                {...register('discount', { valueAsNumber: true })}
                id="discount"
                type="number"
                min="0"
                max="100"
                placeholder="0"
              />
              {errors.discount && <p className="text-sm text-red-500">{errors.discount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              {...register('notes')}
              id="notes"
              placeholder="송장에 대한 메모를 입력하세요"
              rows={3}
            />
          </div>

          {/* 금액 요약 */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>소계</span>
                  <span>{formatCurrency(subtotal + (subtotal * watchDiscount) / 100)}</span>
                </div>
                {watchDiscount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>할인 ({watchDiscount}%)</span>
                    <span>-{formatCurrency((subtotal * watchDiscount) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>공급가액</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>부가세 (10%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>총 금액</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? '저장 중...' : isEditing ? '수정 완료' : '송장 생성'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
