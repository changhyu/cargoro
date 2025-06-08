import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WorkOrderDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>작업 상세 화면</Text>
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
