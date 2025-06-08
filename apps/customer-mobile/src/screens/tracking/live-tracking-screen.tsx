import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LiveTrackingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>실시간 추적 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  text: {
    fontSize: 18,
    color: '#1F2937',
  },
});
