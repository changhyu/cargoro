'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useToast } from '@/app/hooks/use-toast';
import { authApi } from '@/app/lib/api/auth';
import { useAuthStore } from '@/app/state/auth-store';

// 로그인 폼 스키마
const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setAuth, setLoading, setError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoading(true);
    setError(null);

    try {
      // 로그인 API 호출
      const tokenResponse = await authApi.login({
        username: data.email, // OAuth2 표준에서는 username 사용
        password: data.password,
      });

      // 사용자 정보 조회
      const user = await authApi.getCurrentUser(tokenResponse.access_token);

      // 상태 저장
      setAuth(user, tokenResponse.access_token);

      toast({
        title: '로그인 성공',
        description: `환영합니다, ${user.name}님!`,
      });

      // 대시보드로 이동
      router.push('/');
    } catch (error: any) {
      const message = error.message || '로그인에 실패했습니다';
      setError(message);
      toast({
        title: '로그인 실패',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-lg bg-primary p-3">
              <Car className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">CarGoro 관리 시스템</CardTitle>
          <CardDescription className="text-center">렌터카/리스 통합 관리 플랫폼</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>테스트 계정</p>
            <p className="mt-1">
              관리자: admin@cargoro.com / admin1234
              <br />
              매니저: manager@cargoro.com / manager1234
              <br />
              사용자: user@cargoro.com / user1234
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
