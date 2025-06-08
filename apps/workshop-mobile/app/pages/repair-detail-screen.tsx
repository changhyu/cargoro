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
type RepairStatus = 'waiting' | 'in-progress' | 'completed' | 'scheduled';

interface Part {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Labor {
  hours: number;
  rate: number;
}

interface Repair {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehicleYear: string;
  licensePlate: string;
  vin: string;
  status: RepairStatus;
  service: string;
  description: string;
  technician: string;
  date: string;
  startTime: string;
  estimatedCompletion: string;
  parts: Part[];
  labor: Labor;
  notes: string;
}

type RepairDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type RepairDetailScreenRouteProp = RouteProp<RootStackParamList, 'RepairDetail'>;

// 임시 데이터 (API 연동 전까지 사용)
const DUMMY_REPAIRS: Repair[] = [
  {
    id: '1',
    customerName: '김민수',
    customerPhone: '010-1234-5678',
    vehicleModel: '현대 아반떼',
    vehicleYear: '2022',
    licensePlate: '12가 3456',
    vin: 'KMHXX00XXXX000001',
    status: 'in-progress',
    service: '엔진 오일 교체',
    description: '엔진 오일 및 필터 교체, 브레이크 패드 점검, 타이어 공기압 점검',
    technician: '이태식',
    date: '2025-05-21',
    startTime: '13:00',
    estimatedCompletion: '2025-05-21 14:30',
    parts: [
      { id: 'p1', name: '엔진 오일', quantity: 4, unitPrice: 25000 },
      { id: 'p2', name: '오일 필터', quantity: 1, unitPrice: 15000 },
    ],
    labor: { hours: 1, rate: 50000 },
    notes: '고객이 매연이 심하다고 언급, 배기 시스템 추가 점검 필요',
  },
  {
    id: '2',
    customerName: '이지영',
    customerPhone: '010-2345-6789',
    vehicleModel: '기아 K5',
    vehicleYear: '2021',
    licensePlate: '34나 5678',
    vin: 'KNXXX00XXXX000002',
    status: 'waiting',
    service: '타이어 교체',
    description: '4개 타이어 교체 및 휠 밸런스 조정',
    technician: '미배정',
    date: '2025-05-21',
    startTime: '15:00',
    estimatedCompletion: '2025-05-21 16:00',
    parts: [{ id: 'p3', name: '타이어 (215/55R17)', quantity: 4, unitPrice: 150000 }],
    labor: { hours: 1, rate: 50000 },
    notes: '고객 요청으로 미쉐린 타이어로 교체',
  },
];

const getRepairById = (id: string): Repair | undefined => {
  return DUMMY_REPAIRS.find(repair => repair.id === id);
};

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

const formatCurrency = (amount: number): string => {
  return `₩${amount.toLocaleString()}`;
};

const RepairDetailScreen = () => {
  const route = useRoute<RepairDetailScreenRouteProp>();
  const navigation = useNavigation<RepairDetailScreenNavigationProp>();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);

  // 파라미터에서 수리 ID 가져오기
  const { repairId } = route.params;

  useEffect(() => {
    // API 연동 시 여기에서 데이터를 가져옵니다
    // 지금은 임시 데이터를 사용합니다
    setTimeout(() => {
      const foundRepair = getRepairById(repairId);
      if (foundRepair) {
        setRepair(foundRepair);
      } else {
        // eslint-disable-next-line no-console
        console.error(`정비 ID ${repairId}에 해당하는 정보를 찾을 수 없습니다.`);
      }
      setLoading(false);
    }, 1000);
  }, [repairId]);

