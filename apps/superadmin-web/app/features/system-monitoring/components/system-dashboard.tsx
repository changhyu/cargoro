'use client';

import { useSystemDashboard } from '../hooks/use-system-monitoring';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '@cargoro/ui';
import {
  Activity,
  Database,
  Server,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export function SystemDashboard() {
  const { data: dashboard, isLoading, error } = useSystemDashboard();

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>시스템 대시보드를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">시스템 정보를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
      case 'disconnected':
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 시스템 메트릭 개요 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">CPU 사용률</p>
                <p className="text-2xl font-bold">{dashboard.systemMetrics.cpu.usage}%</p>
                <Progress value={dashboard.systemMetrics.cpu.usage} className="mt-2" />
              </div>
              <Activity
                className={`h-8 w-8 ${dashboard.systemMetrics.cpu.usage > 80 ? 'text-red-500' : 'text-blue-500'}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">메모리 사용률</p>
                <p className="text-2xl font-bold">{dashboard.systemMetrics.memory.percentage}%</p>
                <Progress value={dashboard.systemMetrics.memory.percentage} className="mt-2" />
              </div>
              <Server
                className={`h-8 w-8 ${dashboard.systemMetrics.memory.percentage > 80 ? 'text-red-500' : 'text-green-500'}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">가동률 (30일)</p>
                <p className="text-2xl font-bold">{dashboard.uptimePercentage}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">활성 사용자</p>
                <p className="text-2xl font-bold">
                  {dashboard.applications.reduce((sum, app) => sum + app.activeUsers, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 서비스 상태 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              서비스 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.services.map(service => (
                <div
                  key={service.serviceName}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(service.status)}>
                      {service.status === 'healthy'
                        ? '정상'
                        : service.status === 'degraded'
                          ? '저하'
                          : '중단'}
                    </Badge>
                    <div>
                      <p className="font-medium">{service.serviceName}</p>
                      <p className="text-sm text-gray-500">
                        응답시간: {service.responseTime}ms | 오류율: {service.errorRate}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {Math.floor(service.uptime / 3600)}시간
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 데이터베이스 상태 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              데이터베이스 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.databases.map(db => (
                <div key={db.name} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(db.status)}>
                        {db.status === 'connected'
                          ? '연결됨'
                          : db.status === 'disconnected'
                            ? '연결끊김'
                            : '오류'}
                      </Badge>
                      <span className="font-medium">{db.name}</span>
                      <span className="text-sm text-gray-500">({db.type})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">연결:</span> {db.connections.active}/
                      {db.connections.max}
                    </div>
                    <div>
                      <span className="text-gray-500">평균응답:</span>{' '}
                      {db.queryPerformance.avgResponseTime}ms
                    </div>
                    <div>
                      <span className="text-gray-500">느린쿼리:</span>{' '}
                      {db.queryPerformance.slowQueries}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 애플리케이션 메트릭 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            애플리케이션 성능
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboard.applications.map(app => (
              <div key={app.appName} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">{app.appName}</h4>
                  <Badge variant="outline">{app.environment}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">버전</span>
                    <span>{app.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">활성 사용자</span>
                    <span>
                      {app.activeUsers}/{app.totalUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">요청/분</span>
                    <span>{app.requestsPerMinute}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">평균 응답시간</span>
                    <span>{app.avgResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">오류율</span>
                    <span className={app.errorRate > 5 ? 'text-red-600' : ''}>
                      {app.errorRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 최근 알림 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            최근 시스템 알림
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dashboard.recentAlerts.length === 0 ? (
              <p className="py-4 text-center text-gray-500">최근 알림이 없습니다.</p>
            ) : (
              dashboard.recentAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 ${alert.resolved ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 ${
                          alert.severity === 'critical' || alert.severity === 'error'
                            ? 'text-red-500'
                            : alert.severity === 'warning'
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                        }`}
                      >
                        {getAlertIcon(alert.severity)}
                      </span>
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-gray-500">{alert.message}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleString('ko-KR')} · {alert.source}
                        </p>
                      </div>
                    </div>
                    {alert.resolved && <Badge variant="success">해결됨</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
