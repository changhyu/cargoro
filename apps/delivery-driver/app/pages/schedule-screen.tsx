import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../navigation/index'; // Adjust the import path as needed

// 임시 일정 데이터
const DUMMY_SCHEDULES = [
  {
    id: '1',
    date: '2025-05-21',
    dayOfWeek: '수',
    deliveries: [
      {
        id: 'd1',
        time: '09:30',
        pickupAddress: '서울시 강남구 테헤란로 152',
        deliveryAddress: '서울시 송파구 올림픽로 300',
        carInfo: '현대 그랜저 (123가4567)',
        status: 'scheduled', // scheduled, completed, cancelled
      },
      {
        id: 'd2',
        time: '13:00',
        pickupAddress: '서울시 서초구 서초대로 389',
        deliveryAddress: '서울시 영등포구 여의도동 36',
        carInfo: '기아 K5 (234나5678)',
        status: 'scheduled',
      },
    ],
  },
  {
    id: '2',
    date: '2025-05-22',
    dayOfWeek: '목',
    deliveries: [
      {
        id: 'd3',
        time: '10:00',
        pickupAddress: '서울시 중구 을지로 100',
        deliveryAddress: '서울시 광진구 능동로 120',
        carInfo: '르노 SM6 (345다6789)',
        status: 'scheduled',
      },
    ],
  },
  {
    id: '3',
    date: '2025-05-23',
    dayOfWeek: '금',
    deliveries: [
      {
        id: 'd4',
        time: '11:30',
        pickupAddress: '서울시 용산구 이태원로 200',
        deliveryAddress: '서울시 동대문구 천호대로 300',
        carInfo: '쌍용 티볼리 (456라7890)',
        status: 'scheduled',
      },
      {
        id: 'd5',
        time: '15:00',
        pickupAddress: '서울시 마포구 양화로 45',
        deliveryAddress: '서울시 성동구 왕십리로 50',
        carInfo: '현대 아반떼 (567마8901)',
        status: 'scheduled',
      },
      {
        id: 'd6',
        time: '18:30',
        pickupAddress: '서울시 서대문구 연세로 50',
        deliveryAddress: '서울시 종로구 종로 1',
        carInfo: '기아 셀토스 (678바9012)',
        status: 'scheduled',
      },
    ],
  },
];

// 일정 상태별 색상
const STATUS_COLORS: Record<string, string> = {
  scheduled: '#3498db',
  completed: '#27ae60',
  cancelled: '#e74c3c',
};

// 일정 상태별 라벨
const STATUS_LABELS: Record<string, string> = {
  scheduled: '예정됨',
  completed: '완료됨',
  cancelled: '취소됨',
};

const ScheduleScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const schedules = DUMMY_SCHEDULES; // Use DUMMY_SCHEDULES directly as setSchedules is not used
  const [selectedDate, setSelectedDate] = useState(DUMMY_SCHEDULES[0].date);

  // 선택된 날짜의 일정 가져오기
  const getScheduleForDate = (date: string) => {
    return schedules.find(schedule => schedule.date === date);
  };

  const selectedSchedule = getScheduleForDate(selectedDate);

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // 배달 항목을 눌렀을 때 처리
  const handleDeliveryPress = (delivery: { id: string }) => {
    navigation.navigate('DeliveryDetail', { deliveryId: delivery.id });
  };

  // 날짜 목록 렌더링
  const renderDateItem = ({ item: schedule }: { item: (typeof DUMMY_SCHEDULES)[0] }) => {
    const [_year, _month, day] = schedule.date.split('-'); // Prefix unused variables with _
    const isSelected = schedule.date === selectedDate;

    return (
      <TouchableOpacity
        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
        onPress={() => handleDateSelect(schedule.date)}
      >
        <Text style={[styles.dateDay, isSelected && styles.selectedDateText]}>{day}</Text>
        <Text style={[styles.dateDayOfWeek, isSelected && styles.selectedDateText]}>
          {schedule.dayOfWeek}
        </Text>
        <View
          style={[
            styles.dateDeliveryIndicator,
            {
              backgroundColor: isSelected ? 'white' : '#3498db',
            },
          ]}
        >
          <Text style={[styles.dateDeliveryCount, isSelected && { color: '#3498db' }]}>
            {schedule.deliveries.length}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>일정</Text>
      </View>

      <View style={styles.calendarContainer}>
        <FlatList
          data={schedules}
          renderItem={renderDateItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        />
      </View>

      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateTitle}>{selectedSchedule?.date} 일정</Text>
        <Text style={styles.deliveryCountText}>
          {selectedSchedule?.deliveries.length || 0}건의 탁송 일정
        </Text>
      </View>

      {selectedSchedule?.deliveries && selectedSchedule.deliveries.length > 0 ? (
        <FlatList
          data={selectedSchedule.deliveries}
          keyExtractor={item => item.id}
          renderItem={({ item: delivery }) => (
            <TouchableOpacity
              style={styles.deliveryItem}
              onPress={() => handleDeliveryPress(delivery)}
            >
              <View style={styles.deliveryTimeContainer}>
                <Text style={styles.deliveryTime}>{delivery.time}</Text>
                <View
                  style={[styles.statusDot, { backgroundColor: STATUS_COLORS[delivery.status] }]}
                />
              </View>

              <View style={styles.deliveryContent}>
                <View style={styles.deliveryAddresses}>
                  <View style={styles.addressRow}>
                    <Icon name="map-marker" size={16} color="#7f8c8d" />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {delivery.pickupAddress}
                    </Text>
                  </View>
                  <View style={styles.addressRow}>
                    <Icon name="flag-checkered" size={16} color="#7f8c8d" />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {delivery.deliveryAddress}
                    </Text>
                  </View>
                </View>

                <View style={styles.deliveryFooter}>
                  <View style={styles.carInfoContainer}>
                    <Icon name="car" size={14} color="#7f8c8d" />
                    <Text style={styles.carInfoText}>{delivery.carInfo}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: STATUS_COLORS[delivery.status] },
                    ]}
                  >
                    <Text style={styles.statusText}>{STATUS_LABELS[delivery.status]}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.deliveryList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-blank" size={48} color="#bdc3c7" />
          <Text style={styles.emptyText}>이 날짜에는 일정이 없습니다</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  calendarContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateList: {
    paddingHorizontal: 16,
  },
  dateItem: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedDateItem: {
    backgroundColor: '#3498db',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  dateDayOfWeek: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  selectedDateText: {
    color: 'white',
  },
  dateDeliveryIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  dateDeliveryCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  selectedDateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  deliveryCountText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  deliveryList: {
    padding: 16,
  },
  deliveryItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  deliveryTimeContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingVertical: 16,
  },
  deliveryTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
    marginTop: 6,
  },
  deliveryContent: {
    flex: 1,
    padding: 12,
  },
  deliveryAddresses: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#2c3e50',
    marginLeft: 6,
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carInfoText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#3498db',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default ScheduleScreen;
