import React, { useEffect, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../navigation';

// 타입 정의
type RepairStatus = 'waiting' | 'in-progress' | 'completed' | 'scheduled';

interface Repair {
  id: string;
  customerName: string;
  vehicleModel: string;
  licensePlate: string;
  status: RepairStatus;
  service: string;
  date: string;
  estimatedCompletion: string;
}

type RepairListScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// 임시 데이터 (API 연동 전까지 사용)
const DUMMY_REPAIRS: Repair[] = [
  {
    id: '1',
    customerName: '김민수',
    vehicleModel: '현대 아반떼',
    licensePlate: '12가 3456',
    status: 'in-progress',
    service: '엔진 오일 교체',
    date: '2025-05-21',
    estimatedCompletion: '2025-05-21 14:30',
  },
  {
    id: '2',
    customerName: '이지영',
    vehicleModel: '기아 K5',
    licensePlate: '34나 5678',
    status: 'waiting',
    service: '타이어 교체',
    date: '2025-05-21',
    estimatedCompletion: '2025-05-21 16:00',
  },
  {
    id: '3',
    customerName: '박준호',
    vehicleModel: '쌍용 코란도',
    licensePlate: '56다 7890',
    status: 'completed',
    service: '브레이크 패드 교체',
    date: '2025-05-20',
    estimatedCompletion: '2025-05-20 18:00',
  },
  {
    id: '4',
    customerName: '최수진',
    vehicleModel: '현대 싼타페',
    licensePlate: '78라 9012',
    status: 'scheduled',
    service: '정기 점검',
    date: '2025-05-22',
    estimatedCompletion: '2025-05-22 11:00',
  },
  {
    id: '5',
    customerName: '정현우',
    vehicleModel: '기아 스포티지',
    licensePlate: '90마 1234',
    status: 'in-progress',
    service: '에어컨 정비',
    date: '2025-05-21',
    estimatedCompletion: '2025-05-21 15:30',
  },
];

const getStatusColor = (status: RepairStatus): string => {
  switch (status) {
    case 'waiting':
      return '#f39c12'; // 노란색
    case 'in-progress':
      return '#3498db'; // 파란색
    case 'completed':
      return '#2ecc71'; // 녹색
    case 'scheduled':
      return '#9b59b6'; // 보라색
    default:
      return '#7f8c8d'; // 회색
  }
};

const getStatusText = (status: RepairStatus): string => {
  switch (status) {
    case 'waiting':
      return '대기 중';
    case 'in-progress':
      return '진행 중';
    case 'completed':
      return '완료됨';
    case 'scheduled':
      return '예약됨';
    default:
      return '알 수 없음';
  }
};

const RepairListScreen = () => {
  const navigation = useNavigation<RepairListScreenNavigationProp>();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | RepairStatus>('all');

  useEffect(() => {
    // API 연동 시 여기에서 데이터를 가져옵니다
    // 지금은 임시 데이터를 사용합니다
    setTimeout(() => {
      setRepairs(DUMMY_REPAIRS);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRepairs = repairs.filter(repair => {
    if (filter === 'all') return true;
    return repair.status === filter;
  });

  const renderRepairItem = ({ item }: { item: Repair }) => (
    <TouchableOpacity
      style={styles.repairItem}
      onPress={() => navigation.navigate('RepairDetail', { repairId: item.id })}
    >
      <View style={styles.repairHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.vehicleInfo}>
            {item.vehicleModel} - {item.licensePlate}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.serviceInfo}>
        <Icon name="wrench" size={16} color="#7f8c8d" />
        <Text style={styles.serviceText}>{item.service}</Text>
      </View>

      <View style={styles.timeInfo}>
        <Icon name="calendar" size={16} color="#7f8c8d" />
        <Text style={styles.timeText}>{item.date}</Text>

        <Icon name="clock-outline" size={16} color="#7f8c8d" style={styles.clockIcon} />
        <Text style={styles.timeText}>예상 완료: {item.estimatedCompletion.split(' ')[1]}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>정비 작업</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RepairCreate')}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'waiting' && styles.activeFilter]}
          onPress={() => setFilter('waiting')}
        >
          <Text style={[styles.filterText, filter === 'waiting' && styles.activeFilterText]}>
            대기 중
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'in-progress' && styles.activeFilter]}
          onPress={() => setFilter('in-progress')}
        >
          <Text style={[styles.filterText, filter === 'in-progress' && styles.activeFilterText]}>
            진행 중
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
            완료됨
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>정비 목록 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRepairs}
          renderItem={renderRepairItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="clipboard-text-off" size={64} color="#e0e0e0" />
              <Text style={styles.emptyText}>정비 작업이 없습니다</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#3498db',
  },
  filterText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  repairItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  repairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2c3e50',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#7f8c8d',
  },
  clockIcon: {
    marginLeft: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default RepairListScreen;
