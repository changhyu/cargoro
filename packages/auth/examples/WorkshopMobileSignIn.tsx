import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TODO: expo 관련 패키지 설치 후 완전한 예제로 업데이트 필요
export default function WorkshopMobileSignIn() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Workshop Mobile Sign In Example</Text>
      <Text style={styles.subtext}>Expo 패키지 설치 필요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
});
