import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { apiService } from '../../services/api-service';
import { DeliveryStackParamList } from '../../(tabs)/delivery-list';

// 배송 아이템 타입 정의
export interface Delivery {
  id: string;
  status: string;
  delivery_type: string;
  origin_location: string;
  destination_location: string;
  scheduled_date: string;
  priority: string;
  customer_id?: string;
  contact_person?: string;
  contact_phone?: string;
}

// 배송 상태별 색상 및 아이콘
const STATUS_CONFIG: Record<
  string,
  { color: string; icon: keyof typeof Feather.glyphMap; label: string }
> = {
  pending: {
    color: '#FFA500',
    icon: 'clock',
    label: '대기 중',
  },
  assigned: {
    color: '#3498DB',
    icon: 'user-check',
    label: '배정됨',
  },
  in_transit: {
    color: '#27AE60',
    icon: 'truck',
    label: '이동 중',
  },
  completed: {
    color: '#2ECC71',
    icon: 'check-circle',
    label: '완료',
  },
  failed: {
    color: '#E74C3C',
    icon: 'x-circle',
    label: '실패',
  },
  cancelled: {
    color: '#95A5A6',
    icon: 'slash',
    label: '취소됨',
  },
};

// 배송 우선순위별 색상 및 라벨
const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  low: {
    color: '#95A5A6',
    label: '낮음',
  },
  normal: {
    color: '#3498DB',
    label: '보통',
  },
  high: {
    color: '#FFA500',
    label: '높음',
  },
  urgent: {
    color: '#E74C3C',
    label: '긴급',
  },
};

// 배송 타입 매핑
const DELIVERY_TYPE_LABELS: Record<string, string> = {
  customer_delivery: '고객 인도',
  workshop_transfer: '정비소 이동',
  dealer_transfer: '딜러 이동',
  purchase_pickup: '구매 차량 픽업',
  return_delivery: '반납 차량 배송',
};

type DeliveryListScreenNavigationProp = StackNavigationProp<DeliveryStackParamList, 'DeliveryList'>;

const DeliveryListScreen: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<DeliveryListScreenNavigationProp>();

  // 배송 목록 조회 함수
  const fetchDeliveries = async () => {
    try {
      setError(null);
      const data = await apiService.getDeliveries();
      setDeliveries(data);
    } catch (err) {
      console.error('배송 목록 조회 오류:', err);
      setError('배송 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchDeliveries();
  }, []);

  // 새로고침 처리
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeliveries();
  };

  // 배송 상세 정보로 이동
  const handleDeliveryPress = (delivery: Delivery) => {
    navigation.navigate('DeliveryDetail', { deliveryId: delivery.id });
  };

  // 배송 아이템 렌더링
  const renderDeliveryItem = ({ item }: { item: Delivery }) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const priorityConfig = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.normal;
    const typeLabel = DELIVERY_TYPE_LABELS[item.delivery_type] || '배송';

    return (
      <TouchableOpacity
        style={styles.deliveryItem}
        onPress={() => handleDeliveryPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.deliveryHeader}>
          <View style={styles.statusContainer}>
            <Feather name={statusConfig.icon} size={16} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '20' }]}>
            <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>
        </View>

        <Text style={styles.deliveryType}>{typeLabel}</Text>

        <View style={styles.locationContainer}>
          <View style={styles.locationItem}>
            <Feather name="map-pin" size={16} color="#6B7280" style={styles.locationIcon} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.origin_location}
            </Text>
          </View>
          <Feather name="arrow-down" size={16} color="#6B7280" style={styles.arrowIcon} />
          <View style={styles.locationItem}>
            <Feather name="flag" size={16} color="#6B7280" style={styles.locationIcon} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.destination_location}
            </Text>
          </View>
        </View>

        <View style={styles.deliveryFooter}>
          <Text style={styles.scheduledDate}>
            {new Date(item.scheduled_date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Feather name="chevron-right" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>
    );
  };

  // 로딩 중 표시
  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>배송 목록 불러오는 중...</Text>
      </View>
    );
  }

  // 오류 발생시 표시
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Feather name="alert-circle" size={40} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeliveries}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 데이터가 없을 때 표시
  if (deliveries.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Feather name="inbox" size={40} color="#9CA3AF" />
        <Text style={styles.emptyText}>배정된 배송이 없습니다</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>새로고침</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 배송 목록 표시
  return (
    <View style={styles.container}>
      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563EB']} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  deliveryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deliveryType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  locationIcon: {
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 8,
    marginVertical: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  scheduledDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  refreshButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default DeliveryListScreen;
