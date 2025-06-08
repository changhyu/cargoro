import ExcelJS from 'exceljs';
import { ReportTemplate, ReportSection, TableConfig, KPIConfig } from '../types';

interface ExcelGeneratorOptions {
  template: ReportTemplate;
  data: Record<string, any>;
  parameters: Record<string, any>;
}

export class ExcelGenerator {
  private workbook: ExcelJS.Workbook;
  private worksheet: ExcelJS.Worksheet;
  private currentRow: number = 1;

  constructor(private options: ExcelGeneratorOptions) {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'CarGoro';
    this.workbook.created = new Date();

    // 워크시트 생성
    this.worksheet = this.workbook.addWorksheet('보고서', {
      pageSetup: {
        paperSize: 9, // A4
        orientation: options.template.layout.orientation,
      },
    });
  }

  async generate(): Promise<Buffer> {
    const { template } = this.options;

    // 헤더 렌더링
    if (template.layout.header) {
      this.renderHeader();
    }

    // 섹션 렌더링
    for (const section of template.layout.sections) {
      await this.renderSection(section);
    }

    // 열 너비 자동 조정
    this.autoFitColumns();

    // 버퍼 생성
    const buffer = (await this.workbook.xlsx.writeBuffer()) as unknown as Buffer;
    return buffer;
  }

  private renderHeader() {
    const { header } = this.options.template.layout;
    if (!header) return;

    // 제목 행
    const titleRow = this.worksheet.getRow(this.currentRow);
    titleRow.height = 40;

    const titleCell = this.worksheet.getCell(`A${this.currentRow}`);
    titleCell.value = header.title || 'CarGoro Report';
    titleCell.font = {
      size: 20,
      bold: true,
      color: { argb: 'FF3B82F6' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // 제목 셀 병합
    this.worksheet.mergeCells(`A${this.currentRow}:H${this.currentRow}`);

    // 날짜 행
    this.currentRow += 2;
    const dateCell = this.worksheet.getCell(`A${this.currentRow}`);
    dateCell.value = `생성일: ${new Date().toLocaleDateString('ko-KR')}`;
    dateCell.font = { size: 12, color: { argb: 'FF666666' } };

    this.currentRow += 2;
  }

  private async renderSection(section: ReportSection) {
    switch (section.type) {
      case 'title':
        this.renderTitle(section);
        break;
      case 'text':
        this.renderText(section);
        break;
      case 'table':
        this.renderTable(section);
        break;
      case 'kpi':
        this.renderKPI(section);
        break;
      case 'summary':
        this.renderSummary(section);
        break;
      case 'pageBreak':
        // Excel에서는 페이지 나누기 추가
        // addPageBreak 메서드가 없으므로 주석 처리
        // this.worksheet.addPageBreak(this.currentRow);
        break;
    }
  }

  private renderTitle(section: ReportSection) {
    const titleCell = this.worksheet.getCell(`A${this.currentRow}`);
    titleCell.value = section.title || '';
    titleCell.font = {
      size: section.style?.fontSize || 16,
      bold: true,
      color: { argb: 'FF000000' },
    };

    this.worksheet.mergeCells(`A${this.currentRow}:H${this.currentRow}`);
    this.currentRow += 2;
  }

  private renderText(section: ReportSection) {
    const text = this.resolveContent(section.content);
    const textCell = this.worksheet.getCell(`A${this.currentRow}`);
    textCell.value = text;
    textCell.font = {
      size: section.style?.fontSize || 12,
      color: { argb: 'FF000000' },
    };
    textCell.alignment = { wrapText: true };

    this.worksheet.mergeCells(`A${this.currentRow}:H${this.currentRow}`);
    this.currentRow += 2;
  }

  private renderTable(section: ReportSection) {
    const tableData = this.resolveContent(section.content) as TableConfig;
    if (!tableData) return;

    const { headers, rows, styles } = tableData;

    // 헤더 행
    const headerRow = this.worksheet.getRow(this.currentRow);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header.text;
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: styles?.headerFont?.size || 12,
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: header.align || 'left',
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    headerRow.height = 30;
    this.currentRow++;

    // 데이터 행
    rows.forEach((rowData, rowIndex) => {
      const row = this.worksheet.getRow(this.currentRow);

      rowData.forEach((cellValue, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = cellValue;
        cell.font = {
          size: styles?.rowFont?.size || 11,
        };

        // 짝수 행 배경색
        if (rowIndex % 2 === 1 && styles?.alternateRowBackground) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' },
          };
        }

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        // 숫자 형식 지정
        if (typeof cellValue === 'number') {
          if (
            headers[colIndex]?.text.includes('금액') ||
            headers[colIndex]?.text.includes('매출')
          ) {
            cell.numFmt = '#,##0"원"';
          } else if (
            headers[colIndex]?.text.includes('율') ||
            headers[colIndex]?.text.includes('%')
          ) {
            cell.numFmt = '0.0"%"';
          } else {
            cell.numFmt = '#,##0';
          }
        }
      });

      row.height = 25;
      this.currentRow++;
    });

    // 합계 행 (있는 경우)
    if (tableData.summary) {
      this.currentRow++;
      const summaryRow = this.worksheet.getRow(this.currentRow);

      tableData.summary.rows.forEach((summary, index) => {
        if (index === 0) {
          summaryRow.getCell(1).value = summary.label;
          summaryRow.getCell(headers.length).value = summary.value;
        }
      });

      summaryRow.font = { bold: true };
      summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' },
      };

      this.currentRow++;
    }

