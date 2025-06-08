import React, { useEffect, useState } from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../navigation';

// 타입 정의
interface Vehicle {
  id: string;
  model: string;
  year: string;
  licensePlate: string;
  vin: string;
  lastService: string;
  nextServiceDue: string;
}

interface Repair {
  id: string;
  date: string;
  service: string;
  amount: number;
  vehiclePlate: string;
  status: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  vehiclePlate: string;
}

type LoyaltyLevel = 'gold' | 'silver' | 'bronze' | 'platinum';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  vehicles: Vehicle[];
  repairs: Repair[];
  appointmentUpcoming: Appointment | null;
  joinDate: string;
  lastVisit: string;
  visitCount: number;
  totalSpent: number;
  loyalty: LoyaltyLevel;
  notes: string;
}

type CustomerDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type CustomerDetailScreenRouteProp = RouteProp<RootStackParamList, 'CustomerDetail'>;

// 임시 데이터 (API 연동 전까지 사용)
const DUMMY_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: '김민수',
    phone: '010-1234-5678',
    email: 'kim.minsoo@example.com',
    address: '서울시 강남구 테헤란로 123',
    vehicles: [
      {
        id: 'v1',
        model: '현대 아반떼',
        year: '2022',
        licensePlate: '12가 3456',
        vin: 'KMHXX00XXXX000001',
        lastService: '2025-05-15',
        nextServiceDue: '2025-08-15',
      },
    ],
    repairs: [
      {
        id: 'r1',
        date: '2025-05-15',
        service: '엔진 오일 교체',
        amount: 65000,
        vehiclePlate: '12가 3456',
        status: 'completed',
      },
      {
        id: 'r2',
        date: '2025-03-20',
        service: '타이어 교체 (앞)',
        amount: 280000,
        vehiclePlate: '12가 3456',
        status: 'completed',
      },
    ],
    appointmentUpcoming: {
      id: 'a1',
      date: '2025-08-15',
      time: '14:00',
      service: '정기 점검',
      vehiclePlate: '12가 3456',
    },
    joinDate: '2023-10-05',
    lastVisit: '2025-05-15',
    visitCount: 8,
    totalSpent: 980000,
    loyalty: 'gold',
    notes: '항상 친절하고 정비 품질에 신경쓰는 고객',
  },
  {
    id: '2',
    name: '이지영',
    phone: '010-2345-6789',
    email: 'lee.jiyoung@example.com',
    address: '서울시 서초구 반포대로 45',
    vehicles: [
      {
        id: 'v2',
        model: '기아 K5',
        year: '2021',
        licensePlate: '34나 5678',
        vin: 'KNXXX00XXXX000002',
        lastService: '2025-05-18',
        nextServiceDue: '2025-08-18',
      },
    ],
    repairs: [
      {
        id: 'r3',
        date: '2025-05-18',
        service: '브레이크 패드 교체',
        amount: 150000,
        vehiclePlate: '34나 5678',
        status: 'completed',
      },
    ],
    appointmentUpcoming: null,
    joinDate: '2024-11-10',
    lastVisit: '2025-05-18',
    visitCount: 3,
    totalSpent: 350000,
    loyalty: 'silver',
    notes: '',
  },
];

const getCustomerById = (id: string): Customer | undefined => {
  return DUMMY_CUSTOMERS.find(customer => customer.id === id);
};

const getLoyaltyColor = (loyalty: LoyaltyLevel): string => {
  switch (loyalty) {
    case 'gold':
      return '#f39c12';
    case 'silver':
      return '#7f8c8d';
    case 'bronze':
      return '#d35400';
    case 'platinum':
      return '#3498db';
    default:
      return '#95a5a6';
  }
};

const formatCurrency = (amount: number): string => {
  return `₩${amount.toLocaleString()}`;
};

