import React from 'react';

import { Feather } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';

import RepairJobListScreen from '../features/repair-management/screens/repair-job-list-screen';

// 임시 컴포넌트: 추후 실제 컴포넌트로 대체 필요
const RepairJobDetailScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>정비 작업 상세 화면 (준비 중)</Text>
  </View>
);

// 임시 컴포넌트: 추후 실제 컴포넌트로 대체 필요
const RepairJobFormScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>정비 작업 등록/수정 화면 (준비 중)</Text>
  </View>
);

export type RepairStackParamList = {
  RepairJobList: undefined;
  RepairJobDetail: { jobId: string };
  RepairJobForm: { jobId?: string };
};

const Stack = createStackNavigator<RepairStackParamList>();

const RepairStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0, // Android
          shadowOpacity: 0, // iOS
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        },
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937',
        },
        headerTintColor: '#3b82f6',
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="RepairJobList"
        component={RepairJobListScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="RepairJobDetail"
        component={RepairJobDetailScreen}
        options={({ navigation }) => ({
          title: '정비 작업 상세',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
              <Feather name="arrow-left" size={22} color="#3b82f6" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="RepairJobForm"
        component={RepairJobFormScreen}
        options={({ route }) => ({
          title: route.params?.jobId ? '정비 작업 수정' : '신규 정비 작업',
        })}
      />
    </Stack.Navigator>
  );
};

export default RepairStackNavigator;