    this.currentRow += 2;
  }

  private renderKPI(section: ReportSection) {
    const kpiData = this.resolveContent(section.content) as KPIConfig[];
    if (!kpiData || !Array.isArray(kpiData)) return;

    const startCol = 1;
    const kpiRow = this.worksheet.getRow(this.currentRow);

    kpiData.forEach((kpi, index) => {
      const col = startCol + index * 2;

      // KPI 제목
      const titleCell = kpiRow.getCell(col);
      titleCell.value = kpi.title;
      titleCell.font = { size: 10, color: { argb: 'FF666666' } };

      // KPI 값
      const valueCell = this.worksheet.getRow(this.currentRow + 1).getCell(col);
      valueCell.value = `${kpi.value}${kpi.unit || ''}`;
      valueCell.font = { size: 16, bold: true };

      // 변화율
      if (kpi.change) {
        const changeCell = this.worksheet.getRow(this.currentRow + 2).getCell(col);
        const changeSymbol = kpi.change.type === 'increase' ? '↑' : '↓';
        const changeColor = kpi.change.type === 'increase' ? 'FF10B981' : 'FFEF4444';

        changeCell.value = `${changeSymbol} ${Math.abs(kpi.change.value)}%`;
        changeCell.font = { size: 10, color: { argb: changeColor } };
      }

      // 셀 병합
      this.worksheet.mergeCells(this.currentRow, col, this.currentRow + 2, col);
    });

    this.currentRow += 4;
  }

  private renderSummary(section: ReportSection) {
    const summaryData = this.resolveContent(section.content) as Record<string, any>;
    if (!summaryData) return;

    // 요약 제목
    this.renderTitle({ ...section, title: section.title || '요약' });

    // 요약 데이터
    Object.entries(summaryData).forEach(([key, value]) => {
      const row = this.worksheet.getRow(this.currentRow);

      row.getCell(1).value = key;
      row.getCell(1).font = { bold: true };

      row.getCell(3).value = value;
      row.getCell(3).alignment = { horizontal: 'right' };

      this.worksheet.mergeCells(`A${this.currentRow}:B${this.currentRow}`);
      this.worksheet.mergeCells(`C${this.currentRow}:D${this.currentRow}`);

      this.currentRow++;
    });

    this.currentRow += 2;
  }

  private resolveContent(content: any): any {
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
      } else {
        const resolved: any = {};
        for (const [key, value] of Object.entries(content)) {
          resolved[key] = this.resolveContent(value);
        }
        return resolved;
      }
    }

    return content;
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private autoFitColumns() {
    this.worksheet.columns.forEach(column => {
      if (!column) return;

      let maxLength = 0;
      if (column && column.eachCell) {
        column.eachCell({ includeEmpty: false }, cell => {
          const length = cell.value ? cell.value.toString().length : 0;
          if (length > maxLength) {
            maxLength = length;
          }
        });

        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      }
    });
  }
}
