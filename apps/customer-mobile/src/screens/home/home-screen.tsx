import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useSession } from '../../providers/auth-provider';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const { width } = Dimensions.get('window');

interface QuickActionProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

function QuickAction({ icon, label, color, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

interface VehicleCardProps {
  vehicle: any;
  onPress: () => void;
}

function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  return (
    <TouchableOpacity style={styles.vehicleCard} onPress={onPress}>
      <View style={styles.vehicleImageContainer}>
        <Icon name="truck" size={40} color="#6B7280" />
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleModel}>
          {vehicle.make} {vehicle.model}
        </Text>
        <Text style={styles.vehiclePlate}>{vehicle.licensePlate}</Text>
        <View style={styles.vehicleStats}>
          <Icon name="activity" size={12} color="#6B7280" />
          <Text style={styles.vehicleMileage}>{vehicle.mileage?.toLocaleString() || 0} km</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

interface BookingCardProps {
  booking: any;
  onPress: () => void;
}

function BookingCard({ booking, onPress }: BookingCardProps) {
  const getStatusColor = () => {
    switch (booking.status) {
      case 'scheduled':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity style={styles.bookingCard} onPress={onPress}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingWorkshop}>{booking.workshopName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {booking.status === 'scheduled'
              ? '예약됨'
              : booking.status === 'in_progress'
                ? '진행중'
                : '완료'}
          </Text>
        </View>
      </View>
      <Text style={styles.bookingService}>{booking.serviceType}</Text>
      <View style={styles.bookingFooter}>
        <View style={styles.bookingDate}>
          <Icon name="calendar" size={14} color="#6B7280" />
          <Text style={styles.bookingDateText}>
            {format(new Date(booking.scheduledDate), 'MM월 dd일 (EEE)', { locale: ko })}
          </Text>
        </View>
        <View style={styles.bookingTime}>
          <Icon name="clock" size={14} color="#6B7280" />
          <Text style={styles.bookingTimeText}>{booking.scheduledTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useSession();
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState(user?.vehicles || []);
  const [activeBookings, setActiveBookings] = useState([
    {
      id: '1',
      workshopName: '강남 정비소',
      serviceType: '정기 점검',
      status: 'scheduled',
      scheduledDate: new Date().toISOString(),
      scheduledTime: '14:00',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: 데이터 새로고침
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'booking':
        navigation.navigate('예약');
        break;
      case 'workshop':
        navigation.navigate('WorkshopList');
        break;
      case 'emergency':
        navigation.navigate('WorkshopList', { serviceType: 'emergency' });
        break;
      case 'history':
        navigation.navigate('이력');
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 인사말 섹션 */}
      <View style={styles.greetingSection}>
        <View style={styles.greetingContent}>
          <Text style={styles.greeting}>안녕하세요, {user?.name || '고객'}님!</Text>
          <Text style={styles.subGreeting}>오늘도 안전운전하세요 🚗</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="bell" size={24} color="#1F2937" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 빠른 액션 */}
      <View style={styles.quickActionsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <QuickAction
            icon="calendar"
            label="정비 예약"
            color="#6366F1"
            onPress={() => handleQuickAction('booking')}
          />
          <QuickAction
            icon="map-pin"
            label="정비소 찾기"
            color="#10B981"
            onPress={() => handleQuickAction('workshop')}
          />
          <QuickAction
            icon="alert-circle"
            label="긴급 정비"
            color="#EF4444"
            onPress={() => handleQuickAction('emergency')}
          />
          <QuickAction
            icon="clock"
            label="정비 이력"
            color="#F59E0B"
            onPress={() => handleQuickAction('history')}
          />
        </ScrollView>
      </View>

      {/* 내 차량 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 차량</Text>
          <TouchableOpacity onPress={() => navigation.navigate('차량')}>
            <Text style={styles.seeAllText}>모두 보기</Text>
          </TouchableOpacity>
        </View>
        {vehicles.length > 0 ? (
          vehicles
            .slice(0, 2)
            .map((vehicle: any) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPress={() => navigation.navigate('VehicleDetail', { id: vehicle.id })}
              />
            ))
        ) : (
          <TouchableOpacity
            style={styles.addVehicleCard}
            onPress={() => navigation.navigate('AddVehicle')}
          >
            <Icon name="plus-circle" size={32} color="#6366F1" />
            <Text style={styles.addVehicleText}>차량 등록하기</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 예약 현황 */}
      {activeBookings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>예약 현황</Text>
            <TouchableOpacity onPress={() => navigation.navigate('예약')}>
              <Text style={styles.seeAllText}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          {activeBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={() => navigation.navigate('BookingDetail', { id: booking.id })}
            />
          ))}
        </View>
      )}

      {/* 프로모션 배너 */}
      <View style={styles.promotionSection}>
        <View style={styles.promotionCard}>
          <View style={styles.promotionContent}>
            <Text style={styles.promotionTitle}>첫 정비 20% 할인</Text>
            <Text style={styles.promotionDescription}>
              CarGoro와 함께하는 첫 정비를 특별한 가격에!
            </Text>
            <TouchableOpacity style={styles.promotionButton}>
              <Text style={styles.promotionButtonText}>자세히 보기</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promotionImage}>
            <Icon name="gift" size={48} color="#6366F1" />
          </View>
        </View>
      </View>

      {/* 서비스 통계 */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>나의 차량 관리 현황</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.totalServices || 0}</Text>
            <Text style={styles.statLabel}>총 정비 횟수</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{vehicles.length}</Text>
            <Text style={styles.statLabel}>등록 차량</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.activeBookings || 0}</Text>
            <Text style={styles.statLabel}>진행중 예약</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greetingContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActionsSection: {
    paddingVertical: 20,
    paddingLeft: 20,
    backgroundColor: '#FFFFFF',
  },
  quickAction: {
    alignItems: 'center',
    marginRight: 20,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vehicleImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  vehicleStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleMileage: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  addVehicleCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  addVehicleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginTop: 8,
  },
  bookingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingWorkshop: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingService: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  bookingTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingTimeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  promotionSection: {
    padding: 20,
  },
  promotionCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promotionContent: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4C1D95',
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 14,
    color: '#6B21A8',
    marginBottom: 12,
  },
  promotionButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  promotionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  promotionImage: {
    marginLeft: 20,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});
