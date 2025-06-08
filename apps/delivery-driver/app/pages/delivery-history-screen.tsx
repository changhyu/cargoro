import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDeliveryStore, Delivery } from '../state/delivery-store';
import type { RootStackParamList } from '../navigation/index';

type DeliveryStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// 배송 상태별 색상 및 라벨
const STATUS_CONFIG: Record<DeliveryStatus, { color: string; label: string; icon: string }> = {
  pending: { color: '#3498db', label: '대기중', icon: 'timer-sand' },
  in_progress: { color: '#f39c12', label: '진행중', icon: 'truck-delivery' },
  completed: { color: '#2ecc71', label: '완료', icon: 'check-circle' },
  cancelled: { color: '#e74c3c', label: '취소', icon: 'close-circle' },
};

const DeliveryHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { fetchDeliveries } = useDeliveryStore();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<DeliveryStatus | 'all'>('all');

  // 배송 내역 가져오기
  const loadDeliveries = async () => {
    try {
      setIsLoading(true);
      await fetchDeliveries();
      const allDeliveries = useDeliveryStore.getState().deliveries;

      // 가장 최근 배송이 상단에 오도록 정렬
      const sortedDeliveries = [...allDeliveries].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // 내림차순 정렬
      });

      setDeliveries(sortedDeliveries);
    } catch (error) {
      Alert.alert('오류', '배송 내역을 불러오는 데 실패했습니다.');
      console.error('배송 내역 불러오기 오류:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 필터링된 배송 목록
  const filteredDeliveries = deliveries.filter(
    delivery => filter === 'all' || delivery.status === filter
  );

  // 화면 로드 시 배송 내역 가져오기
  useEffect(() => {
    loadDeliveries();
  }, []);

  // 배송 상태 필터 변경
  const handleFilterChange = (newFilter: DeliveryStatus | 'all') => {
    setFilter(newFilter);
  };

  // 새로고침
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDeliveries();
  };

  // 배송 내역 상세 페이지로 이동
  const handleDeliveryPress = (delivery: Delivery) => {
    navigation.navigate('DeliveryDetail', { deliveryId: delivery.id });
  };

  // 배송 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 필터 버튼 컴포넌트
  const FilterButton = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: DeliveryStatus | 'all';
    icon: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
        value !== 'all' && {
          backgroundColor: `${STATUS_CONFIG[value as DeliveryStatus]?.color}22`,
        },
      ]}
      onPress={() => handleFilterChange(value)}
    >
      <Icon
        name={value === 'all' ? icon : STATUS_CONFIG[value]?.icon}
        size={16}
        color={
          filter === value ? (value === 'all' ? '#3498db' : STATUS_CONFIG[value]?.color) : '#95a5a6'
        }
      />
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
          filter === value &&
            value !== 'all' && { color: STATUS_CONFIG[value as DeliveryStatus]?.color },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>배송 내역</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 필터 버튼 */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <FilterButton title="전체" value="all" icon="filter-variant" />
          <FilterButton title="대기중" value="pending" icon="timer-sand" />
          <FilterButton title="진행중" value="in_progress" icon="truck-delivery" />
          <FilterButton title="완료" value="completed" icon="check-circle" />
          <FilterButton title="취소" value="cancelled" icon="close-circle" />
        </ScrollView>
      </View>

      {/* 배송 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>배송 내역을 불러오는 중...</Text>
        </View>
      ) : filteredDeliveries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="truck-check" size={60} color="#95a5a6" />
          <Text style={styles.emptyText}>배송 내역이 없습니다.</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>새로고침</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDeliveries}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.deliveryItem} onPress={() => handleDeliveryPress(item)}>
              <View style={styles.deliveryHeader}>
                <Text style={styles.deliveryDate}>{formatDate(item.createdAt)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_CONFIG[item.status].color },
                  ]}
                >
                  <Text style={styles.statusText}>{STATUS_CONFIG[item.status].label}</Text>
                </View>
              </View>

              <View style={styles.deliveryInfo}>
                <View style={styles.addressContainer}>
                  <View style={styles.iconContainer}>
                    <Icon name="map-marker" size={20} color="#3498db" />
                  </View>
                  <View style={styles.addressContent}>
                    <Text style={styles.addressLabel}>픽업</Text>
                    <Text style={styles.addressText} numberOfLines={1}>
                      {item.pickupAddress}
                    </Text>
                  </View>
                </View>

                <View style={styles.arrowContainer}>
                  <Icon name="arrow-down" size={16} color="#95a5a6" />
                </View>

                <View style={styles.addressContainer}>
                  <View style={styles.iconContainer}>
                    <Icon name="flag-checkered" size={20} color="#e74c3c" />
                  </View>
                  <View style={styles.addressContent}>
                    <Text style={styles.addressLabel}>배송</Text>
                    <Text style={styles.addressText} numberOfLines={1}>
                      {item.deliveryAddress}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.deliveryFooter}>
                <View style={styles.infoItem}>
                  <Icon name="map-marker-distance" size={16} color="#7f8c8d" />
                  <Text style={styles.infoText}>{item.distance}km</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="clock-outline" size={16} color="#7f8c8d" />
                  <Text style={styles.infoText}>{item.estimatedTime}분</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="car" size={16} color="#7f8c8d" />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {item.vehicleModel} {item.vehicleNumber}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={styles.listContent}
        />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScrollContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#95a5a6',
    marginLeft: 4,
  },
  filterButtonTextActive: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#7f8c8d',
    fontSize: 16,
  },
  refreshButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  deliveryItem: {
    backgroundColor: 'white',
    borderRadius: 8,
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
    marginBottom: 12,
  },
  deliveryDate: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deliveryInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  addressText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#7f8c8d',
  },
});

export default DeliveryHistoryScreen;
