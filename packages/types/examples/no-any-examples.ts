/**
 * 타입스크립트 any 사용 금지에 대한 모범 사례 예시
 * /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/packages/types/examples/no-any-examples.ts
 */

// 🚫 나쁜 예: any 타입 사용
// function processUserData(data: any) {
//   return data.name;  // 런타임 오류 위험: data.name이 없을 수 있음
// }

// ✅ 좋은 예: 인터페이스 정의와 구체적인 타입 사용
interface UserData {
  id: string;
  name: string;
  email: string;
  age?: number; // 선택적 속성
}

function processUserData(data: UserData): string {
  return data.name; // 타입 안전성 보장
}

// ✅ 좋은 예: 제네릭 사용
function getArrayFirstItem<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

// ✅ 좋은 예: 유니온 타입 사용
type Status = 'pending' | 'processing' | 'completed' | 'failed';

function processOrder(orderId: string, status: Status): void {
  // 처리 로직
}

// ✅ 좋은 예: API 응답 처리 - 타입 가드 사용
interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message: string;
  code: number;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 타입 가드 함수
function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.status === 'success';
}

// 응답 처리 함수
function handleApiResponse<T>(response: ApiResponse<T>): T | null {
  if (isSuccessResponse(response)) {
    return response.data; // T 타입으로 안전하게 추론됨
  }

  console.error(`API Error: ${response.message} (Code: ${response.code})`);
  return null;
}

// ✅ 좋은 예: 언노운(unknown) 타입과 타입 가드 사용
function processExternalData(data: unknown): string {
  // 타입 가드를 사용하여 안전하게 타입 확인
  if (typeof data === 'string') {
    return data.toUpperCase();
  }

  if (typeof data === 'object' && data !== null && 'toString' in data) {
    return (data.toString as () => string)();
  }

  return '';
}

// ✅ 좋은 예: 레코드 타입 사용
type UserRoles = Record<string, string[]>;

const userPermissions: UserRoles = {
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read'],
};

// ✅ 좋은 예: 타입 단언보다 타입 가드 사용
function processValue(value: unknown): number {
  // 🚫 나쁜 예: 타입 단언(assertion) 사용
  // return (value as number) + 1;  // 런타임 오류 위험

  // ✅ 좋은 예: 타입 가드 사용
  if (typeof value === 'number') {
    return value + 1;
  }

  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value) + 1;
  }

  return 0; // 기본값 반환
}

// ✅ 좋은 예: 타입 인터섹션 사용
interface HasId {
  id: string;
}

interface HasName {
  name: string;
}

// 인터섹션 타입
type IdentifiableWithName = HasId & HasName;

function logEntity(entity: IdentifiableWithName): void {
  console.log(`Entity ${entity.id}: ${entity.name}`);
}

// ✅ 좋은 예: 옵셔널 체이닝과 널 병합 연산자 활용
interface DeepNestedData {
  user?: {
    profile?: {
      address?: {
        city?: string;
      };
    };
  };
}

function getCity(data: DeepNestedData): string {
  // 옵셔널 체이닝으로 안전하게 접근
  return data.user?.profile?.address?.city ?? '알 수 없음';
}

// ✅ 좋은 예: 타입 상속과 확장
interface BaseVehicle {
  id: string;
  manufacturer: string;
  model: string;
}

// Car 타입은 BaseVehicle을 확장
interface Car extends BaseVehicle {
  type: 'car';
  seats: number;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
}

// Truck 타입은 BaseVehicle을 확장
interface Truck extends BaseVehicle {
  type: 'truck';
  cargoCapacity: number;
  axles: number;
}

// 차량 유니온 타입
type Vehicle = Car | Truck;

// 차량 타입에 따른 처리
function processVehicle(vehicle: Vehicle): void {
  console.log(`Vehicle: ${vehicle.manufacturer} ${vehicle.model}`);

  // 차량 타입에 따른 분기 처리
  if (vehicle.type === 'car') {
    console.log(`Passenger car with ${vehicle.seats} seats`);
  } else {
    console.log(`Truck with ${vehicle.cargoCapacity}kg capacity`);
  }
}
