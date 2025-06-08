import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ChartConfiguration } from 'chart.js';
import { ReportTemplate, ReportSection, ChartConfig, TableConfig, KPIConfig } from '../types';

interface PDFGeneratorOptions {
  template: ReportTemplate;
  data: Record<string, unknown>;
  parameters: Record<string, unknown>;
}

export class PDFGenerator {
  private readonly doc: jsPDF;
  private currentY: number = 20;
  private readonly pageHeight: number;
  private readonly pageWidth: number;
  private readonly margins: { top: number; right: number; bottom: number; left: number };
  // chartRenderer는 동적으로 생성되므로 제거

  constructor(private readonly options: PDFGeneratorOptions) {
    const { template } = options;
    const { orientation, pageSize, margins } = template.layout;

    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize.toLowerCase() as 'a4' | 'a3' | 'letter',
    });

    this.margins = margins;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();

    // chartRenderer는 renderChartServer 메서드에서 동적으로 생성됩니다.
  }

  async generate(): Promise<Buffer> {
    const { template } = this.options;

    // 브라우저 환경에서는 차트 렌더링 스킵
    const isServer = typeof window === 'undefined';

    // 헤더 렌더링
    if (template.layout.header) {
      await this.renderHeader();
    }

    // 섹션 렌더링
    for (const section of template.layout.sections) {
      if (section.type === 'chart' && !isServer) {
        // 브라우저에서는 차트 대신 플레이스홀더 표시
        this.renderChartPlaceholder(section);
      } else {
        await this.renderSection(section);
      }
    }

    // 푸터 렌더링
    if (template.layout.footer) {
      await this.renderFooter();
    }

    // PDF 생성
    const buffer = Buffer.from(this.doc.output('arraybuffer'));
    return buffer;
  }

  private async renderHeader() {
    const { header, styles } = this.options.template.layout;
    if (!header) return;

    this.doc.setFillColor(styles?.colors.primary || '#3b82f6');
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');

    this.doc.setTextColor('#ffffff');
    this.doc.setFontSize(16);
    this.doc.text(header.title || 'CarGoro Report', this.margins.left, 15, { baseline: 'middle' });

    // 날짜
    this.doc.setFontSize(10);
    this.doc.text(new Date().toLocaleDateString('ko-KR'), this.pageWidth - this.margins.right, 15, {
      align: 'right',
      baseline: 'middle',
    });

    this.currentY = 40;
  }

  private async renderFooter() {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // 페이지 번호
      this.doc.setTextColor('#666666');
      this.doc.setFontSize(10);
      this.doc.text(`${i} / ${pageCount}`, this.pageWidth / 2, this.pageHeight - 10, {
        align: 'center',
      });

      // 회사 정보
      this.doc.text('CarGoro - 자동차 토탈 서비스 플랫폼', this.margins.left, this.pageHeight - 10);
    }
  }

  private async renderSection(section: ReportSection) {
    // 페이지 체크
    if (this.currentY > this.pageHeight - this.margins.bottom - 20) {
      this.doc.addPage();
      this.currentY = this.margins.top;
    }

    switch (section.type) {
      case 'title':
        this.renderTitle(section);
        break;
      case 'text':
        this.renderText(section);
        break;
      case 'table':
        await this.renderTable(section);
        break;
      case 'chart':
        // 서버 사이드에서만 실제 차트 렌더링
        if (typeof window === 'undefined') {
          await this.renderChartServer(section);
        } else {
          this.renderChartPlaceholder(section);
        }
        break;
      case 'kpi':
        this.renderKPI(section);
        break;
      case 'pageBreak':
        this.doc.addPage();
        this.currentY = this.margins.top;
        break;
    }
  }

  private renderTitle(section: ReportSection) {
    this.doc.setTextColor('#000000');
    this.doc.setFontSize(section.style?.fontSize || 18);
    this.doc.setFont('helvetica', section.style?.fontWeight || 'bold');

    this.doc.text(section.title || '', this.margins.left, this.currentY);

    this.currentY += 15;
  }

  private renderText(section: ReportSection) {
    this.doc.setTextColor(section.style?.textColor || '#000000');
    this.doc.setFontSize(section.style?.fontSize || 12);
    this.doc.setFont('helvetica', 'normal');

    const textContent = this.resolveContent(section.content);
    let text: string;

    if (typeof textContent === 'string') {
      text = textContent;
    } else if (textContent === null || textContent === undefined) {
      text = '';
    } else {
      // 객체인 경우 JSON 문자열로 변환
      text = JSON.stringify(textContent);
    }

    const lines = this.doc.splitTextToSize(
      text,
      this.pageWidth - this.margins.left - this.margins.right
    );

    this.doc.text(lines, this.margins.left, this.currentY);
    this.currentY += lines.length * 6 + 10;
  }

  private async renderTable(section: ReportSection) {
    const tableData = this.resolveContent(section.content) as TableConfig;
    if (!tableData) return;

    const { headers, rows, styles } = tableData;

    (
      this.doc as typeof this.doc & { autoTable: (options: Record<string, unknown>) => void }
    ).autoTable({
      head: [headers.map((h: { text: string }) => h.text)],
      body: rows,
      startY: this.currentY,
      margin: { left: this.margins.left, right: this.margins.right },
      styles: {
        fontSize: styles?.rowFont?.size || 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: styles?.headerBackground || '#3b82f6',
        textColor: styles?.headerColor || '#ffffff',
        fontSize: styles?.headerFont?.size || 11,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: styles?.alternateRowBackground || '#f3f4f6',
      },
      didDrawPage: (data: { cursor: { y: number } }) => {
        this.currentY = data.cursor.y + 10;
      },
    });
  }

  private async renderChartServer(section: ReportSection) {
    // 서버 사이드에서 차트 렌더링 로직
    // dynamic import를 사용하여 필요할 때만 로드
    try {
      const { ChartJSNodeCanvas } = await import('chartjs-node-canvas');
      const chartRenderer = new ChartJSNodeCanvas({
        width: 800,
        height: 400,
        backgroundColour: 'white',
      });

      const chartConfig = this.resolveContent(section.content) as ChartConfig;
      if (!chartConfig) return;

      const configuration: ChartConfiguration = {
        type: chartConfig.type as ChartConfiguration['type'],
        data: chartConfig.data,
        options: {
          ...chartConfig.options,
          animation: false,
          responsive: false,
        } as ChartConfiguration['options'],
      };

      const imageBuffer = await chartRenderer.renderToBuffer(configuration);
      const imageData = `data:image/png;base64,${imageBuffer.toString('base64')}`;

      const imgWidth = this.pageWidth - this.margins.left - this.margins.right;
      const imgHeight =
        (chartConfig.size?.height || 100) * (imgWidth / (chartConfig.size?.width || 200));

      this.doc.addImage(imageData, 'PNG', this.margins.left, this.currentY, imgWidth, imgHeight);

      this.currentY += imgHeight + 10;
    } catch (error) {
      console.error('차트 렌더링 오류:', error);
      this.renderChartPlaceholder(section);
    }
  }

  private renderChartPlaceholder(section: ReportSection) {
    // 차트 플레이스홀더 렌더링
    const chartConfig = this.resolveContent(section.content) as ChartConfig;
    const imgWidth = this.pageWidth - this.margins.left - this.margins.right;
    const imgHeight =
      (chartConfig?.size?.height || 100) * (imgWidth / (chartConfig?.size?.width || 200));

    this.doc.setFillColor('#f3f4f6');
    this.doc.rect(this.margins.left, this.currentY, imgWidth, imgHeight, 'F');

    this.doc.setTextColor('#666666');
    this.doc.setFontSize(14);
    this.doc.text(
      '차트: ' + (section.title || '차트 플레이스홀더'),
      this.margins.left + imgWidth / 2,
      this.currentY + imgHeight / 2,
      { align: 'center' }
    );

    this.currentY += imgHeight + 10;
  }

  private renderKPI(section: ReportSection) {
    const kpiData = this.resolveContent(section.content) as KPIConfig[];
    if (!kpiData || !Array.isArray(kpiData)) return;

    const kpiWidth = (this.pageWidth - this.margins.left - this.margins.right) / kpiData.length;

    kpiData.forEach((kpi, index) => {
      const x = this.margins.left + index * kpiWidth;

      // KPI 박스
      this.doc.setFillColor(kpi.color || '#f3f4f6');
      this.doc.roundedRect(x + 5, this.currentY, kpiWidth - 10, 30, 3, 3, 'F');

      // 제목
      this.doc.setTextColor('#666666');
      this.doc.setFontSize(10);
      this.doc.text(kpi.title, x + kpiWidth / 2, this.currentY + 8, { align: 'center' });

      // 값
      this.doc.setTextColor('#000000');
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      const valueText = `${kpi.value}${kpi.unit || ''}`;
      this.doc.text(valueText, x + kpiWidth / 2, this.currentY + 20, { align: 'center' });

      // 변화율
      if (kpi.change) {
        const changeColor = kpi.change.type === 'increase' ? '#10b981' : '#ef4444';
        this.doc.setTextColor(changeColor);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        const changeText = `${kpi.change.type === 'increase' ? '↑' : '↓'} ${Math.abs(kpi.change.value)}%`;
        this.doc.text(changeText, x + kpiWidth / 2, this.currentY + 26, { align: 'center' });
      }
    });

    this.currentY += 40;
  }

  private resolveContent(content: unknown): unknown {
    if (!content) return '';

    // 데이터 바인딩 처리
    if (typeof content === 'string' && content.startsWith('{{')) {
      const path = content.slice(2, -2).trim();
      return this.getValueByPath(this.options.data, path);
    }

    // 객체인 경우 재귀적으로 처리
    if (typeof content === 'object') {
      if (Array.isArray(content)) {
        return content.map(item => this.resolveContent(item));
      } else if (content !== null) {
        const resolved: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(content)) {
          resolved[key] = this.resolveContent(value);
        }
        return resolved;
      }
    }

    return content;
  }

  private getValueByPath(obj: unknown, path: string): unknown {
    if (typeof obj !== 'object' || obj === null) return undefined;

    return path.split('.').reduce((current: unknown, key: string) => {
      if (typeof current === 'object' && current !== null && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }
}
