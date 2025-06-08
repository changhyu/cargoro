import React, { useEffect, useState } from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../navigation';

// 타입 정의
interface VehicleMaintenance {
  id: string;
  serviceType: string;
  date: string;
  mileage: number;
  technician: string;
  notes?: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  color: string;
  engineType: string;
  transmission: string;
  fuelType: string;
  mileage: number;
  purchaseDate?: string;
  lastServiceDate?: string;
  nextServiceDue?: string;
  nextServiceMileage?: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  maintenanceHistory: VehicleMaintenance[];
  notes?: string;
}

type VehicleDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type VehicleDetailScreenRouteProp = RouteProp<RootStackParamList, 'VehicleDetail'>;

// 임시 데이터 (API 연동 전까지 사용)
const DUMMY_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    licensePlate: '12가 3456',
    vin: 'KMHXX00XXXX000001',
    make: '현대',
    model: '아반떼',
    year: '2022',
    color: '파랑',
    engineType: '2.0L 가솔린',
    transmission: '자동 6단',
    fuelType: '가솔린',
    mileage: 25000,
    purchaseDate: '2023-05-10',
    lastServiceDate: '2025-05-15',
    nextServiceDue: '2025-08-15',
    nextServiceMileage: 30000,
    ownerName: '김민수',
    ownerPhone: '010-1234-5678',
    ownerEmail: 'kim.minsoo@example.com',
    maintenanceHistory: [
      {
        id: 'm1',
        serviceType: '엔진 오일 교체',
        date: '2025-05-15',
        mileage: 25000,
        technician: '이태식',
        notes: '필터도 함께 교체',
      },
      {
        id: 'm2',
        serviceType: '타이어 교체 (앞)',
        date: '2025-03-20',
        mileage: 22000,
        technician: '박정비',
      },
      {
        id: 'm3',
        serviceType: '정기 점검',
        date: '2024-11-10',
        mileage: 15000,
        technician: '김기술',
        notes: '브레이크 패드 마모 진행 중, 다음 점검 시 교체 권장',
      },
    ],
    notes: '냉각수 누수 증상 있어 지속 관찰 필요',
  },
  {
    id: 'v2',
    licensePlate: '34나 5678',
    vin: 'KNXXX00XXXX000002',
    make: '기아',
    model: 'K5',
    year: '2021',
    color: '검정',
    engineType: '2.0L 터보',
    transmission: '자동 8단',
    fuelType: '가솔린',
    mileage: 35000,
    purchaseDate: '2021-12-15',
    lastServiceDate: '2025-05-18',
    nextServiceDue: '2025-08-18',
    nextServiceMileage: 40000,
    ownerName: '이지영',
    ownerPhone: '010-2345-6789',
    ownerEmail: 'lee.jiyoung@example.com',
    maintenanceHistory: [
      {
        id: 'm4',
        serviceType: '브레이크 패드 교체',
        date: '2025-05-18',
        mileage: 35000,
        technician: '이태식',
      },
      {
        id: 'm5',
        serviceType: '에어컨 필터 교체',
        date: '2025-04-05',
        mileage: 32000,
        technician: '김기술',
      },
    ],
  },
];

const getVehicleById = (id: string): Vehicle | undefined => {
  return DUMMY_VEHICLES.find(vehicle => vehicle.id === id);
};

const formatMileage = (mileage: number): string => {
  return `${mileage.toLocaleString()} km`;
};

