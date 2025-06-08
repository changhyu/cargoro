'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@cargoro/ui';
import { useToast } from '@cargoro/ui';

// 정비 작업 타입
export interface RepairTask {
  id: string;
  name: string;
  description?: string;
  estimatedHours: number;
  price: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  technicianId?: string;
  technicianName?: string;
}

// 정비 주문서 타입
export interface RepairOrder {
  id: string;
  orderNumber: string;
  vehicleId: string;
  vehicleInfo: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'draft' | 'approved' | 'in-progress' | 'completed' | 'cancelled';
  totalPrice: number;
  tasks: RepairTask[];
  notes?: string;
}

export interface RepairOrderProps {
  repairOrder: RepairOrder;
  onUpdate?: (updatedOrder: RepairOrder) => void;
  onStatusChange?: (orderId: string, newStatus: RepairOrder['status']) => void;
  onTaskStatusChange?: (orderId: string, taskId: string, newStatus: RepairTask['status']) => void;
  isEditable?: boolean;
}

/**
 * 정비 주문서 컴포넌트
 *
 * 정비 작업 주문서 정보와 세부 작업 목록을 표시합니다.
 */
export function RepairOrder({
  repairOrder,
  onUpdate,
  onStatusChange,
  onTaskStatusChange,
  isEditable = false,
}: Readonly<RepairOrderProps>) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [notes, setNotes] = useState(repairOrder.notes || '');

  // 주문서 상태 변경 핸들러
  const handleStatusChange = (newStatus: RepairOrder['status']) => {
    if (onStatusChange) {
      onStatusChange(repairOrder.id, newStatus);
      toast({
        title: t('repairs.statusChanged'),
        description: t(`repairs.status.${newStatus}`),
      });
    }
  };

  // 작업 상태 변경 핸들러
  const handleTaskStatusChange = (taskId: string, newStatus: RepairTask['status']) => {
    if (onTaskStatusChange) {
      onTaskStatusChange(repairOrder.id, taskId, newStatus);
      toast({
        title: t('repairs.taskStatusChanged'),
        description: t(`repairs.taskStatus.${newStatus}`),
      });
    }
  };

  // 메모 업데이트 핸들러
  const handleNotesUpdate = () => {
    if (onUpdate && repairOrder.notes !== notes) {
      const updatedOrder = { ...repairOrder, notes };

      onUpdate(updatedOrder);
      toast({
        title: t('repairs.notesUpdated'),
      });
    }
  };

  return (
    <div className="repair-order rounded-lg border p-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold">
            {t('repairs.orderNumber')}: {repairOrder.orderNumber}
          </h2>
          <p className="mb-1 text-muted-foreground">
            {repairOrder.vehicleInfo} - {repairOrder.customerName}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('repairs.created')}: {new Date(repairOrder.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium
              ${repairOrder.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
              ${repairOrder.status === 'approved' ? 'bg-blue-100 text-blue-800' : ''}
              ${repairOrder.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${repairOrder.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
              ${repairOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
            `}
          >
            {t(`repairs.status.${repairOrder.status}`)}
          </span>
          {isEditable && (
            <div className="mt-2 flex space-x-2">
              {repairOrder.status === 'draft' && (
                <Button onClick={() => handleStatusChange('approved')} size="sm">
                  {t('repairs.approve')}
                </Button>
              )}
              {repairOrder.status === 'approved' && (
                <Button onClick={() => handleStatusChange('in-progress')} size="sm">
                  {t('repairs.startWork')}
                </Button>
              )}
              {repairOrder.status === 'in-progress' && (
                <Button onClick={() => handleStatusChange('completed')} size="sm">
                  {t('repairs.complete')}
                </Button>
              )}
              {['draft', 'approved'].includes(repairOrder.status) && (
                <Button
                  onClick={() => handleStatusChange('cancelled')}
                  size="sm"
                  variant="destructive"
                >
                  {t('repairs.cancel')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="tasks-section mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('repairs.tasks')}</h3>
          {isEditable &&
            !isAddingTask &&
            repairOrder.status !== 'completed' &&
            repairOrder.status !== 'cancelled' && (
              <Button onClick={() => setIsAddingTask(true)} size="sm">
                {t('repairs.addTask')}
              </Button>
            )}
        </div>

        {repairOrder.tasks.length === 0 ? (
          <p className="py-4 text-muted-foreground">{t('repairs.noTasks')}</p>
        ) : (
          <div className="space-y-3">
            {repairOrder.tasks.map(task => (
              <div key={task.id} className="task-item rounded border p-3">
                <div className="flex justify-between">
                  <h4 className="font-medium">{task.name}</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium
                      ${task.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
                      ${task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${task.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${task.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}
                  >
                    {t(`repairs.taskStatus.${task.status}`)}
                  </span>
                </div>
                {task.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div>
                    {t('repairs.estimatedHours')}: {task.estimatedHours} | {t('repairs.price')}: ₩
                    {task.price.toLocaleString()}
                  </div>
                  {isEditable && task.status !== 'completed' && task.status !== 'cancelled' && (
                    <div className="flex space-x-2">
                      {task.status === 'pending' && (
                        <Button
                          onClick={() => handleTaskStatusChange(task.id, 'in-progress')}
                          size="sm"
                          variant="outline"
                        >
                          {t('repairs.start')}
                        </Button>
                      )}
                      {task.status === 'in-progress' && (
                        <Button
                          onClick={() => handleTaskStatusChange(task.id, 'completed')}
                          size="sm"
                          variant="outline"
                        >
                          {t('repairs.complete')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">{t('repairs.notes')}</h3>
        {isEditable ? (
          <div>
            <textarea
              className="min-h-[100px] w-full resize-y rounded-md border p-2"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('repairs.notesPlaceholder')}
            />
            <Button onClick={handleNotesUpdate} className="mt-2" size="sm">
              {t('repairs.saveNotes')}
            </Button>
          </div>
        ) : (
          <p className="min-h-[50px] rounded-md border p-2 text-muted-foreground">
            {repairOrder.notes || t('repairs.noNotes')}
          </p>
        )}
      </div>

      <div className="summary mt-6 text-right">
        <div className="text-lg font-semibold">
          {t('repairs.totalPrice')}: ₩{repairOrder.totalPrice.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
