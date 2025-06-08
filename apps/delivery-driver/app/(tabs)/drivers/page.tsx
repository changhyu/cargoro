import React, { Suspense } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// import { DriverList } from './components/DriverList';

export default function DriversPage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>운전자 관리</Text>
      </View>
      {/* <Suspense fallback={<View><Text>로딩 중...</Text></View>}>
        <DriverList />
      </Suspense> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
