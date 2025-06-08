import * as amqplib from 'amqplib';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// 환경 변수에서 RabbitMQ URL 가져오기
const isDev = process.env.NODE_ENV !== 'production';
const RABBITMQ_HOST = isDev ? 'localhost' : 'rabbitmq';
const RABBITMQ_URL = process.env.RABBITMQ_URL || `amqp://guest:guest@${RABBITMQ_HOST}:5672/`;
const QUEUE_NAME = 'cargoro_tasks';
const RETRY_INTERVAL = 5000; // 재시도 간격 (밀리초)

// 메시지 타입 정의
interface RabbitMessage {
  content: Buffer;
  fields: {
    deliveryTag: number;
    redelivered: boolean;
    exchange: string;
    routingKey: string;
  };
  properties: {
    contentType?: string;
    contentEncoding?: string;
    headers?: Record<string, unknown>;
    deliveryMode?: number;
    priority?: number;
    correlationId?: string;
    replyTo?: string;
    expiration?: string;
    messageId?: string;
    timestamp?: number;
    type?: string;
    userId?: string;
    appId?: string;
    clusterId?: string;
  };
}

// 큐 옵션 타입 정의
interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, unknown>;
}

// 큐 결과 타입 정의
interface QueueResult {
  queue: string;
  messageCount: number;
  consumerCount: number;
}

// 타입 정의를 더 구체적으로 정의
interface AmqpConnection {
  close(): Promise<void>;
  createChannel(): Promise<AmqpChannel>;
  on(event: 'error', callback: (err: Error) => void): void;
  on(event: 'close', callback: () => void): void;
}

interface AmqpChannel {
  close(): Promise<void>;
  assertQueue(queue: string, options?: QueueOptions): Promise<QueueResult>;
  consume(
    queue: string,
    onMessage: (msg: RabbitMessage | null) => void,
    options?: { noAck?: boolean }
  ): Promise<{ consumerTag: string }>;
  ack(message: RabbitMessage, allUpTo?: boolean): void;
  nack(message: RabbitMessage, allUpTo?: boolean, requeue?: boolean): void;
}

// 전역 변수로 선언하여 정상 종료 처리에 사용
let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

// 정상 종료 처리 함수
async function gracefulShutdown() {
  console.log('워커 서비스를 정상 종료합니다...');
  try {
    if (channel) {
      console.log('채널 종료 중...');
      await channel.close();
    }
    if (connection) {
      console.log('연결 종료 중...');
      await connection.close();
    }
  } catch (err) {
    console.error('종료 중 오류 발생:', err);
  }
  console.log('종료 완료');
  process.exit(0);
}

// RabbitMQ에 연결 및 메시지 소비를 위한 함수
async function startWorker() {
  try {
    console.log('워커 서비스를 시작합니다...');
    console.log(`RabbitMQ에 연결: ${RABBITMQ_URL}`);

    // RabbitMQ에 연결 (타입 단언 사용)
    connection = (await amqplib.connect(RABBITMQ_URL)) as unknown as AmqpConnection;
    channel = await connection.createChannel();

    // 큐 생성 (없을 경우)
    if (channel) {
      await channel.assertQueue(QUEUE_NAME, {
        durable: true,
      });

      console.log(`큐 ${QUEUE_NAME}에서 메시지 대기 중...`);

      // 메시지 소비
      channel.consume(QUEUE_NAME, msg => {
        if (msg && channel) {
          const content = msg.content.toString();
          console.log(`메시지 수신: ${content}`);

          try {
            const task = JSON.parse(content);
            processTask(task);

            // 메시지 처리 완료 확인
            channel.ack(msg);
          } catch (error) {
            console.error('메시지 처리 중 오류 발생:', error);

            // 에러 처리 전략에 따라 메시지 다시 큐에 넣거나 버리기
            channel.nack(msg, false, false);
          }
        }
      });
    }

    // 연결 오류 처리
    if (connection) {
      connection.on('error', err => {
        console.error('RabbitMQ 연결 오류:', err);
        connection = null;
        channel = null;
        retryConnection();
      });

      // 연결 종료 처리
      connection.on('close', () => {
        // 의도적인 종료가 아닌 경우에만 재연결 시도
        if (connection !== null) {
          console.warn('RabbitMQ 연결이 종료되었습니다. 재연결을 시도합니다...');
          connection = null;
          channel = null;
          retryConnection();
        }
      });
    }
  } catch (error) {
    console.error('워커 서비스 시작 중 오류 발생:', error);
    // 개발 환경에서는 오류 메시지만 출력하고 계속 실행
    if (isDev) {
      console.log(
        '개발 모드에서는 RabbitMQ 없이 계속 실행됩니다. 필요시 docker-compose up rabbitmq를 실행하세요.'
      );
    } else {
      connection = null;
      channel = null;
      retryConnection();
    }
  }
}

// 연결 재시도 함수
function retryConnection() {
  console.log(`${RETRY_INTERVAL / 1000}초 후 재연결을 시도합니다...`);
  setTimeout(startWorker, RETRY_INTERVAL);
}

// 작업 처리 함수
interface Task {
  type: string;
  to?: string;
  userId?: string;
  reportId?: string;
  [key: string]: unknown;
}

function processTask(task: Task) {
  console.log(`작업 처리 중: ${task.type}`);

  switch (task.type) {
    case 'email':
      console.log(`이메일 발송: ${task.to}`);
      break;
    case 'notification':
      console.log(`알림 발송: ${task.userId}`);
      break;
    case 'report':
      console.log(`보고서 생성: ${task.reportId}`);
      break;
    default:
      console.log(`알 수 없는 작업 유형: ${task.type}`);
  }

  console.log('작업 처리 완료');
}

// 프로세스 종료 이벤트 처리
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGHUP', gracefulShutdown);
process.on('uncaughtException', err => {
  console.error('처리되지 않은 예외:', err);
  gracefulShutdown();
});

// 워커 시작
startWorker();
