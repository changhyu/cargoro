/**
 * 숫자를 천 단위로 포맷팅
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

/**
 * 금액을 통화 형식으로 포맷팅
 */
export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * 카드 번호 마스킹
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s+/g, '');
  if (cleaned.length < 8) return cardNumber;

  const first4 = cleaned.substring(0, 4);
  const last4 = cleaned.substring(cleaned.length - 4);
  const masked = '*'.repeat(cleaned.length - 8);

  return `${first4} ${masked} ${last4}`;
}

/**
 * 계좌 번호 마스킹
 */
export function maskAccountNumber(accountNumber: string): string {
  const cleaned = accountNumber.replace(/\s+/g, '');
  if (cleaned.length < 4) return accountNumber;

  const last4 = cleaned.substring(cleaned.length - 4);
  const masked = '*'.repeat(cleaned.length - 4);

  return `${masked}${last4}`;
}

/**
 * 전화번호 마스킹
 */
export function maskPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length < 8) return phoneNumber;

  const first3 = cleaned.substring(0, 3);
  const last4 = cleaned.substring(cleaned.length - 4);
  const masked = '*'.repeat(cleaned.length - 7);

  return `${first3}-${masked}-${last4}`;
}

/**
 * 결제 수단 타입별 한글명
 */
export function getPaymentMethodTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    CARD: '카드',
    BANK_TRANSFER: '계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌',
    MOBILE: '휴대폰',
    POINT: '포인트',
  };

  return typeNames[type] || type;
}

/**
 * 카드사 코드별 한글명
 */
export function getCardCompanyName(code: string): string {
  const cardCompanies: Record<string, string> = {
    '3K': '기업BC',
    '46': '광주',
    '71': '롯데',
    '30': '산업',
    '31': '삼성',
    '51': '하나',
    '38': '새마을',
    '41': '신한',
    '62': '신협',
    '36': '씨티',
    '33': '우리',
    '37': '우체국',
    '39': '저축',
    '35': '전북',
    '42': '제주',
    '15': '카카오뱅크',
    '90': '토스뱅크',
    '11': 'KB국민',
    '91': 'NH농협',
    '12': '단위농협',
    '20': 'Sh수협',
  };

  return cardCompanies[code] || code;
}

/**
 * 은행 코드별 한글명
 */
export function getBankName(code: string): string {
  const banks: Record<string, string> = {
    '39': '경남은행',
    '34': '광주은행',
    '12': '단위농협',
    '32': '부산은행',
    '45': '새마을금고',
    '64': '산림조합',
    '88': '신한은행',
    '48': '신협',
    '27': '한국씨티은행',
    '20': '우리은행',
    '71': '우체국',
    '50': '저축은행',
    '37': '전북은행',
    '35': '제주은행',
    '90': '카카오뱅크',
    '89': '케이뱅크',
    '92': '토스뱅크',
    '81': '하나은행',
    '54': '홍콩샹하이은행',
    '03': '기업은행',
    '06': '국민은행',
    '31': '대구은행',
    '02': '산업은행',
    '11': '농협은행',
    '23': 'SC제일은행',
    '07': '수협',
  };

  return banks[code] || code;
}

/**
 * 주문 ID 생성 (타임스탬프 기반)
 */
export function generateOrderId(prefix: string = 'ORDER'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * 포인트 유효기간 계산
 */
export function calculatePointExpiry(earnedDate: Date, validDays: number = 365): Date {
  const expiryDate = new Date(earnedDate);
  expiryDate.setDate(expiryDate.getDate() + validDays);
  return expiryDate;
}

/**
 * 결제 금액 검증
 */
export function validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
  if (amount < 100) {
    return { valid: false, error: '최소 결제 금액은 100원입니다.' };
  }

  if (amount > 50000000) {
    return { valid: false, error: '최대 결제 금액은 5천만원입니다.' };
  }

  if (!Number.isInteger(amount)) {
    return { valid: false, error: '결제 금액은 정수여야 합니다.' };
  }

  return { valid: true };
}
