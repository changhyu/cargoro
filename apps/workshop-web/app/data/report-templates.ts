// 차량 점검 보고서 템플릿 (PDF)
export const vehicleInspectionReport = {
  id: 'vehicle-inspection-template',
  name: '차량 점검 보고서',
  description: '차량 점검 결과를 상세하게 보여주는 표준 보고서 템플릿입니다.',
  category: '차량 점검',
  type: 'pdf',
  layout: JSON.stringify({
    title: '차량 점검 보고서',
    subtitle: '{{workshopName}}',
    logo: 'logo.png',
    sections: [
      {
        title: '고객 정보',
        type: 'table',
        data: [
          { label: '고객명', value: '{{customerName}}' },
          { label: '연락처', value: '{{customerPhone}}' },
          { label: '이메일', value: '{{customerEmail}}' },
        ],
      },
      {
        title: '차량 정보',
        type: 'table',
        data: [
          { label: '차량번호', value: '{{vehiclePlate}}' },
          { label: '제조사/모델', value: '{{vehicleMake}} {{vehicleModel}}' },
          { label: '연식', value: '{{vehicleYear}}' },
          { label: '주행거리', value: '{{vehicleOdometer}} km' },
        ],
      },
      {
        title: '점검 내역',
        type: 'checklist',
        items: [
          {
            category: '엔진',
            items: [
              { name: '엔진 오일', status: '{{engineOilStatus}}', notes: '{{engineOilNotes}}' },
              { name: '냉각수', status: '{{coolantStatus}}', notes: '{{coolantNotes}}' },
              { name: '에어 필터', status: '{{airFilterStatus}}', notes: '{{airFilterNotes}}' },
              { name: '벨트', status: '{{beltStatus}}', notes: '{{beltNotes}}' },
            ],
          },
          {
            category: '전기 시스템',
            items: [
              { name: '배터리', status: '{{batteryStatus}}', notes: '{{batteryNotes}}' },
              { name: '발전기', status: '{{alternatorStatus}}', notes: '{{alternatorNotes}}' },
              { name: '스타터', status: '{{starterStatus}}', notes: '{{starterNotes}}' },
              { name: '조명', status: '{{lightingStatus}}', notes: '{{lightingNotes}}' },
            ],
          },
          {
            category: '제동 시스템',
            items: [
              {
                name: '브레이크 패드 (전)',
                status: '{{frontBrakeStatus}}',
                notes: '{{frontBrakeNotes}}',
              },
              {
                name: '브레이크 패드 (후)',
                status: '{{rearBrakeStatus}}',
                notes: '{{rearBrakeNotes}}',
              },
              { name: '브레이크 액', status: '{{brakeFluidStatus}}', notes: '{{brakeFluidNotes}}' },
            ],
          },
          {
            category: '타이어',
            items: [
              {
                name: '타이어 상태 (전)',
                status: '{{frontTireStatus}}',
                notes: '{{frontTireNotes}}',
              },
              {
                name: '타이어 상태 (후)',
                status: '{{rearTireStatus}}',
                notes: '{{rearTireNotes}}',
              },
              {
                name: '타이어 공기압',
                status: '{{tirePressureStatus}}',
                notes: '{{tirePressureNotes}}',
              },
            ],
          },
        ],
      },
      {
        title: '점검 결과 요약',
        type: 'text',
        content: '{{inspectionSummary}}',
      },
      {
        title: '권장 수리',
        type: 'list',
        items: '{{recommendedRepairs}}',
      },
      {
        title: '예상 비용',
        type: 'table',
        data: '{{estimatedCosts}}',
      },
      {
        title: '점검자 서명',
        type: 'signature',
        name: '{{inspectorName}}',
        date: '{{inspectionDate}}',
        signature: '{{inspectorSignature}}',
      },
    ],
    footer: {
      text: '© {{currentYear}} CarGoro. 모든 권리 보유.',
      pageNumber: true,
    },
  }),
  dataSource: JSON.stringify([
    { name: 'workshop', type: 'api', endpoint: '/api/workshop' },
    { name: 'customer', type: 'api', endpoint: '/api/customers/{customerId}' },
    { name: 'vehicle', type: 'api', endpoint: '/api/vehicles/{vehicleId}' },
    { name: 'inspection', type: 'api', endpoint: '/api/inspections/{inspectionId}' },
  ]),
  parameters: JSON.stringify([
    { name: 'customerId', type: 'string', required: true, label: '고객 ID' },
    { name: 'vehicleId', type: 'string', required: true, label: '차량 ID' },
    { name: 'inspectionId', type: 'string', required: true, label: '점검 ID' },
  ]),
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'system',
  isActive: true,
};

