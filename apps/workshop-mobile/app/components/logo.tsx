import React from 'react';

import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface LogoProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
}

const Logo: React.FC<LogoProps> = ({ width = 200, height = 100, style }) => {
  return (
    <View style={[styles.container, style, { width, height }]}>
      <Text style={styles.logoText}>CARGORO</Text>
      <Text style={styles.subText}>정비소 관리 시스템</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  subText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
});

export default Logo;