const VehicleDetailScreen = () => {
  const route = useRoute<VehicleDetailScreenRouteProp>();
  const navigation = useNavigation<VehicleDetailScreenNavigationProp>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // 파라미터에서 차량 ID 가져오기
  const { vehicleId } = route.params;

  useEffect(() => {
    // API 연동 시 여기에서 데이터를 가져옵니다
    // 지금은 임시 데이터를 사용합니다
    setTimeout(() => {
      const foundVehicle = getVehicleById(vehicleId);
      if (foundVehicle) {
        setVehicle(foundVehicle);
      } else {
        // eslint-disable-next-line no-console
        console.error(`차량 ID ${vehicleId}에 해당하는 정보를 찾을 수 없습니다.`);
      }
      setLoading(false);
    }, 1000);
  }, [vehicleId]);

  const handleCreateMaintenance = () => {
    // 정비 기록 추가 화면으로 이동
    Alert.alert('정비 기록 추가', '이 기능은 아직 구현되지 않았습니다.');
  };

  const handleScheduleService = () => {
    // 정비 예약 화면으로 이동
    Alert.alert('정비 예약', '이 기능은 아직 구현되지 않았습니다.');
  };

  const handleEditVehicle = () => {
    // 차량 정보 수정 화면으로 이동
    Alert.alert('차량 정보 수정', '이 기능은 아직 구현되지 않았습니다.');
  };

  const handleCustomerDetails = () => {
    if (!vehicle) return;

    // 고객 상세 정보 화면으로 이동
    // 실제 구현에서는 고객 ID를 가져와 사용
    // 현재는 v1은 고객 ID 1, v2는 고객 ID 2 등으로 가정
    const customerId = vehicle.id === 'v1' ? '1' : '2';
    navigation.navigate('CustomerDetail', { customerId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>차량 정보 불러오는 중...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>차량 정보를 찾을 수 없습니다</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>이전 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>차량 상세 정보</Text>
        <TouchableOpacity onPress={handleEditVehicle}>
          <Icon name="pencil" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      {/* 차량 기본 정보 */}
      <View style={styles.vehicleInfoContainer}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
          <Text style={styles.vehicleModel}>
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </Text>
        </View>

        <View style={styles.mileageContainer}>
          <Icon name="speedometer" size={24} color="#3498db" />
          <Text style={styles.mileageText}>{formatMileage(vehicle.mileage)}</Text>
        </View>

        <View style={styles.nextServiceContainer}>
          {vehicle.nextServiceDue && (
            <View style={styles.serviceItem}>
              <Text style={styles.serviceLabel}>다음 정비 예정일:</Text>
              <Text style={styles.serviceValue}>{vehicle.nextServiceDue}</Text>
            </View>
          )}

          {vehicle.nextServiceMileage && (
            <View style={styles.serviceItem}>
              <Text style={styles.serviceLabel}>다음 정비 주행거리:</Text>
              <Text style={styles.serviceValue}>{formatMileage(vehicle.nextServiceMileage)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.scheduleButton} onPress={handleScheduleService}>
            <Icon name="calendar-plus" size={18} color="#fff" />
            <Text style={styles.scheduleButtonText}>정비 예약</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 차량 상세 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>차량 상세 정보</Text>
        <View style={styles.infoItem}>
          <Icon name="barcode" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>VIN:</Text>
          <Text style={styles.infoValue}>{vehicle.vin}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="palette" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>색상:</Text>
          <Text style={styles.infoValue}>{vehicle.color}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="engine" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>엔진:</Text>
          <Text style={styles.infoValue}>{vehicle.engineType}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="car-shift-pattern" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>변속기:</Text>
          <Text style={styles.infoValue}>{vehicle.transmission}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="gas-station" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>연료:</Text>
          <Text style={styles.infoValue}>{vehicle.fuelType}</Text>
        </View>
        {vehicle.purchaseDate && (
          <View style={styles.infoItem}>
            <Icon name="calendar" size={18} color="#7f8c8d" />
            <Text style={styles.infoLabel}>구매일:</Text>
            <Text style={styles.infoValue}>{vehicle.purchaseDate}</Text>
          </View>
        )}
        {vehicle.lastServiceDate && (
          <View style={styles.infoItem}>
            <Icon name="wrench" size={18} color="#7f8c8d" />
            <Text style={styles.infoLabel}>최근 정비:</Text>
            <Text style={styles.infoValue}>{vehicle.lastServiceDate}</Text>
          </View>
        )}
      </View>

      {/* 소유자 정보 */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>소유자 정보</Text>
          <TouchableOpacity style={styles.customerButton} onPress={handleCustomerDetails}>
            <Text style={styles.customerButtonText}>고객 상세 정보</Text>
            <Icon name="chevron-right" size={16} color="#3498db" />
          </TouchableOpacity>
        </View>
        <View style={styles.infoItem}>
          <Icon name="account" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>이름:</Text>
          <Text style={styles.infoValue}>{vehicle.ownerName}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>연락처:</Text>
          <Text style={styles.infoValue}>{vehicle.ownerPhone}</Text>
        </View>
        {vehicle.ownerEmail && (
          <View style={styles.infoItem}>
            <Icon name="email" size={18} color="#7f8c8d" />
            <Text style={styles.infoLabel}>이메일:</Text>
            <Text style={styles.infoValue}>{vehicle.ownerEmail}</Text>
          </View>
        )}
      </View>

      {/* 정비 이력 */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>정비 이력</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateMaintenance}>
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>기록 추가</Text>
          </TouchableOpacity>
        </View>

        {vehicle.maintenanceHistory.length > 0 ? (
          vehicle.maintenanceHistory.map(maintenance => (
            <View key={maintenance.id} style={styles.maintenanceItem}>
              <View style={styles.maintenanceHeader}>
                <Text style={styles.maintenanceDate}>{maintenance.date}</Text>
                <Text style={styles.maintenanceMileage}>{formatMileage(maintenance.mileage)}</Text>
              </View>
              <Text style={styles.maintenanceType}>{maintenance.serviceType}</Text>
              <Text style={styles.maintenanceTechnician}>담당: {maintenance.technician}</Text>
              {maintenance.notes && (
                <Text style={styles.maintenanceNotes}>{maintenance.notes}</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>정비 이력이 없습니다</Text>
        )}
      </View>

      {/* 메모 */}
      {vehicle.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{vehicle.notes}</Text>
          </View>
        </View>
      )}
    </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  vehicleInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  vehicleHeader: {
    marginBottom: 12,
  },
  licensePlate: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  vehicleModel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  mileageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mileageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginLeft: 8,
  },
  nextServiceContainer: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    width: 120,
  },
  serviceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  scheduleButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
    width: 70,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  customerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerButtonText: {
    color: '#3498db',
    fontSize: 14,
    marginRight: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  maintenanceItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  maintenanceDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  maintenanceMileage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  maintenanceType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  maintenanceTechnician: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  maintenanceNotes: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  notesContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default VehicleDetailScreen;
