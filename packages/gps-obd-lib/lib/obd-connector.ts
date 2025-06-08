/**
 * OBDConnector - 차량 OBD2 포트와 통신하기 위한 클래스
 */
export interface OBDConnectorOptions {
  deviceId?: string;
  autoConnect?: boolean;
  timeout?: number;
}

export interface OBDData {
  rpm?: number;
  speed?: number;
  engineTemp?: number;
  fuelLevel?: number;
  diagnosticCodes?: string[];
}

export class OBDConnector {
  private connected: boolean = false;
  private deviceId: string;
  private timeout: number;

  constructor(options: OBDConnectorOptions = {}) {
    this.deviceId = options.deviceId || 'default-device';
    this.timeout = options.timeout || 10000;

    if (options.autoConnect) {
      this.connect();
    }
  }

  /**
   * OBD 디바이스에 연결
   */
  public connect(): Promise<boolean> {
    // 실제 구현에서는 블루투스 또는 WiFi를 통해 OBD 디바이스와 연결
    return new Promise(resolve => {
      setTimeout(() => {
        this.connected = true;
        resolve(true);
      }, 500);
    });
  }

  /**
   * OBD 디바이스 연결 해제
   */
  public disconnect(): Promise<void> {
    // 이미 연결이 해제된 경우 즉시 완료
    if (!this.connected) {
      return Promise.resolve();
    }

    // 즉시 연결 상태 변경 (테스트 일관성 유지)
    this.connected = false;

    // 내부 정리 작업 수행 (실제 구현에서는 블루투스/WiFi 연결 해제 등)
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 300); // 테스트 코드와 일치하도록 타이머 시간 조정
    });
  }

  /**
   * 차량 데이터 가져오기
   */
  public getData(): Promise<OBDData> {
    if (!this.connected) {
      return Promise.reject(new Error('OBD device not connected'));
    }

    // 실제 OBD 통신 시 약간의 지연이 발생하는 것을 시뮬레이션
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          rpm: Math.floor(Math.random() * 3000) + 800,
          speed: Math.floor(Math.random() * 100),
          engineTemp: Math.floor(Math.random() * 50) + 70,
          fuelLevel: Math.floor(Math.random() * 100),
          diagnosticCodes: [],
        });
      }, 200); // 데이터 가져오는데 200ms 소요됨을 가정
    });
  }

  /**
   * 연결 상태 확인
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * 진단 코드 스캔
   */
  public scanDiagnosticCodes(): Promise<string[]> {
    if (!this.connected) {
      return Promise.reject(new Error('OBD device not connected'));
    }

    // 실제로는 차량의 ECU에서 진단 코드를 스캔 (비동기 작업)
    return new Promise(resolve => {
      setTimeout(() => {
        // 현재는 빈 배열을 반환하지만, 실제로는 차량 상태에 따라 진단 코드가 포함될 수 있음
        resolve([]);
      }, 200);
    });
  }
}
