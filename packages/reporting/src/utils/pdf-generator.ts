import { ReportTemplate, GenerateReportRequest } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * PDF 보고서 생성 유틸리티 (클라이언트 사이드에서 사용)
 */
export class PdfGenerator {
  /**
   * 서버에 PDF 보고서 생성 요청 (API 호출)
   * @param template 사용할 템플릿
   * @param data 보고서 데이터
   * @param parameters 보고서 파라미터
   * @returns 생성된 PDF 파일의 URL
   */
  static async generateViaApi(
    template: ReportTemplate,
    data: Record<string, any>,
    parameters: Record<string, any> = {}
  ): Promise<string> {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          data,
          parameters,
        } as GenerateReportRequest),
      });

      if (!response.ok) {
        throw new Error(`보고서 생성 실패: ${response.statusText}`);
      }

      const result = await response.json();
      return result.reportUrl;
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * HTML 요소를 PDF로 변환 (브라우저에서 직접 생성)
   * @param elementId 변환할 HTML 요소 ID
   * @param filename 저장할 파일명
   * @param options 추가 옵션
   */
  static async generateFromHtml(
    elementId: string,
    filename: string = 'report.pdf',
    options: {
      orientation?: 'portrait' | 'landscape';
      format?: string;
      title?: string;
    } = {}
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`ID가 ${elementId}인 요소를 찾을 수 없습니다.`);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format?.toLowerCase() || 'a4',
      });

      if (options.title) {
        pdf.setFontSize(16);
        pdf.text(options.title, 14, 15);
      }

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, options.title ? 25 : 10, pdfWidth, pdfHeight);
      pdf.save(filename);
    } catch (error) {
      console.error('HTML에서 PDF 생성 중 오류 발생:', error);
      throw error;
    }
  }
}
