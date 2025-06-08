// 개발 중 특정 경고 메시지를 억제하기 위한 설정
import { LogBox } from 'react-native';

// 개발 모드에서만 특정 경고 억제
if (__DEV__) {
  // 개발 중 발생하는 일반적인 경고 억제
  LogBox.ignoreLogs([
    // UI 관련 경고
    'setNativeProps is deprecated',
    'Download the React DevTools',
    'Cannot record touch end without a touch start',

    // 네트워크 관련 경고
    'Network request failed',
    'net::ERR_CONNECTION_REFUSED',
    'Failed to fetch',

    // OBD 관련 경고
    'OBD 연결 실패',
    'OBD 연결 시도 중 오류 발생',

    // 기타 경고
    'Notification permissions were previously denied',
  ]);
}

export default function DevWarningFilter() {
  // 실제 렌더링하는 컴포넌트는 아님
  return null;
}