const CustomerDetailScreen = () => {
  const route = useRoute<CustomerDetailScreenRouteProp>();
  const navigation = useNavigation<CustomerDetailScreenNavigationProp>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // 파라미터에서 고객 ID 가져오기
  const { customerId } = route.params;

  useEffect(() => {
    // API 연동 시 여기에서 데이터를 가져옵니다
    // 지금은 임시 데이터를 사용합니다
    setTimeout(() => {
      const foundCustomer = getCustomerById(customerId);
      if (foundCustomer) {
        setCustomer(foundCustomer as Customer);
      } else {
        // eslint-disable-next-line no-console
        console.error(`고객 ID ${customerId}에 해당하는 정보를 찾을 수 없습니다.`);
      }
      setLoading(false);
    }, 1000);
  }, [customerId]);

  const handleAddVehicle = () => {
    // 차량 추가 화면으로 이동
    Alert.alert('차량 추가', '이 기능은 아직 구현되지 않았습니다.');
  };

  const handleCreateAppointment = () => {
    // 예약 생성 화면으로 이동
    Alert.alert('예약 생성', '이 기능은 아직 구현되지 않았습니다.');
  };

  const handleCall = () => {
    if (!customer) return;

    Alert.alert('전화 걸기', `${customer.name}님에게 전화를 거시겠습니까? (${customer.phone})`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '전화 걸기',
        onPress: () => {
          const phoneNumber = customer.phone.replace(/-/g, '');
          Linking.openURL(`tel:${phoneNumber}`);
        },
      },
    ]);
  };

  const handleSendSMS = () => {
    if (!customer) return;

    Alert.alert(
      '문자 보내기',
      `${customer.name}님에게 문자를 보내시겠습니까? (${customer.phone})`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '문자 보내기',
          onPress: () => {
            const phoneNumber = customer.phone.replace(/-/g, '');
            Linking.openURL(`sms:${phoneNumber}`);
          },
        },
      ]
    );
  };

  const handleSendEmail = () => {
    if (!customer) return;

    Alert.alert(
      '이메일 보내기',
      `${customer.name}님에게 이메일을 보내시겠습니까? (${customer.email})`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '이메일 보내기',
          onPress: () => {
            Linking.openURL(`mailto:${customer.email}`);
          },
        },
      ]
    );
  };

  const handleEditCustomer = () => {
    // 고객 정보 수정 화면으로 이동
    Alert.alert('고객 정보 수정', '이 기능은 아직 구현되지 않았습니다.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>고객 정보 불러오는 중...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>고객 정보를 찾을 수 없습니다</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>목록으로 돌아가기</Text>
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
        <Text style={styles.title}>고객 상세 정보</Text>
        <TouchableOpacity onPress={handleEditCustomer}>
          <Icon name="pencil" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      {/* 고객 기본 정보 */}
      <View style={styles.customerProfileContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.customerName}>{customer.name}</Text>
          {customer.loyalty && (
            <View
              style={[styles.loyaltyBadge, { backgroundColor: getLoyaltyColor(customer.loyalty) }]}
            >
              <Text style={styles.loyaltyText}>{customer.loyalty.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.visitCount}</Text>
            <Text style={styles.statLabel}>방문</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.vehicles.length}</Text>
            <Text style={styles.statLabel}>차량</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(customer.totalSpent)}</Text>
            <Text style={styles.statLabel}>총 지출</Text>
          </View>
        </View>

        <View style={styles.contactButtonsContainer}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <Icon name="phone" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleSendSMS}>
            <Icon name="message-text" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleSendEmail}>
            <Icon name="email" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleCreateAppointment}>
            <Icon name="calendar-plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 고객 상세 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>연락처 정보</Text>
        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>전화번호:</Text>
          <Text style={styles.infoValue}>{customer.phone}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="email" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>이메일:</Text>
          <Text style={styles.infoValue}>{customer.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="map-marker" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>주소:</Text>
          <Text style={styles.infoValue}>{customer.address}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="calendar" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>가입일:</Text>
          <Text style={styles.infoValue}>{customer.joinDate}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="calendar-check" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>최근 방문:</Text>
          <Text style={styles.infoValue}>{customer.lastVisit}</Text>
        </View>
      </View>

      {/* 예약 정보 */}
      {customer.appointmentUpcoming && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>다가오는 예약</Text>
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Icon name="calendar-clock" size={24} color="#3498db" />
              <View style={styles.appointmentDateContainer}>
                <Text style={styles.appointmentDate}>{customer.appointmentUpcoming.date}</Text>
                <Text style={styles.appointmentTime}>{customer.appointmentUpcoming.time}</Text>
              </View>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.appointmentService}>{customer.appointmentUpcoming.service}</Text>
              <Text style={styles.appointmentVehicle}>
                차량: {customer.appointmentUpcoming.vehiclePlate}
              </Text>
            </View>
            <View style={styles.appointmentActions}>
              <TouchableOpacity style={styles.appointmentButton}>
                <Icon name="pencil" size={16} color="#3498db" />
                <Text style={styles.appointmentButtonText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.appointmentButton}>
                <Icon name="phone" size={16} color="#3498db" />
                <Text style={styles.appointmentButtonText}>연락</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 차량 정보 */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>차량 정보</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>차량 추가</Text>
          </TouchableOpacity>
        </View>

        {customer.vehicles.map((vehicle: Vehicle) => (
          <View key={vehicle.id} style={styles.vehicleItem}>
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleModel}>
                  {vehicle.model} ({vehicle.year})
                </Text>
                <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
              </View>
              <TouchableOpacity
                style={styles.vehicleDetailButton}
                onPress={() => navigation.navigate('VehicleDetail', { vehicleId: vehicle.id })}
              >
                <Text style={styles.vehicleDetailButtonText}>상세 정보</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.serviceInfo}>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceLabel}>최근 정비:</Text>
                <Text style={styles.serviceValue}>{vehicle.lastService}</Text>
              </View>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceLabel}>다음 정비 예정:</Text>
                <Text style={styles.serviceValue}>{vehicle.nextServiceDue}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 정비 이력 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>정비 이력</Text>

        {customer.repairs.length > 0 ? (
          customer.repairs.map((repair: Repair) => (
            <TouchableOpacity
              key={repair.id}
              style={styles.repairItem}
              onPress={() => navigation.navigate('RepairDetail', { repairId: repair.id })}
            >
              <View style={styles.repairHeader}>
                <Text style={styles.repairDate}>{repair.date}</Text>
                <Text style={styles.repairAmount}>{formatCurrency(repair.amount)}</Text>
              </View>
              <Text style={styles.repairService}>{repair.service}</Text>
              <Text style={styles.repairVehicle}>차량: {repair.vehiclePlate}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>정비 이력이 없습니다</Text>
          </View>
        )}

        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllButtonText}>모든 정비 이력 보기</Text>
          <Icon name="chevron-right" size={16} color="#3498db" />
        </TouchableOpacity>
      </View>

      {/* 메모 */}
      {customer.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{customer.notes}</Text>
          </View>
          <TouchableOpacity style={styles.editNotesButton}>
            <Icon name="pencil" size={16} color="#3498db" />
            <Text style={styles.editNotesText}>메모 수정</Text>
          </TouchableOpacity>
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
  customerProfileContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  loyaltyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  loyaltyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactButton: {
    backgroundColor: '#3498db',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 4,
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
    marginBottom: 12,
  },
  infoLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
    width: 70,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
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
  vehicleItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  licensePlate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  serviceInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
    width: 70,
  },
  serviceValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  vehicleDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  vehicleDetailButtonText: {
    marginLeft: 4,
    color: '#3498db',
    fontSize: 14,
  },
  appointmentCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDateContainer: {
    marginLeft: 12,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  appointmentDetails: {
    marginBottom: 12,
  },
  appointmentService: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  appointmentVehicle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  appointmentActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  appointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  appointmentButtonText: {
    marginLeft: 4,
    color: '#3498db',
    fontSize: 14,
  },
  repairItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  repairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  repairDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  repairAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  repairService: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  repairVehicle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyListContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  viewAllButtonText: {
    color: '#3498db',
    fontSize: 14,
    marginRight: 4,
  },
  notesContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  editNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editNotesText: {
    marginLeft: 4,
    color: '#3498db',
    fontSize: 14,
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

export default CustomerDetailScreen;
