'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';
import { Input } from './input';
import { Textarea } from './textarea';

// 유효성 검사 스키마 정의
const formSchema = z.object({
  username: z.string().min(3, { message: '사용자 이름은 최소 3자 이상이어야 합니다.' }),
  email: z.string().email({ message: '올바른 이메일 형식이 아닙니다.' }),
  bio: z.string().max(500, { message: '자기소개는 최대 500자까지 작성 가능합니다.' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function UserProfileForm() {
  // useForm 훅 초기화
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
    },
  });

  // 폼 제출 처리 함수
  function onSubmit(values: FormValues) {
    console.log('폼 제출 데이터:', values);
    // 여기서 API 호출 등 처리
  }

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>사용자 이름</FormLabel>
            <FormControl>
              <Input
                placeholder="사용자 이름을 입력하세요"
                {...field}
                error={!!form.formState.errors.username}
                helperText={form.formState.errors.username?.message}
              />
            </FormControl>
            <FormDescription>프로필에 표시될 이름입니다.</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이메일</FormLabel>
            <FormControl>
              <Input
                placeholder="이메일을 입력하세요"
                type="email"
                {...field}
                error={!!form.formState.errors.email}
                helperText={form.formState.errors.email?.message}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>자기소개</FormLabel>
            <FormControl>
              <Textarea
                placeholder="자신에 대해 소개해주세요"
                {...field}
                error={!!form.formState.errors.bio}
                helperText={form.formState.errors.bio?.message}
              />
            </FormControl>
            <FormDescription>최대 500자까지 작성 가능합니다.</FormDescription>
          </FormItem>
        )}
      />

      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? '제출 중...' : '프로필 저장'}
      </button>
    </Form>
  );
}
