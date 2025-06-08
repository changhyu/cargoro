import React, { useEffect, useState } from 'react';

import * as Device from 'expo-device';
import { View, Text, StyleSheet } from 'react-native';

interface DeviceInfoProps {
  showDetails?: boolean;
}

export const DeviceInfo: React.FC<DeviceInfoProps> = ({ showDetails = false }) => {
  const [deviceType, setDeviceType] = useState<string>('Unknown');

  useEffect(() => {
    const getDeviceType = async () => {
      try {
        const type = await Device.getDeviceTypeAsync();
        const deviceTypeNames = {
          [Device.DeviceType.UNKNOWN]: '알 수 없음',
          [Device.DeviceType.PHONE]: '휴대폰',
          [Device.DeviceType.TABLET]: '태블릿',
          [Device.DeviceType.DESKTOP]: '데스크톱',
          [Device.DeviceType.TV]: 'TV',
        };
        setDeviceType(deviceTypeNames[type] || '알 수 없음');
      } catch (error) {
        console.error('디바이스 타입을 가져오는 중 오류 발생:', error);
      }
    };

    getDeviceType();
  }, []);

  if (!showDetails) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>디바이스 정보</Text>
      <Text style={styles.info}>모델명: {Device.modelName}</Text>
      <Text style={styles.info}>브랜드: {Device.brand}</Text>
      <Text style={styles.info}>제조사: {Device.manufacturer}</Text>
      <Text style={styles.info}>OS 이름: {Device.osName}</Text>
      <Text style={styles.info}>OS 버전: {Device.osVersion}</Text>
      <Text style={styles.info}>디바이스 타입: {deviceType}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
});

export default DeviceInfo;
