import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import DeliveryListScreen from '../features/delivery-list/delivery-list-screen';
import DeliveryDetailScreen from '../features/delivery-list/delivery-detail-screen';

// 스택 네비게이터 타입
export type DeliveryStackParamList = {
  DeliveryList: undefined;
  DeliveryDetail: { deliveryId: string };
};

const Stack = createStackNavigator<DeliveryStackParamList>();

// 배송 목록 스택 네비게이터
export default function DeliveryListTab() {
  return (
    <Stack.Navigator
      initialRouteName="DeliveryList"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F3F4F6' },
      }}
    >
      <Stack.Screen
        name="DeliveryList"
        component={DeliveryListScreen}
        options={{
          title: '배송 목록',
        }}
      />
      <Stack.Screen
        name="DeliveryDetail"
        component={DeliveryDetailScreen}
        options={{
          title: '배송 상세',
        }}
      />
    </Stack.Navigator>
  );
}
