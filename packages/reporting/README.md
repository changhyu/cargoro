# CarGoro 보고서 패키지 사용 가이드

## 개요

`@cargoro/reporting` 패키지는 CarGoro 모노레포 내에서 PDF 및 보고서 생성 기능을 제공합니다. 이 패키지를 사용하여 다양한 형식(PDF, Excel, Word)의 보고서를 생성할 수 있습니다.

## 주요 기능

- PDF 보고서 생성
- Excel 보고서 생성
- 보고서 템플릿 관리
- 보고서 생성 이력 관리
- 템플릿 편집기
- 보고서 생성 UI 컴포넌트

## 설치 방법

모노레포 내에서는 다음과 같이 패키지를 설치합니다:

```bash
pnpm add @cargoro/reporting
```

## 기본 사용법

### 1. 보고서 생성 컴포넌트 사용

```tsx
import { ReportGenerator } from '@cargoro/reporting';

function MyReportPage() {
  const templateId = 'template-123';

  // 템플릿 데이터 (실제로는 API에서 가져올 수 있음)
  const template = {
    id: templateId,
    name: '월간 정비 보고서',
    description: '월간 정비 데이터 분석 보고서',
    parameters: [
      {
        id: 'month',
        name: 'month',
        label: '월',
        type: 'select',
        required: true,
        options: [
          { label: '1월', value: '1' },
          { label: '2월', value: '2' },
          // ...
        ],
      },
    ],
    // ...기타 템플릿 속성
  };

  return (
    <div>
      <h1>보고서 생성</h1>
      <ReportGenerator
        template={template}
        onGenerated={reportId => {
          console.log('보고서가 생성되었습니다:', reportId);
          // 생성된 보고서 처리 (다운로드 등)
        }}
      />
    </div>
  );
}
```

### 2. 보고서 이력 관리

```tsx
import { ReportManager } from '@cargoro/reporting';

function ReportsPage() {
  return (
    <div>
      <h1>보고서 관리</h1>
      <ReportManager />
    </div>
  );
}
```

### 3. 템플릿 편집기 사용

```tsx
import { TemplateEditor } from '@cargoro/reporting';
import { useState } from 'react';

function TemplateEditPage() {
  const [template, setTemplate] = useState(null);

  const handleSave = updatedTemplate => {
    console.log('템플릿 저장:', updatedTemplate);
    // API를 통해 템플릿 저장 로직
  };

  return (
    <div>
      <h1>템플릿 편집</h1>
      <TemplateEditor
        template={template}
        onSave={handleSave}
        onCancel={() => console.log('편집 취소')}
      />
    </div>
  );
}
```

## 서버 사이드 사용법

Next.js 환경에서 보고서를 서버 사이드에서 생성하려면:

```typescript
// app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { generateReport } from '@cargoro/reporting/server';

export async function POST(request: Request) {
  try {
    const { templateId, parameters } = await request.json();

    // 템플릿과 데이터 조회 (예시)
    const template = await getTemplateFromDatabase(templateId);
    const data = await fetchDataForReport(templateId, parameters);

    // 보고서 생성
    const { filePath, buffer } = await generateReport(template, data, parameters, {
      format: 'pdf',
      outputDir: './public/reports', // 정적 파일로 제공할 경로
    });

    // 파일 URL 생성
    const fileUrl = `/reports/${path.basename(filePath)}`;

    return NextResponse.json({
      success: true,
      reportUrl: fileUrl,
    });
  } catch (error) {
    console.error('보고서 생성 실패:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

## Workshop-Web 연결 방법

Workshop-Web 애플리케이션에서 보고서 패키지를 사용하려면:

1. Workshop-Web의 package.json에 의존성 추가:

```json
"dependencies": {
  "@cargoro/reporting": "workspace:*",
  // 기존 의존성들...
}
```

2. 보고서 페이지 생성:

```tsx
// apps/workshop-web/app/reports/page.tsx
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cargoro/ui';
import { ReportGenerator, ReportManager, useReportTemplates } from '@cargoro/reporting';

export default function ReportsPage() {
  const { templates, activeTemplate, setActiveTemplate } = useReportTemplates();

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">정비소 보고서</h1>

      <Tabs defaultValue="generate">
        <TabsList className="mb-4">
          <TabsTrigger value="generate">보고서 생성</TabsTrigger>
          <TabsTrigger value="history">보고서 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          {templates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-lg font-medium">템플릿 선택</h2>
                <div className="divide-y rounded-lg border">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`cursor-pointer p-4 hover:bg-muted ${
                        activeTemplate?.id === template.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setActiveTemplate(template.id)}
                    >
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {activeTemplate && (
                <div>
                  <h2 className="mb-4 text-lg font-medium">보고서 생성</h2>
                  <ReportGenerator
                    template={activeTemplate}
                    onGenerated={reportId => {
                      console.log(`보고서 ${reportId} 생성됨`);
                      // 알림 또는 다운로드 로직
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>사용 가능한 템플릿이 없습니다.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <ReportManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

3. API 라우트 추가:

```typescript
// apps/workshop-web/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { generateReportAsync } from '@cargoro/reporting/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { templateId, parameters, format } = await req.json();

    // 요청 데이터 검증
    if (!templateId) {
      return NextResponse.json({ error: '템플릿 ID가 필요합니다' }, { status: 400 });
    }

    // 보고서 작업 생성
    const reportJob = await db.reportJob.create({
      data: {
        templateId,
        userId,
        parameters: parameters || {},
        format: format || 'pdf',
        status: 'queued',
      },
    });

    // 비동기 보고서 생성 시작
    generateReportAsync(
      {
        templateId,
        parameters,
        format,
        async: true,
      },
      async progress => {
        // 진행률 업데이트
        await db.reportJob.update({
          where: { id: reportJob.id },
          data: { progress, status: 'processing' },
        });
      },
      async filePath => {
        // 완료 처리
        await db.reportJob.update({
          where: { id: reportJob.id },
          data: {
            status: 'completed',
            progress: 100,
            outputUrl: `/reports/${path.basename(filePath)}`,
            completedAt: new Date(),
          },
        });
      },
      async error => {
        // 에러 처리
        await db.reportJob.update({
          where: { id: reportJob.id },
          data: {
            status: 'failed',
            error: error.message,
            completedAt: new Date(),
          },
        });
      }
    );

    return NextResponse.json({ jobId: reportJob.id });
  } catch (error) {
    console.error('보고서 생성 요청 오류:', error);
    return NextResponse.json({ error: error.message || '보고서 생성 요청 실패' }, { status: 500 });
  }
}
```

## 주의사항

- 보고서 생성기는 서버 사이드에서만 사용할 수 있습니다.
- 대용량 데이터를 다룰 때는 비동기 생성 방식을 사용하세요.
- 보고서 템플릿을 저장할 데이터베이스 스키마가 필요합니다.
