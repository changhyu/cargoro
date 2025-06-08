import React, { useState } from 'react';
import { Calendar } from '@cargoro/ui';
import { useToast } from '@cargoro/ui';
import { useTranslation } from 'react-i18next';

// 타입 정의
export interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  customerName: string;
  vehicleInfo: string;
  notes?: string;
}

export interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentSelect?: (appointment: Appointment) => void;
  onDateChange?: (date: Date) => void;
}

/**
 * 예약 캘린더 컴포넌트
 *
 * 정비소의 예약 일정을 캘린더 형태로 표시합니다.
 */
export function AppointmentCalendar({
  appointments = [],
  onAppointmentSelect,
  onDateChange,
}: AppointmentCalendarProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 선택된 날짜의 예약만 필터링
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    return (
      appointmentDate.getDate() === selectedDate.getDate() &&
      appointmentDate.getMonth() === selectedDate.getMonth() &&
      appointmentDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // 날짜 변경 핸들러
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onDateChange?.(date);
  };

  // 예약 선택 핸들러
  const handleAppointmentClick = (appointment: Appointment) => {
    onAppointmentSelect?.(appointment);
    toast({
      title: t('appointments.selected'),
      description: `${appointment.customerName} - ${appointment.vehicleInfo}`,
    });
  };

  return (
    <div className="appointment-calendar">
      <div className="calendar-container">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date: Date | undefined) => date && handleDateChange(date)}
          className="rounded-md border"
        />
      </div>

      <div className="appointments-list mt-4">
        <h3 className="mb-2 text-lg font-medium">
          {t('appointments.forDate', { date: selectedDate.toLocaleDateString() })}
        </h3>

        {filteredAppointments.length === 0 ? (
          <p className="text-muted-foreground">{t('appointments.noAppointments')}</p>
        ) : (
          <ul className="space-y-2">
            {filteredAppointments.map(appointment => (
              <li
                key={appointment.id}
                className="cursor-pointer rounded-md border p-3 hover:bg-accent"
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{appointment.title}</span>
                  <span className={`status status-${appointment.status}`}>
                    {t(`appointments.status.${appointment.status}`)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(appointment.startTime).toLocaleTimeString()} -
                  {new Date(appointment.endTime).toLocaleTimeString()}
                </div>
                <div className="text-sm">
                  {appointment.customerName} • {appointment.vehicleInfo}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
