import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { IntegratedRootStackParamList } from '../../types/integrated-navigation';

type MaintenanceHistoryScreenNavigationProp = StackNavigationProp<
  IntegratedRootStackParamList,
  'MaintenanceHistory'
>;

type MaintenanceHistoryScreenRouteProp = RouteProp<
  IntegratedRootStackParamList,
  'MaintenanceHistory'
>;

interface MaintenanceRecord {
  id: string;
  date: string;
  serviceName: string;
  workshopName: string;
  cost: number;
  mileage: number;
  status: 'completed' | 'cancelled' | 'scheduled';
  serviceType: 'routine' | 'repair' | 'emergency';
  description: string;
  parts: Part[];
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  invoiceNumber: string;
  technician: string;
  duration: string;
  warranty: string;
}

interface Part {
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
}

interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  totalMileage: number;
}

const MaintenanceHistoryScreen: React.FC = () => {
  const navigation = useNavigation<MaintenanceHistoryScreenNavigationProp>();
  const route = useRoute<MaintenanceHistoryScreenRouteProp>();
  const { vehicleId } = route.params || {};

  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicleId || '1');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const mockVehicles: Vehicle[] = [
    { id: '1', name: '내 소나타', model: '현대 소나타', year: 2022, totalMileage: 45000 },
    { id: '2', name: '아내 그랜저', model: '현대 그랜저', year: 2023, totalMileage: 22000 },
  ];

  const mockMaintenanceRecords: MaintenanceRecord[] = [
    {
      id: '1',
      date: '2024-11-15',
      serviceName: '엔진오일 교환',
      workshopName: '카고로 정비센터 강남점',
      cost: 65000,
      mileage: 44500,
      status: 'completed',
      serviceType: 'routine',
      description: '엔진오일 및 오일필터 교환, 기본 점검',
      parts: [
        { name: '엔진오일', partNumber: 'OIL-001', quantity: 4, unitPrice: 12000 },
        { name: '오일필터', partNumber: 'FILTER-001', quantity: 1, unitPrice: 8000 },
      ],
      nextMaintenanceDate: '2025-05-15',
      nextMaintenanceMileage: 54500,
      invoiceNumber: 'INV-2024-001',
      technician: '김정비',
      duration: '30분',
      warranty: '6개월 또는 10,000km',
    },
    {
      id: '2',
      date: '2024-09-20',
      serviceName: '타이어 교체',
      workshopName: '스마트카 서비스센터',
      cost: 320000,
      mileage: 42000,
      status: 'completed',
      serviceType: 'repair',
      description: '전체 타이어 4개 교체 및 휠 밸런스 조정',
      parts: [{ name: '타이어', partNumber: 'TIRE-225/60R16', quantity: 4, unitPrice: 75000 }],
      invoiceNumber: 'INV-2024-002',
      technician: '박타이어',
      duration: '1시간 30분',
      warranty: '2년 또는 60,000km',
    },
    {
      id: '3',
      date: '2024-07-10',
      serviceName: '정기점검',
      workshopName: '현대 서비스센터',
      cost: 120000,
      mileage: 38000,
      status: 'completed',
      serviceType: 'routine',
      description: '6개월 정기점검 및 소모품 교체',
      parts: [
        { name: '에어필터', partNumber: 'AIR-001', quantity: 1, unitPrice: 15000 },
        { name: '와이퍼 블레이드', partNumber: 'WIPER-001', quantity: 2, unitPrice: 25000 },
      ],
      nextMaintenanceDate: '2025-01-10',
      nextMaintenanceMileage: 48000,
      invoiceNumber: 'INV-2024-003',
      technician: '이정비',
      duration: '2시간',
      warranty: '1년 또는 20,000km',
    },
    {
      id: '4',
      date: '2024-12-25',
      serviceName: '브레이크 패드 교체',
      workshopName: '프리미엄 오토케어',
      cost: 180000,
      mileage: 45200,
      status: 'scheduled',
      serviceType: 'repair',
      description: '앞뒤 브레이크 패드 교체 예정',
      parts: [
        { name: '브레이크 패드(전)', partNumber: 'BRAKE-F001', quantity: 1, unitPrice: 80000 },
        { name: '브레이크 패드(후)', partNumber: 'BRAKE-R001', quantity: 1, unitPrice: 60000 },
      ],
      invoiceNumber: 'SCH-2024-001',
      technician: '최브레이크',
      duration: '1시간',
      warranty: '1년 또는 30,000km',
    },
  ];

  const filterOptions = [
    { id: 'all', name: '전체', icon: 'list-outline' as keyof typeof Ionicons.glyphMap },
    {
      id: 'completed',
      name: '완료',
      icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
    },
    { id: 'scheduled', name: '예정', icon: 'time-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'routine', name: '정기', icon: 'refresh-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'repair', name: '수리', icon: 'construct-outline' as keyof typeof Ionicons.glyphMap },
  ];

  useEffect(() => {
    setVehicles(mockVehicles);
    setMaintenanceRecords(mockMaintenanceRecords);
  }, []);

  const filteredRecords = maintenanceRecords.filter(record => {
    if (selectedFilter === 'all') return true;
    if (['completed', 'scheduled', 'cancelled'].includes(selectedFilter)) {
      return record.status === selectedFilter;
    }
    if (['routine', 'repair', 'emergency'].includes(selectedFilter)) {
      return record.serviceType === selectedFilter;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'scheduled':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'scheduled':
        return '예정';
      case 'cancelled':
        return '취소';
      default:
        return status;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'routine':
        return '#2196F3';
      case 'repair':
        return '#FF9800';
      case 'emergency':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const handleRecordPress = (record: MaintenanceRecord) => {
    const totalPartsCost = record.parts.reduce(
      (sum, part) => sum + part.quantity * part.unitPrice,
      0
    );
    const laborCost = record.cost - totalPartsCost;

    Alert.alert(
      record.serviceName,
      `정비소: ${record.workshopName}\n날짜: ${record.date}\n주행거리: ${record.mileage.toLocaleString()}km\n\n작업 내용:\n${record.description}\n\n부품비: ${formatCurrency(totalPartsCost)}\n공임: ${formatCurrency(laborCost)}\n총 비용: ${formatCurrency(record.cost)}\n\n담당자: ${record.technician}\n소요시간: ${record.duration}\n보증기간: ${record.warranty}`,
      [
        { text: '닫기', style: 'cancel' },
        ...(record.status === 'scheduled'
          ? [
              { text: '예약 변경', onPress: () => navigation.navigate('MaintenanceBooking', {}) },
              {
                text: '예약 취소',
                style: 'destructive' as const,
                onPress: () => Alert.alert('예약 취소', '예약이 취소되었습니다.'),
              },
            ]
          : []),
        {
          text: '영수증 보기',
          onPress: () => Alert.alert('영수증', `영수증 번호: ${record.invoiceNumber}`),
        },
      ]
    );
  };

  const selectedVehicleInfo = vehicles.find(v => v.id === selectedVehicle);
  const completedRecords = filteredRecords.filter(r => r.status === 'completed');
  const totalMaintenanceCost = completedRecords.reduce((sum, record) => sum + record.cost, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>정비 이력</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 차량 선택 */}
      <View style={styles.vehicleSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.vehicleButtons}>
            {vehicles.map(vehicle => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleButton,
                  selectedVehicle === vehicle.id && styles.activeVehicleButton,
                ]}
                onPress={() => setSelectedVehicle(vehicle.id)}
              >
                <Ionicons
                  name="car-outline"
                  size={16}
                  color={selectedVehicle === vehicle.id ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.vehicleButtonText,
                    selectedVehicle === vehicle.id && styles.activeVehicleButtonText,
                  ]}
                >
                  {vehicle.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 차량 정보 요약 */}
      {selectedVehicleInfo && (
        <View style={styles.vehicleSummary}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>총 주행거리</Text>
              <Text style={styles.summaryValue}>
                {selectedVehicleInfo.totalMileage.toLocaleString()}km
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>총 정비비용</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalMaintenanceCost)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>정비 횟수</Text>
              <Text style={styles.summaryValue}>{completedRecords.length}회</Text>
            </View>
          </View>
        </View>
      )}

      {/* 필터 */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {filterOptions.map(filter => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.activeFilterButton,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={selectedFilter === filter.id ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter.id && styles.activeFilterButtonText,
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 정비 이력 목록 */}
      <ScrollView style={styles.recordsList} showsVerticalScrollIndicator={false}>
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>정비 이력이 없습니다</Text>
            <Text style={styles.emptyStateSubtext}>첫 번째 정비를 예약해보세요</Text>
            <TouchableOpacity
              style={styles.bookingButton}
              onPress={() => navigation.navigate('MaintenanceBooking', {})}
            >
              <Text style={styles.bookingButtonText}>정비 예약하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.recordsContainer}>
            {filteredRecords.map(record => (
              <TouchableOpacity
                key={record.id}
                style={styles.recordCard}
                onPress={() => handleRecordPress(record)}
              >
                <View style={styles.recordHeader}>
                  <View style={styles.recordInfo}>
                    <Text style={styles.serviceName}>{record.serviceName}</Text>
                    <Text style={styles.workshopName}>{record.workshopName}</Text>
                  </View>
                  <View style={styles.recordStatus}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(record.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{getStatusText(record.status)}</Text>
                    </View>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: getServiceTypeColor(record.serviceType) },
                      ]}
                    >
                      <Text style={styles.typeText}>
                        {record.serviceType === 'routine'
                          ? '정기'
                          : record.serviceType === 'repair'
                            ? '수리'
                            : '응급'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.recordDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📅 {record.date}</Text>
                    <Text style={styles.detailLabel}>🛣 {record.mileage.toLocaleString()}km</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.costText}>💰 {formatCurrency(record.cost)}</Text>
                    {record.nextMaintenanceDate && (
                      <Text style={styles.nextMaintenanceText}>
                        다음 정비: {record.nextMaintenanceDate}
                      </Text>
                    )}
                  </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {record.description}
                </Text>

                {record.parts.length > 0 && (
                  <View style={styles.partsContainer}>
                    <Text style={styles.partsTitle}>교체 부품:</Text>
                    <View style={styles.partsList}>
                      {record.parts.slice(0, 2).map((part, index) => (
                        <Text key={index} style={styles.partItem}>
                          • {part.name} x{part.quantity}
                        </Text>
                      ))}
                      {record.parts.length > 2 && (
                        <Text style={styles.morePartsText}>
                          외 {record.parts.length - 2}개 부품
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  exportButton: {
    padding: 8,
  },
  vehicleSelector: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  vehicleButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },
  vehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  activeVehicleButton: {
    backgroundColor: '#4CAF50',
  },
  vehicleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeVehicleButtonText: {
    color: '#fff',
  },
  vehicleSummary: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  recordsList: {
    flex: 1,
    padding: 20,
  },
  recordsContainer: {
    gap: 16,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workshopName: {
    fontSize: 14,
    color: '#666',
  },
  recordStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  recordDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  costText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  nextMaintenanceText: {
    fontSize: 12,
    color: '#FF9800',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  partsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  partsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  partsList: {
    gap: 4,
  },
  partItem: {
    fontSize: 12,
    color: '#666',
  },
  morePartsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  bookingButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  bookingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MaintenanceHistoryScreen;
