'use client';

import { useForm, Controller } from 'react-hook-form';
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
import { useCreateCustomer, useUpdateCustomer } from '../hooks/use-customers';
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from '../types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

// 유효성 검사 스키마
const customerSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z.string().regex(/^[0-9-]+$/, '올바른 전화번호 형식이 아닙니다'),
  address: z.string().optional(),
  businessNumber: z.string().optional(),
  customerType: z.enum(['individual', 'business']),
  notes: z.string().optional(),
});

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const router = useRouter();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      businessNumber: customer?.businessNumber || '',
      customerType: customer?.customerType || 'individual',
      notes: customer?.notes || '',
    },
  });

  const customerType = watch('customerType');

  const onSubmit = async (data: CreateCustomerInput) => {
    try {
      if (isEditing && customer) {
        await updateCustomerMutation.mutateAsync({
          id: customer.id,
          data: data as UpdateCustomerInput,
        });
      } else {
        await createCustomerMutation.mutateAsync(data);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/customers');
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{isEditing ? '고객 정보 수정' : '신규 고객 등록'}</CardTitle>
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로가기
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 고객 구분 */}
            <div className="space-y-2">
              <Label htmlFor="customerType">고객 구분</Label>
              <Controller
                name="customerType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="customerType">
                      <SelectValue placeholder="고객 구분을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">개인</SelectItem>
                      <SelectItem value="business">법인</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerType && (
                <p className="text-sm text-red-500">{errors.customerType.message}</p>
              )}
            </div>

            {/* 이름/회사명 */}
            <div className="space-y-2">
              <Label htmlFor="name">{customerType === 'business' ? '회사명' : '고객명'}</Label>
              <Input
                {...register('name')}
                id="name"
                placeholder={
                  customerType === 'business' ? '회사명을 입력하세요' : '고객명을 입력하세요'
                }
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* 전화번호 */}
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input {...register('phone')} id="phone" placeholder="010-0000-0000" />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            {/* 사업자번호 (법인만) */}
            {customerType === 'business' && (
              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자번호</Label>
                <Input
                  {...register('businessNumber')}
                  id="businessNumber"
                  placeholder="000-00-00000"
                />
                {errors.businessNumber && (
                  <p className="text-sm text-red-500">{errors.businessNumber.message}</p>
                )}
              </div>
            )}
          </div>

          {/* 주소 */}
          <div className="space-y-2">
            <Label htmlFor="address">주소</Label>
            <Input {...register('address')} id="address" placeholder="주소를 입력하세요" />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              {...register('notes')}
              id="notes"
              placeholder="고객에 대한 메모를 입력하세요"
              rows={4}
            />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? '저장 중...' : isEditing ? '수정 완료' : '등록 완료'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
