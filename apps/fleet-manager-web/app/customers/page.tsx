'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Home,
  Phone,
  MapPin,
  Plus,
  Search,
  FileText,
  Car,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useRentalStore } from '@/app/stores/rentalStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const customerFormSchema = z.object({
  type: z.enum(['INDIVIDUAL', 'CORPORATE']),
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  phone: z.string().min(1, '연락처를 입력해주세요'),
  address: z.string().min(1, '주소를 입력해주세요'),
  licenseNumber: z.string().optional(),
  businessNumber: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const verificationStatusConfig = {
  PENDING: { label: '검증 대기', variant: 'secondary' as const, icon: Clock },
  VERIFIED: { label: '검증 완료', variant: 'success' as const, icon: CheckCircle },
  REJECTED: { label: '검증 거부', variant: 'destructive' as const, icon: AlertCircle },
};

export default function CustomersPage() {
  const { customers, loadCustomers, addCustomer, verifyCustomer, filterContractsByCustomer } =
    useRentalStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      type: 'INDIVIDUAL',
      name: '',
      email: '',
      phone: '',
      address: '',
      licenseNumber: '',
      businessNumber: '',
    },
  });

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesType = typeFilter === 'ALL' || customer.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: keyof typeof verificationStatusConfig) => {
    const config = verificationStatusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      await addCustomer({
        ...data,
        verificationStatus: 'PENDING',
        creditScore: undefined,
      });

      form.reset();
      setIsAddDialogOpen(false);
    } catch (_error) {
      // 에러 처리는 store에서 처리됨
    }
  };

  const getCustomerContracts = (customerId: string) => {
    const { rentals, leases } = filterContractsByCustomer(customerId);
    return {
      totalContracts: rentals.length + leases.length,
      activeContracts:
        rentals.filter(r => r.status === 'ACTIVE').length +
        leases.filter(l => l.status === 'ACTIVE').length,
    };
  };

  const totalRevenue = customers.reduce((sum, customer) => {
    const { rentals, leases } = filterContractsByCustomer(customer.id);
    const rentalRevenue = rentals.reduce((s, r) => s + r.totalAmount, 0);
    const leaseRevenue = leases.reduce((s, l) => s + l.monthlyPayment * 12, 0);
    return sum + rentalRevenue + leaseRevenue;
  }, 0);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">고객 관리</h1>
          <p className="mt-2 text-gray-600">개인 및 법인 고객 정보를 관리합니다</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              고객 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>새 고객 등록</DialogTitle>
              <DialogDescription>고객 정보를 입력하여 새로운 고객을 등록하세요</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>고객 유형</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL">개인</SelectItem>
                          <SelectItem value="CORPORATE">법인</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름/회사명</FormLabel>
                      <FormControl>
                        <Input placeholder="홍길동 또는 (주)테크솔루션" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>연락처</FormLabel>
                        <FormControl>
                          <Input placeholder="010-1234-5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주소</FormLabel>
                      <FormControl>
                        <Input placeholder="서울시 강남구..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('type') === 'INDIVIDUAL' && (
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>운전면허번호</FormLabel>
                        <FormControl>
                          <Input placeholder="12-34-567890-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('type') === 'CORPORATE' && (
                  <FormField
                    control={form.control}
                    name="businessNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>사업자등록번호</FormLabel>
                        <FormControl>
                          <Input placeholder="123-45-67890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit">등록</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 고객</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}명</div>
            <p className="text-xs text-muted-foreground">
              개인: {customers.filter(c => c.type === 'INDIVIDUAL').length} | 법인:{' '}
              {customers.filter(c => c.type === 'CORPORATE').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">검증 완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.verificationStatus === 'VERIFIED').length}명
            </div>
            <p className="text-xs text-muted-foreground">신원 확인 완료</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 계약 고객</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                customers.filter(c => {
                  const contracts = getCustomerContracts(c.id);
                  return contracts.activeContracts > 0;
                }).length
              }
              명
            </div>
            <p className="text-xs text-muted-foreground">현재 이용 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출 기여</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
                notation: 'compact',
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">전체 고객 매출</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 섹션 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="이름, 이메일, 연락처로 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="고객 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">모든 고객</SelectItem>
                <SelectItem value="INDIVIDUAL">개인</SelectItem>
                <SelectItem value="CORPORATE">법인</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 고객 목록 테이블 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>고객 정보</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>계약 현황</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map(customer => {
                const contracts = getCustomerContracts(customer.id);

                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit items-center gap-1">
                        {customer.type === 'INDIVIDUAL' ? (
                          <>
                            <User className="h-3 w-3" />
                            개인
                          </>
                        ) : (
                          <>
                            <Home className="h-3 w-3" />
                            법인
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="max-w-[150px] truncate text-gray-500">
                            {customer.address}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>총 {contracts.totalContracts}건</div>
                        <div className="text-gray-500">활성: {contracts.activeContracts}건</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.verificationStatus)}</TableCell>
                    <TableCell>
                      {new Date(customer.registeredAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {customer.verificationStatus === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => verifyCustomer(customer.id, 'VERIFIED')}
                          >
                            승인
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          상세
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
