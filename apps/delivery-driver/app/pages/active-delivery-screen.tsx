import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useDeliveryStore } from '../state/delivery-store';

interface DeliveryCardProps {
  id: string;
  customerName: string;
  vehicleNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedTime: string;
  distance: number;
  price: number;
  startTime?: string;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({
  id,
  customerName,
  vehicleNumber,
  pickupAddress,
  deliveryAddress,
  estimatedTime,
  distance,
  price,
  startTime,
}) => {
  const navigation = useNavigation();

  const calculateElapsedTime = () => {
    if (!startTime) return '0분';

    const start = new Date(startTime);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}시간 ${minutes}분`;
    }
  };

  return (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: id })}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.vehicleNumber}>{vehicleNumber}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Icon name="truck" size={14} color="#3B82F6" />
          <Text style={styles.statusText}>진행중</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.locationSection}>
        <View style={styles.locationItem}>
          <View style={styles.locationIcon}>
            <Icon name="map-pin" size={16} color="#10B981" />
          </View>
          <Text style={styles.locationText} numberOfLines={2}>
            {pickupAddress}
          </Text>
        </View>
        <View style={styles.locationConnector}>
          <View style={styles.connectorLine} />
          <Icon name="arrow-down" size={16} color="#9CA3AF" />
        </View>
        <View style={styles.locationItem}>
          <View style={styles.locationIcon}>
            <Icon name="flag" size={16} color="#EF4444" />
          </View>
          <Text style={styles.locationText} numberOfLines={2}>
            {deliveryAddress}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Icon name="clock" size={14} color="#6B7280" />
          <Text style={styles.infoLabel}>경과 시간</Text>
          <Text style={styles.infoValue}>{calculateElapsedTime()}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="navigation" size={14} color="#6B7280" />
          <Text style={styles.infoLabel}>거리</Text>
          <Text style={styles.infoValue}>{distance} km</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="dollar-sign" size={14} color="#6B7280" />
          <Text style={styles.infoLabel}>배송료</Text>
          <Text style={styles.infoValue}>{price.toLocaleString()}원</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.detailButton}>
        <Text style={styles.detailButtonText}>상세 정보 보기</Text>
        <Icon name="chevron-right" size={16} color="#3B82F6" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function ActiveDeliveryScreen() {
  const navigation = useNavigation();
  const { deliveries, fetchDeliveries } = useDeliveryStore();
  const [refreshing, setRefreshing] = useState(false);

  const activeDeliveries = deliveries.filter(d => d.status === 'in_progress');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveries();
    setRefreshing(false);
  };

  const handleEmergency = () => {
    Alert.alert('긴급 상황', '관제센터에 연락하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '전화 연결',
        style: 'destructive',
        onPress: () => {
          // TODO: 긴급 전화 연결
          Alert.alert('알림', '관제센터로 연결 중입니다...');
        },
      },
    ]);
  };

  if (activeDeliveries.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.emptyContent}>
          <Icon name="truck" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>진행중인 배송이 없습니다</Text>
          <Text style={styles.emptySubText}>
            새로운 배송을 시작하려면 배송 목록으로 이동하세요.
          </Text>
          <TouchableOpacity
            style={styles.goToListButton}
            onPress={() => navigation.navigate('Main', { screen: '배송목록' } as any)}
          >
            <Text style={styles.goToListButtonText}>배송 목록 보기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 상태 요약 */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>진행중인 배송</Text>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryCount}>{activeDeliveries.length}</Text>
              <Text style={styles.summaryUnit}>건</Text>
            </View>
          </View>
          <Text style={styles.summaryText}>안전운전하시고, 도착 시 사진 촬영을 잊지 마세요!</Text>
        </View>

        {/* 진행중인 배송 목록 */}
        {activeDeliveries.map(delivery => (
          <DeliveryCard
            key={delivery.id}
            id={delivery.id}
            customerName={delivery.customerName}
            vehicleNumber={delivery.vehicleNumber}
            pickupAddress={delivery.pickupAddress}
            deliveryAddress={delivery.deliveryAddress}
            estimatedTime={delivery.estimatedTime}
            distance={delivery.distance}
            price={delivery.price}
            startTime={delivery.updatedAt}
          />
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 긴급 상황 버튼 */}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
        <Icon name="phone" size={20} color="#FFFFFF" />
        <Text style={styles.emergencyButtonText}>긴급 상황</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  goToListButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goToListButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryUnit: {
    fontSize: 14,
    color: '#DBEAFE',
    marginLeft: 2,
  },
  summaryText: {
    fontSize: 14,
    color: '#DBEAFE',
    lineHeight: 20,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  locationSection: {
    marginBottom: 4,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  locationConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginVertical: 4,
  },
  connectorLine: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 7,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 4,
  },
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});
