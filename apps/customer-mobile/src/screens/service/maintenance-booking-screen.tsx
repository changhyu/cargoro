import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { IntegratedRootStackParamList } from '../../types/integrated-navigation';

type MaintenanceBookingScreenNavigationProp = StackNavigationProp<
  IntegratedRootStackParamList,
  'MaintenanceBooking'
>;

type MaintenanceBookingScreenRouteProp = RouteProp<
  IntegratedRootStackParamList,
  'MaintenanceBooking'
>;

interface MaintenanceService {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string;
  price: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: 'routine' | 'repair' | 'emergency';
}

interface Workshop {
  id: string;
  name: string;
  distance: string;
  rating: number;
  available: boolean;
  services: string[];
}

const MaintenanceBookingScreen: React.FC = () => {
  const navigation = useNavigation<MaintenanceBookingScreenNavigationProp>();
  const route = useRoute<MaintenanceBookingScreenRouteProp>();
  const { serviceType } = route.params || {};

  const [selectedServices, setSelectedServices] = useState<string[]>(
    serviceType ? [serviceType] : []
  );
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [memo, setMemo] = useState<string>('');

  const maintenanceServices: MaintenanceService[] = [
    {
      id: 'oil-change',
      name: '엔진오일 교환',
      description: '엔진오일 및 오일필터 교환',
      estimatedDuration: '30분',
      price: '60,000원',
      icon: 'car-outline',
      category: 'routine',
    },
    {
      id: 'tire-replacement',
      name: '타이어 교체',
      description: '타이어 교체 및 밸런스 조정',
      estimatedDuration: '45분',
      price: '150,000원',
      icon: 'ellipse-outline',
      category: 'repair',
    },
    {
      id: 'brake-inspection',
      name: '브레이크 점검',
      description: '브레이크 패드 및 디스크 점검',
      estimatedDuration: '20분',
      price: '40,000원',
      icon: 'stop-circle-outline',
      category: 'routine',
    },
    {
      id: 'battery-replacement',
      name: '배터리 교체',
      description: '배터리 교체 및 충전 시스템 점검',
      estimatedDuration: '25분',
      price: '120,000원',
      icon: 'battery-charging-outline',
      category: 'repair',
    },
    {
      id: 'other-inspection',
      name: '기타 점검',
      description: '기타 차량 상태 점검 및 진단',
      estimatedDuration: '30-60분',
      price: '30,000원~',
      icon: 'construct-outline',
      category: 'routine',
    },
    {
      id: 'emergency-repair',
      name: '긴급 수리',
      description: '긴급 상황 대응 수리',
      estimatedDuration: '1-2시간',
      price: '견적 후 결정',
      icon: 'warning-outline',
      category: 'emergency',
    },
  ];

  const nearbyWorkshops: Workshop[] = [
    {
      id: '1',
      name: '카고로 정비센터 강남점',
      distance: '1.2km',
      rating: 4.8,
      available: true,
      services: ['oil-change', 'tire-replacement', 'brake-inspection', 'other-inspection'],
    },
    {
      id: '2',
      name: '스마트카 서비스센터',
      distance: '2.1km',
      rating: 4.6,
      available: true,
      services: ['battery-replacement', 'emergency-repair', 'other-inspection'],
    },
    {
      id: '3',
      name: '프리미엄 오토케어',
      distance: '3.5km',
      rating: 4.9,
      available: false,
      services: [
        'oil-change',
        'tire-replacement',
        'brake-inspection',
        'battery-replacement',
        'other-inspection',
      ],
    },
  ];

  // 오늘부터 2주간의 날짜 생성 (오후 4시 이후라면 모레부터 시작)
  const generateAvailableDates = () => {
    const dates: string[] = [];
    const now = new Date(); // 현재 날짜와 시간

    // 디버깅 로그: 현재 시간 확인
    console.log(`현재 날짜: ${now.toLocaleDateString('ko-KR')}`);
    console.log(`현재 시간: ${now.getHours()}시 ${now.getMinutes()}분`);

    // 현재 시간이 오후 4시(16시) 이후인지 확인
    const isAfter4PM = now.getHours() >= 16;
    console.log(`오후 4시 이후?: ${isAfter4PM}`);

    // 시작일 결정: 오후 4시 이후라면 모레(2일 후)부터, 아니면 오늘부터
    let startDay = 0;
    if (isAfter4PM) {
      startDay = 2; // 모레부터 시작
      console.log('예약 가능 시작일: 모레');
    } else {
      console.log('예약 가능 시작일: 오늘');
    }

    // 날짜 생성 (시작일부터 2주간)
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + startDay + i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
      dates.push(dateString);
    }

    return dates;
  };

  const availableDates = generateAvailableDates();

  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  // 선택한 날짜에 따라 이용 가능한 시간 필터링
  const getAvailableTimesForDate = (selectedDate: string | null) => {
    if (!selectedDate) return [];

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // 오늘 날짜 YYYY-MM-DD 형식

    // 선택한 날짜가 오늘이 아니면 모든 시간 슬롯 반환
    if (selectedDate !== today) {
      return availableTimes;
    }

    // 선택한 날짜가 오늘이면 현재 시간 이후의 시간만 반환
    const currentHour = now.getHours();
    return availableTimes.filter(time => {
      const timeHour = parseInt(time.split(':')[0], 10);
      // 현재 시간보다 1시간 이상 나중인 시간만 선택 가능
      return timeHour > currentHour + 1;
    });
  };

  const handleBooking = () => {
    if (selectedServices.length === 0 || !selectedWorkshop || !selectedDate || !selectedTime) {
      Alert.alert('예약 정보 확인', '모든 정보를 선택해주세요.');
      return;
    }

    // 선택한 서비스 이름 목록 생성
    const selectedServiceNames = maintenanceServices
      .filter(service => selectedServices.includes(service.id))
      .map(service => service.name)
      .join(', ');

    const memoText = memo ? `\n\n메모: ${memo}` : '';

    Alert.alert(
      '예약 확인',
      `선택한 서비스: ${selectedServiceNames}\n날짜: ${selectedDate}\n시간: ${selectedTime}${memoText}\n\n정비 예약을 완료하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            Alert.alert('예약 완료', '정비 예약이 완료되었습니다.');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'routine':
        return '#4CAF50';
      case 'repair':
        return '#FF9800';
      case 'emergency':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>정비 예약</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 서비스 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>서비스 선택</Text>
          {maintenanceServices.map(service => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedServices.includes(service.id) && styles.selectedCard,
              ]}
              onPress={() => {
                // 다중 선택 처리
                if (selectedServices.includes(service.id)) {
                  setSelectedServices(selectedServices.filter(id => id !== service.id));
                } else {
                  setSelectedServices([...selectedServices, service.id]);
                }
              }}
            >
              <View style={styles.serviceHeader}>
                <View
                  style={[
                    styles.serviceIcon,
                    { backgroundColor: getCategoryColor(service.category) },
                  ]}
                >
                  <Ionicons name={service.icon} size={24} color="#fff" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceDuration}>⏱ {service.estimatedDuration}</Text>
                    <Text style={styles.servicePrice}>💰 {service.price}</Text>
                  </View>
                </View>
              </View>
              {selectedServices.includes(service.id) && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 정비소 선택 */}
        {selectedServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>정비소 선택</Text>
            {nearbyWorkshops.map(workshop => (
              <TouchableOpacity
                key={workshop.id}
                style={[
                  styles.workshopCard,
                  selectedWorkshop === workshop.id && styles.selectedCard,
                  !workshop.available && styles.disabledCard,
                ]}
                onPress={() => workshop.available && setSelectedWorkshop(workshop.id)}
                disabled={!workshop.available}
              >
                <View style={styles.workshopInfo}>
                  <Text style={[styles.workshopName, !workshop.available && styles.disabledText]}>
                    {workshop.name}
                  </Text>
                  <View style={styles.workshopDetails}>
                    <Text style={styles.workshopDistance}>📍 {workshop.distance}</Text>
                    <Text style={styles.workshopRating}>⭐ {workshop.rating}</Text>
                  </View>
                  <Text
                    style={[styles.workshopStatus, !workshop.available && styles.unavailableStatus]}
                  >
                    {workshop.available ? '예약 가능' : '예약 불가'}
                  </Text>
                </View>
                {selectedWorkshop === workshop.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 날짜 선택 */}
        {selectedWorkshop && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>날짜 선택</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dateContainer}>
                {availableDates.map(date => (
                  <TouchableOpacity
                    key={date}
                    style={[styles.dateCard, selectedDate === date && styles.selectedDateCard]}
                    onPress={() => {
                      setSelectedDate(date);
                      // 날짜가 변경되면 시간 선택 초기화
                      setSelectedTime(null);
                    }}
                  >
                    <Text
                      style={[styles.dateText, selectedDate === date && styles.selectedDateText]}
                    >
                      {new Date(date).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text
                      style={[styles.dayText, selectedDate === date && styles.selectedDateText]}
                    >
                      {new Date(date).toLocaleDateString('ko-KR', { weekday: 'short' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 시간 선택 */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시간 선택</Text>
            <View style={styles.timeGrid}>
              {getAvailableTimesForDate(selectedDate).map(time => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeCard, selectedTime === time && styles.selectedTimeCard]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selectedTime === time && styles.selectedTimeText]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {getAvailableTimesForDate(selectedDate).length === 0 && (
              <Text style={styles.noTimesMessage}>
                선택하신 날짜에 이용 가능한 시간이 없습니다. 다른 날짜를 선택해주세요.
              </Text>
            )}
          </View>
        )}

        {/* 정비사에게 남길 메모 */}
        {selectedTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>정비사에게 남길 메모</Text>
            <View style={styles.memoContainer}>
              <TextInput
                style={styles.memoInput}
                placeholder="차량 상태나 요청사항을 남겨주세요 (선택사항)"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                value={memo}
                onChangeText={setMemo}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* 예약 버튼 */}
      {selectedServices.length > 0 && selectedWorkshop && selectedDate && selectedTime && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.bookingButton} onPress={handleBooking}>
            <Text style={styles.bookingButtonText}>예약하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#4CAF50',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#888',
  },
  servicePrice: {
    fontSize: 12,
    color: '#888',
  },
  workshopCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  disabledCard: {
    opacity: 0.5,
  },
  workshopInfo: {
    flex: 1,
  },
  workshopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  disabledText: {
    color: '#999',
  },
  workshopDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  workshopDistance: {
    fontSize: 14,
    color: '#666',
  },
  workshopRating: {
    fontSize: 14,
    color: '#666',
  },
  workshopStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  unavailableStatus: {
    color: '#F44336',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDateCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
  },
  selectedDateText: {
    color: '#fff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedTimeText: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  bookingButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bookingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  memoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  memoInput: {
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    padding: 8,
  },
  noTimesMessage: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '500',
  },
});

export default MaintenanceBookingScreen;