// 정비 내역 보고서 템플릿 (Excel)
export const repairHistoryReport = {
  id: 'repair-history-template',
  name: '정비 내역 보고서',
  description: '차량의 모든 정비 이력을 엑셀 형식으로 제공하는 보고서입니다.',
  category: '정비 기록',
  type: 'excel',
  layout: JSON.stringify({
    sheets: [
      {
        name: '정비 내역 요약',
        columns: [
          { header: '정비 날짜', key: 'repairDate', width: 15 },
          { header: '정비 종류', key: 'repairType', width: 20 },
          { header: '담당 정비사', key: 'technician', width: 20 },
          { header: '부품 비용', key: 'partsCost', width: 15 },
          { header: '공임', key: 'laborCost', width: 15 },
          { header: '총 비용', key: 'totalCost', width: 15 },
          { header: '메모', key: 'notes', width: 40 },
        ],
        data: '{{repairHistory}}',
      },
      {
        name: '부품 교체 내역',
        columns: [
          { header: '정비 날짜', key: 'repairDate', width: 15 },
          { header: '부품 번호', key: 'partNumber', width: 20 },
          { header: '부품 이름', key: 'partName', width: 25 },
          { header: '제조사', key: 'manufacturer', width: 20 },
          { header: '수량', key: 'quantity', width: 10 },
          { header: '단가', key: 'unitPrice', width: 15 },
          { header: '총 비용', key: 'totalPrice', width: 15 },
        ],
        data: '{{partsHistory}}',
      },
      {
        name: '차량 정보',
        columns: [
          { header: '정보', key: 'label', width: 25 },
          { header: '값', key: 'value', width: 50 },
        ],
        data: [
          { label: '차량 등록번호', value: '{{vehiclePlate}}' },
          { label: '제조사/모델', value: '{{vehicleMake}} {{vehicleModel}}' },
          { label: '연식', value: '{{vehicleYear}}' },
          { label: 'VIN', value: '{{vehicleVin}}' },
          { label: '엔진 번호', value: '{{engineNumber}}' },
          { label: '현재 주행거리', value: '{{vehicleOdometer}} km' },
          { label: '첫 등록일', value: '{{vehicleRegistrationDate}}' },
          { label: '소유자', value: '{{ownerName}}' },
          { label: '소유자 연락처', value: '{{ownerPhone}}' },
        ],
      },
    ],
    properties: {
      title: '{{vehiclePlate}} 정비 이력 보고서',
      subject: '차량 정비 이력',
      author: 'CarGoro 워크숍',
      company: '{{workshopName}}',
    },
  }),
  dataSource: JSON.stringify([
    { name: 'workshop', type: 'api', endpoint: '/api/workshop' },
    { name: 'vehicle', type: 'api', endpoint: '/api/vehicles/{vehicleId}' },
    { name: 'repairs', type: 'api', endpoint: '/api/vehicles/{vehicleId}/repairs' },
    { name: 'parts', type: 'api', endpoint: '/api/vehicles/{vehicleId}/parts' },
  ]),
  parameters: JSON.stringify([
    { name: 'vehicleId', type: 'string', required: true, label: '차량 ID' },
    { name: 'startDate', type: 'date', required: false, label: '시작 날짜' },
    { name: 'endDate', type: 'date', required: false, label: '종료 날짜' },
  ]),
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'system',
  isActive: true,
};
