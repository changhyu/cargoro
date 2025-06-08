'use client';

import React, { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@cargoro/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui';
import { FileText, FileSpreadsheet, FileType, Plus, Save, Trash2 } from 'lucide-react';
import { ReportTemplate, ReportSection } from '../types';

interface TemplateEditorProps {
  template?: ReportTemplate;
  onSave?: (template: ReportTemplate) => void;
  onCancel?: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [editingTemplate, setEditingTemplate] = useState<Partial<ReportTemplate>>(
    template || {
      name: '',
      description: '',
      category: 'custom',
      type: 'pdf',
      layout: {
        orientation: 'portrait',
        pageSize: 'A4',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        sections: [],
      },
      dataSource: [],
      parameters: [],
      isActive: true,
    }
  );

  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    if (onSave && editingTemplate.name) {
      onSave(editingTemplate as ReportTemplate);
    }
  };

  const addSection = (type: ReportSection['type']) => {
    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      type,
      title:
        type === 'title'
          ? '새 제목'
          : type === 'text'
            ? '텍스트 섹션'
            : type === 'table'
              ? '테이블 섹션'
              : '',
    };

    setEditingTemplate({
      ...editingTemplate,
      layout: {
        ...editingTemplate.layout!,
        sections: [...(editingTemplate.layout?.sections || []), newSection],
      },
    });
  };

  const removeSection = (sectionId: string) => {
    setEditingTemplate({
      ...editingTemplate,
      layout: {
        ...editingTemplate.layout!,
        sections: editingTemplate.layout!.sections.filter(s => s.id !== sectionId),
      },
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'word':
        return <FileType className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{template ? '템플릿 편집' : '새 템플릿 만들기'}</CardTitle>
            <CardDescription>보고서 템플릿을 생성하고 설정합니다</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">일반</TabsTrigger>
            <TabsTrigger value="layout">레이아웃</TabsTrigger>
            <TabsTrigger value="data">데이터</TabsTrigger>
            <TabsTrigger value="schedule">예약</TabsTrigger>
            <TabsTrigger value="permissions">권한</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">템플릿 이름</Label>
                <Input
                  id="name"
                  value={editingTemplate.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                  placeholder="월간 매출 보고서"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  value={editingTemplate.category || 'custom'}
                  onValueChange={(value: string) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      category: value as
                        | 'workshop'
                        | 'financial'
                        | 'customer'
                        | 'inventory'
                        | 'performance'
                        | 'custom',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">정비소</SelectItem>
                    <SelectItem value="financial">재무</SelectItem>
                    <SelectItem value="customer">고객</SelectItem>
                    <SelectItem value="inventory">재고</SelectItem>
                    <SelectItem value="performance">성과</SelectItem>
                    <SelectItem value="custom">사용자 정의</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={editingTemplate.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditingTemplate({ ...editingTemplate, description: e.target.value })
                }
                placeholder="템플릿에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>파일 형식</Label>
                <div className="flex gap-2">
                  {['pdf', 'excel', 'word'].map(type => (
                    <Button
                      key={type}
                      variant={editingTemplate.type === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setEditingTemplate({
                          ...editingTemplate,
                          type: type as 'pdf' | 'excel' | 'word',
                        })
                      }
                    >
                      {getTypeIcon(type)}
                      <span className="ml-2">{type.toUpperCase()}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingTemplate.isActive ?? true}
                  onCheckedChange={(checked: boolean) =>
                    setEditingTemplate({ ...editingTemplate, isActive: checked })
                  }
                />
                <Label htmlFor="active">활성화</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>페이지 방향</Label>
                <Select
                  value={editingTemplate.layout?.orientation || 'portrait'}
                  onValueChange={(value: string) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      layout: {
                        ...editingTemplate.layout!,
                        orientation: value as 'portrait' | 'landscape',
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">세로</SelectItem>
                    <SelectItem value="landscape">가로</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>페이지 크기</Label>
                <Select
                  value={editingTemplate.layout?.pageSize || 'A4'}
                  onValueChange={(value: 'A4' | 'A3' | 'Letter' | 'Legal') =>
                    setEditingTemplate({
                      ...editingTemplate,
                      layout: { ...editingTemplate.layout!, pageSize: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A3">A3</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>섹션</Label>
              <div className="space-y-2 rounded-lg border p-4">
                {editingTemplate.layout?.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between rounded bg-muted p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <Badge variant="outline">{section.type}</Badge>
                      {section.title && <span className="text-sm">{section.title}</span>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => addSection('title')}>
                    <Plus className="mr-2 h-4 w-4" />
                    제목
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('text')}>
                    <Plus className="mr-2 h-4 w-4" />
                    텍스트
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('table')}>
                    <Plus className="mr-2 h-4 w-4" />
                    테이블
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('chart')}>
                    <Plus className="mr-2 h-4 w-4" />
                    차트
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('kpi')}>
                    <Plus className="mr-2 h-4 w-4" />
                    KPI
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="py-8 text-center text-muted-foreground">
              데이터 소스 설정 기능은 준비 중입니다
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="py-8 text-center text-muted-foreground">
              보고서 예약 기능은 준비 중입니다
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="py-8 text-center text-muted-foreground">
              권한 설정 기능은 준비 중입니다
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
