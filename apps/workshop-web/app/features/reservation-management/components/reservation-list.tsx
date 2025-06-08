'use client';

/**
 * 예약 목록 컴포넌트
 */
import { useState } from 'react';
import { useReservations } from '../hooks/use-reservation-api';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@cargoro/ui';
import { format } from 'date-fns';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '@cargoro/ui';

const statusColors = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

type ReservationStatusKey = keyof typeof statusColors;

export function ReservationList() {
  const [filter, setFilter] = useState({});
  const { data, isLoading, isError, error } = useReservations(filter);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">
          {error instanceof Error ? error.message : '예약 목록을 불러오는 중 오류가 발생했습니다.'}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>예약 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button variant="outline" onClick={() => setFilter({})}>
            모든 예약 보기
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>예약 ID</TableHead>
              <TableHead>고객 ID</TableHead>
              <TableHead>차량 ID</TableHead>
              <TableHead>서비스 유형</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.reservations.map(reservation => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.id}</TableCell>
                <TableCell>{reservation.customerId}</TableCell>
                <TableCell>{reservation.vehicleId}</TableCell>
                <TableCell>{reservation.serviceType}</TableCell>
                <TableCell>{format(new Date(reservation.date), 'yyyy-MM-dd HH:mm')}</TableCell>
                <TableCell>
                  <Badge className={statusColors[reservation.status as ReservationStatusKey]}>
                    {reservation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      상세
                    </Button>
                    <Button variant="ghost" size="sm">
                      수정
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
