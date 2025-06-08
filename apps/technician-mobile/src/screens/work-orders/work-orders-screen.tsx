import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useWorkOrderStore, WorkOrder } from '../../stores/work-order-store';

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onPress: () => void;
}

const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ workOrder, onPress }) => {
  const getPriorityColor = () => {
    switch (workOrder.priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'normal':
        return '#3B82F6';
      case 'low':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = () => {
    switch (workOrder.status) {
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (workOrder.status) {
      case 'pending':
        return '대기중';
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  const getStatusIcon = () => {
    switch (workOrder.status) {
      case 'pending':
        return 'clock';
      case 'in_progress':
        return 'tool';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'x-circle';
      default:
        return 'circle';
    }
  };

  return (
    <TouchableOpacity style={styles.workOrderCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleNumber}>{workOrder.vehicleNumber}</Text>
          <Text style={styles.vehicleModel}>
            {workOrder.vehicleMake} {workOrder.vehicleModel} ({workOrder.vehicleYear})
          </Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
            {workOrder.priority === 'urgent'
              ? '긴급'
              : workOrder.priority === 'high'
                ? '높음'
                : workOrder.priority === 'normal'
                  ? '보통'
                  : '낮음'}
          </Text>
        </View>
      </View>

      <View style={styles.serviceInfo}>
        <Text style={styles.serviceType}>{workOrder.serviceType}</Text>
        <Text style={styles.serviceCount}>{workOrder.services.length}개 작업</Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View style={styles.customerInfo}>
          <Icon name="user" size={14} color="#6B7280" />
          <Text style={styles.customerName}>{workOrder.customerName}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Icon name={getStatusIcon()} size={14} color={getStatusColor()} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.timeInfo}>
        <Icon name="clock" size={12} color="#6B7280" />
        <Text style={styles.timeText}>예상: {workOrder.estimatedTime}분</Text>
        {workOrder.actualTime && (
          <>
            <Text style={styles.timeSeparator}>|</Text>
            <Text style={styles.timeText}>실제: {workOrder.actualTime}분</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function WorkOrdersScreen() {
  const navigation = useNavigation();
  const { workOrders, fetchWorkOrders, isLoading } = useWorkOrderStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkOrders();
    setRefreshing(false);
  };

  const handleWorkOrderPress = (workOrder: WorkOrder) => {
    navigation.navigate('WorkOrderDetail', { id: workOrder.id });
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner', { type: 'vehicle' });
  };

  // 필터링된 작업 목록
  const filteredWorkOrders = workOrders.filter(order => {
    // 상태 필터
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.vehicleNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.vehicleModel.toLowerCase().includes(query) ||
        order.vehicleMake.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="clipboard" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>작업이 없습니다</Text>
      <Text style={styles.emptySubText}>
        {filterStatus !== 'all'
          ? '다른 필터를 선택해보세요'
          : '새로운 작업이 배정되면 여기에 표시됩니다'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="차량번호, 고객명 검색"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="x" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* 필터 버튼 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>
            대기중
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'in_progress' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('in_progress')}
        >
          <Text
            style={[styles.filterText, filterStatus === 'in_progress' && styles.filterTextActive]}
          >
            진행중
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('completed')}
        >
          <Text
            style={[styles.filterText, filterStatus === 'completed' && styles.filterTextActive]}
          >
            완료
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={filteredWorkOrders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <WorkOrderCard workOrder={item} onPress={() => handleWorkOrderPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmptyList}
      />

      {/* QR 스캔 플로팅 버튼 */}
      <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
        <Icon name="maximize" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  workOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  serviceCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  timeSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  scanButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#10B981',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
