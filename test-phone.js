import { validators } from './src/utils/validators';

// 테스트 케이스들
const testCases = [
  { phone: '010-1234-5678', expected: true },
  { phone: '01012345678', expected: true },
  { phone: '011-123-4567', expected: true },
  { phone: '019-1234-5678', expected: true },
  { phone: '02-1234-5678', expected: false },
  { phone: '010-12-5678', expected: false },
  { phone: '010-1234-567', expected: false },
  { phone: '1234567890', expected: false },
];

console.log('전화번호 검증 테스트:');
testCases.forEach(({ phone, expected }) => {
  const result = validators.isPhoneNumber(phone);
  const pass = result === expected ? '✓' : '✗';
  console.log(`${pass} ${phone}: ${result} (expected: ${expected})`);
});
