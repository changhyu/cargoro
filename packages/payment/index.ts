export interface PaymentWidgetProps {
  orderId: string;
  orderName: string;
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  onSuccess: (paymentKey: string) => void;
  onError: (error: Error) => void;
}

export function PaymentWidget(_props: PaymentWidgetProps) {
  // 임시 구현
  return null;
}

export function PaymentHistoryList(_props: { customerId: string }) {
  // 임시 구현
  return null;
}

export function PaymentMethodList(_props: { customerId: string }) {
  // 임시 구현
  return null;
}

export function SubscriptionManager(_props: { customerId: string }) {
  // 임시 구현
  return null;
}

export function PaymentSuccess({
  onSuccess: _onSuccess,
}: {
  onSuccess?: (paymentKey: string, orderId: string) => void;
}) {
  // 임시 구현 - 결제 성공 페이지
  return null;
}

export function PaymentFail({ onRetry: _onRetry }: { onRetry?: () => void }) {
  // 임시 구현 - 결제 실패 페이지
  return null;
}

export interface PaymentConfig {
  clientKey: string;
  secretKey?: string;
  successUrl?: string;
  failUrl?: string;
  environment?: 'production' | 'test' | 'development';
}

export function PaymentProvider({
  children,
  config: _config,
}: {
  children: React.ReactNode;
  config?: PaymentConfig;
}) {
  // 임시 구현 - Payment 컨텍스트 프로바이더
  // config를 사용하여 결제 설정을 초기화할 수 있음
  return children;
}

export function generateOrderId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}
