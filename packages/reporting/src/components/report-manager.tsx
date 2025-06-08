'use client';

import { useState } from 'react';
import { Badge, Button, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from '@cargoro/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cargoro/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@cargoro/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@cargoro/ui';
import {
  FileText,
  Download,
  Trash2,
  MoreVertical,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useReportJobs, useReportHistory } from '../hooks';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function ReportManager() {
  const [activeTab, setActiveTab] = useState('jobs');
  const { jobs, pendingJobs, removeJob, downloadReport, retryJob } = useReportJobs();

  const {
    history,
    isPending: isHistoryLoading,
    downloadFromHistory,
    clearHistory,
    refresh: refreshHistory,
  } = useReportHistory();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      queued: { label: '대기중', variant: 'secondary' as const },
      processing: { label: '처리중', variant: 'default' as const },
      completed: { label: '완료', variant: 'success' as const },
      failed: { label: '실패', variant: 'destructive' as const },
    };

    const { label, variant } = config[status as keyof typeof config] || {
      label: status,
      variant: 'outline' as const,
    };

    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>보고서 관리</CardTitle>
            <CardDescription>생성된 보고서와 작업 현황을 확인하세요</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'history' && (
              <>
                <Button variant="outline" size="sm" onClick={() => refreshHistory()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  새로고침
                </Button>
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  전체 삭제
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">
              작업 현황
              {pendingJobs.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingJobs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">보고서 이력</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            {jobs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p>진행 중인 작업이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map(job => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      {getStatusIcon(job.status)}
                      <div className="flex-1">
                        <p className="font-medium">{job.templateId}</p>
                        <p className="text-sm text-muted-foreground">
                          생성 시간:{' '}
                          {formatDistanceToNow(job.createdAt, { addSuffix: true, locale: ko })}
                        </p>
                      </div>
                      {job.status === 'processing' && (
                        <div className="w-32">
                          <Progress value={job.progress} className="h-2" />
                          <p className="mt-1 text-center text-xs text-muted-foreground">
                            {job.progress}%
                          </p>
                        </div>
                      )}
                      {getStatusBadge(job.status)}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>작업</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {job.status === 'completed' && job.result?.url && (
                          <DropdownMenuItem onClick={() => downloadReport(job.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            다운로드
                          </DropdownMenuItem>
                        )}
                        {job.status === 'failed' && (
                          <DropdownMenuItem onClick={() => retryJob(job.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            재시도
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => removeJob(job.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p>보고서 이력이 없습니다</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>보고서명</TableHead>
                    <TableHead>생성일시</TableHead>
                    <TableHead>생성자</TableHead>
                    <TableHead>형식</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.templateName}</TableCell>
                      <TableCell>{new Date(item.generatedAt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell>{item.generatedBy}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.format.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'success' ? 'success' : 'destructive'}>
                          {item.status === 'success' ? '성공' : '실패'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status === 'success' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFromHistory(item.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
