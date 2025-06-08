'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, CreditCard, FileText, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Control, FieldValues } from 'react-hook-form';
import { z } from 'zod';

import { Driver, DriverFormData } from '@/app/services/api';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/use-toast';
import { LICENSE_TYPES, DRIVING_RESTRICTIONS } from '../../constants';

// 폼 스키마 정의
const driverFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').min(2, '이름은 최소 2글자 이상이어야 합니다'),
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아닙니다'),
  phone: z
    .string()
    .min(1, '전화번호를 입력해주세요')
    .regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식(010-0000-0000)을 입력해주세요'),
  licenseNumber: z
    .string()
    .min(1, '면허번호를 입력해주세요')
    .regex(/^\d{2}-\d{2}-\d{6}-\d{2}$/, '올바른 면허번호 형식(00-00-000000-00)을 입력해주세요'),
  licenseExpiry: z.string().min(1, '면허 만료일을 입력해주세요'),
  licenseType: z.string().optional(),
  restrictions: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    })
    .optional(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

interface DriverFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  driver?: Driver | null;
  onSubmit: (data: DriverFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function DriverForm({
  driver,
  onSubmit,
  onCancel,
  isOpen = true,
  onClose,
}: DriverFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: driver?.name || '',
      email: driver?.email || '',
      phone: driver?.phone || '',
      licenseNumber: driver?.licenseNumber || '',
      licenseExpiry: driver?.licenseExpiry ? driver.licenseExpiry.split('T')[0] : '',
      licenseType: driver?.licenseType || '',
      restrictions: driver?.restrictions || [],
      notes: driver?.notes || '',
      isActive: driver?.isActive ?? true,
      department: driver?.department || '',
      position: driver?.position || '',
      emergencyContact: driver?.emergencyContact || { name: '', phone: '', relationship: '' },
    },
  });

  const handleSubmit = async (data: DriverFormValues) => {
    setLoading(true);
    try {
      // 타입 안전성을 위한 데이터 변환
      const driverData = {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        licenseNumber: data.licenseNumber || '',
        licenseExpiry: data.licenseExpiry || '',
        licenseType: data.licenseType,
        restrictions: data.restrictions || [],
        notes: data.notes,
        isActive: data.isActive ?? true,
        department: data.department,
        position: data.position,
        emergencyContact: data.emergencyContact,
      };

      await onSubmit(driverData);

      if (driver) {
        // 수정 모드
        toast({
          title: '수정 완료',
          description: '운전자 정보가 성공적으로 수정되었습니다.',
        });
        router.push(`/dashboard/drivers/${driver.id}`);
      } else {
        // 생성 모드
        toast({
          title: '등록 완료',
          description: '새 운전자가 성공적으로 등록되었습니다.',
        });
        router.push('/dashboard/drivers');
      }
    } catch {
      toast({
        title: '오류',
        description: driver ? '운전자 정보 수정에 실패했습니다.' : '운전자 등록에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{driver ? '운전자 정보 수정' : '새 운전자 등록'}</h1>
            <p className="text-muted-foreground">
              {driver ? '운전자 정보를 수정할 수 있습니다.' : '새 운전자를 등록할 수 있습니다.'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control as unknown as Control<FieldValues>}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름 *</FormLabel>
                      <FormControl>
                        <Input placeholder="홍길동" {...field} />
                      </FormControl>
                      <FormDescription>운전자의 실명을 입력해주세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as Control<FieldValues>}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일 *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="hong@example.com" {...field} />
                      </FormControl>
                      <FormDescription>연락 가능한 이메일 주소를 입력해주세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as Control<FieldValues>}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>전화번호 *</FormLabel>
                      <FormControl>
                        <Input placeholder="010-0000-0000" {...field} />
                      </FormControl>
                      <FormDescription>하이픈(-)을 포함한 형태로 입력해주세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as Control<FieldValues>}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>부서</FormLabel>
                      <FormControl>
                        <Input placeholder="운송팀" {...field} />
                      </FormControl>
                      <FormDescription>소속 부서를 입력해주세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as Control<FieldValues>}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>직책</FormLabel>
                      <FormControl>
                        <Input placeholder="운전기사" {...field} />
                      </FormControl>
                      <FormDescription>직책을 입력해주세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 긴급연락처 정보 */}
              <div className="mt-6 border-t pt-6">
                <h4 className="mb-4 text-lg font-medium">긴급연락처</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control as unknown as Control<FieldValues>}
                    name="emergencyContact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>연락처 이름</FormLabel>
                        <FormControl>
                          <Input placeholder="김가족" {...field} />
                        </FormControl>
                        <FormDescription>긴급시 연락할 분의 이름을 입력해주세요.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as unknown as Control<FieldValues>}
                    name="emergencyContact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>연락처 전화번호</FormLabel>
                        <FormControl>
                          <Input placeholder="010-0000-0000" {...field} />
                        </FormControl>
                        <FormDescription>긴급시 연락할 전화번호를 입력해주세요.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as unknown as Control<FieldValues>}
                    name="emergencyContact.relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>관계</FormLabel>
                        <FormControl>
                          <Input placeholder="배우자, 부모, 형제 등" {...field} />
                        </FormControl>
                        <FormDescription>운전자와의 관계를 입력해주세요.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 면허 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                면허 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control as unknown as Control<FieldValues>}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>면허번호 *</FormLabel>
                      <FormControl>
                        <Input placeholder="11-22-333333-44" {...field} />
                      </FormControl>
                      <FormDescription>하이픈(-)을 포함한 형태로 입력해주세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as Control<FieldValues>}
                  name="licenseExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>면허 만료일 *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>면허 만료일을 선택해주세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as Control<FieldValues>}
                  name="licenseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>면허 종류</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {field.value
                                ? LICENSE_TYPES.find(type => type.value === field.value)?.label ||
                                  field.value
                                : '면허 종류 선택'}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LICENSE_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>보유한 면허의 종류를 선택해주세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 운전 제한사항 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                운전 제한사항
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control as unknown as Control<FieldValues>}
                name="restrictions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">제한사항</FormLabel>
                      <FormDescription>해당하는 운전 제한사항을 모두 선택해주세요.</FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {DRIVING_RESTRICTIONS.map(restriction => (
                        <FormField
                          key={restriction.value}
                          control={form.control as unknown as Control<FieldValues>}
                          name="restrictions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={restriction.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(restriction.value)}
                                    onCheckedChange={checked => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            restriction.value,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: string) => value !== restriction.value
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {restriction.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as unknown as Control<FieldValues>}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>참고사항</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="운전자에 대한 추가 정보나 특이사항을 입력해주세요."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      운전 능력, 경력, 특이사항 등을 입력할 수 있습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {driver ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