  const handleStatusChange = (newStatus: RepairStatus) => {
    if (!repair) return;

    Alert.alert('상태 변경', `정비 상태를 "${getStatusText(newStatus)}"(으)로 변경하시겠습니까?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: () => {
          // 실제 구현에서는 API 호출로 상태 업데이트
          setRepair({
            ...repair,
            status: newStatus,
          });
        },
      },
    ]);
  };

  const handleAssignTechnician = () => {
    // 정비사 배정 모달 또는 화면 열기
    Alert.alert('정비사 배정', '이 기능은 아직 구현되지 않았습니다.');
  };

  const handleAddParts = () => {
    // 부품 추가 모달 또는 화면 열기
    Alert.alert('부품 추가', '이 기능은 아직 구현되지 않았습니다.');
  };

  const calculateTotal = () => {
    if (!repair) return 0;

    const partsTotal = repair.parts.reduce((sum, part) => {
      return sum + part.quantity * part.unitPrice;
    }, 0);

    const laborTotal = repair.labor.hours * repair.labor.rate;

    return partsTotal + laborTotal;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>정비 정보 불러오는 중...</Text>
      </View>
    );
  }

  if (!repair) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>정비 정보를 찾을 수 없습니다</Text>
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
        <Text style={styles.title}>정비 상세 정보</Text>
        <TouchableOpacity>
          <Icon name="dots-vertical" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      {/* 상태 표시 */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(repair.status) }]}>
          <Text style={styles.statusText}>{getStatusText(repair.status)}</Text>
        </View>

        {/* 상태 변경 버튼 */}
        <View style={styles.statusActions}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: getStatusColor('waiting') }]}
            onPress={() => handleStatusChange('waiting')}
          >
            <Text style={styles.statusButtonText}>대기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: getStatusColor('in-progress') }]}
            onPress={() => handleStatusChange('in-progress')}
          >
            <Text style={styles.statusButtonText}>진행</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: getStatusColor('completed') }]}
            onPress={() => handleStatusChange('completed')}
          >
            <Text style={styles.statusButtonText}>완료</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 고객 및 차량 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>고객 및 차량 정보</Text>
        <View style={styles.infoItem}>
          <Icon name="account" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>고객명:</Text>
          <Text style={styles.infoValue}>{repair.customerName}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>연락처:</Text>
          <Text style={styles.infoValue}>{repair.customerPhone}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="car" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>차량:</Text>
          <Text style={styles.infoValue}>
            {repair.vehicleYear} {repair.vehicleModel}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="tag" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>번호판:</Text>
          <Text style={styles.infoValue}>{repair.licensePlate}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="pound" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>VIN:</Text>
          <Text style={styles.infoValue}>{repair.vin}</Text>
        </View>
      </View>

      {/* 정비 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>정비 정보</Text>
        <View style={styles.infoItem}>
          <Icon name="calendar" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>날짜:</Text>
          <Text style={styles.infoValue}>
            {repair.date} {repair.startTime}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="clock-outline" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>예상 완료:</Text>
          <Text style={styles.infoValue}>{repair.estimatedCompletion}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="account-wrench" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>정비사:</Text>
          <Text style={styles.infoValue}>{repair.technician}</Text>
          <TouchableOpacity style={styles.assignButton} onPress={handleAssignTechnician}>
            <Text style={styles.assignButtonText}>배정</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>정비 내용:</Text>
          <Text style={styles.descriptionText}>{repair.description}</Text>
        </View>

        {repair.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>참고 사항:</Text>
            <Text style={styles.notesText}>{repair.notes}</Text>
          </View>
        )}
      </View>

      {/* 부품 및 비용 */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>부품 및 비용</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddParts}>
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>부품 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 부품 목록 */}
        {repair.parts.map(part => (
          <View key={part.id} style={styles.partItem}>
            <View style={styles.partInfo}>
              <Text style={styles.partName}>{part.name}</Text>
              <Text style={styles.partQuantity}>수량: {part.quantity}</Text>
            </View>
            <Text style={styles.partPrice}>
              {formatCurrency(part.unitPrice)} x {part.quantity}
            </Text>
          </View>
        ))}

        {/* 공임 */}
        <View style={styles.laborItem}>
          <View style={styles.partInfo}>
            <Text style={styles.partName}>공임</Text>
            <Text style={styles.partQuantity}>{repair.labor.hours}시간</Text>
          </View>
          <Text style={styles.partPrice}>
            {formatCurrency(repair.labor.rate * repair.labor.hours)}
          </Text>
        </View>

        {/* 총계 */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>총계:</Text>
          <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
        </View>
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => {
            if (repair.status === 'completed') {
              Alert.alert('결제 처리', '결제 처리 화면으로 이동합니다.');
            } else {
              handleStatusChange('completed');
            }
          }}
        >
          <Text style={styles.actionButtonText}>
            {repair.status === 'completed' ? '결제 처리' : '정비 완료'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => Alert.alert('고객 연락', '고객에게 연락하시겠습니까?')}
        >
          <Text style={styles.secondaryButtonText}>고객 연락</Text>
        </TouchableOpacity>
      </View>
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
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusActions: {
    flexDirection: 'row',
  },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  infoLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  notesContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff9db',
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  partItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    fontSize: 14,
    color: '#2c3e50',
  },
  partQuantity: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  partPrice: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  laborItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
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
  assignButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
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

export default RepairDetailScreen;
