/**
 * 배치 작업 모듈 진입점
 *
 * 이 파일은 배치 작업 실행 기능을 내보냅니다.
 */
import * as tasks from './lib/tasks/index.js';
import { setupLogger } from '../shared/utils/logging_utils.js';

// 로거 설정
const logger = setupLogger('jobs');

/**
 * 작업 실행 함수
 * @param {string} taskName - 실행할 작업 이름
 * @param {object} params - 작업 파라미터
 * @returns {Promise<any>} 작업 결과
 */
export async function runTask(taskName, params = {}) {
  logger.info(`작업 실행: ${taskName}`);

  if (!tasks[taskName]) {
    logger.error(`존재하지 않는 작업: ${taskName}`);
    throw new Error(`Task '${taskName}' not found`);
  }

  try {
    const result = await tasks[taskName](params);
    logger.info(`작업 완료: ${taskName}`);
    return result;
  } catch (error) {
    logger.error(`작업 실패: ${taskName}`, error);
    throw error;
  }
}

/**
 * 스케줄에 따라 작업 실행
 * @param {string} taskName - 실행할 작업 이름
 * @param {string} schedule - cron 표현식
 * @param {object} params - 작업 파라미터
 * @returns {Function} 작업 취소 함수
 */
export function scheduleTask(taskName, schedule, params = {}) {
  // 스케줄러 구현 (예: node-cron 사용)
  logger.info(`작업 스케줄링: ${taskName}, 스케줄: ${schedule}`);

  // 여기에 실제 스케줄링 구현

  return () => {
    // 작업 취소 함수
    logger.info(`스케줄 작업 취소: ${taskName}`);
  };
}

// 작업 내보내기
export { tasks };

// 기본 내보내기
export default {
  runTask,
  scheduleTask,
  tasks,
};
