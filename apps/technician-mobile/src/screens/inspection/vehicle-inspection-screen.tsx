import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VehicleInspectionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>차량 점검 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  text: {
    fontSize: 18,
    color: '#1F2937',
  },
});
