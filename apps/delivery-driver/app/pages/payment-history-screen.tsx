import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 결제 내역 타입 정의
interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  deliveryId: string;
  deliveryAddress: string;
  paymentMethod: string;
  memo?: string;
}

// 결제 상태별 설정
const STATUS_CONFIG = {
  paid: { color: '#2ecc71', label: '완료', icon: 'check-circle' },
  pending: { color: '#f39c12', label: '대기중', icon: 'clock-outline' },
  failed: { color: '#e74c3c', label: '실패', icon: 'alert-circle' },
};

// 결제 방법별 설정
const PAYMENT_METHOD_CONFIG: Record<string, { label: string; icon: string }> = {
  card: { label: '카드', icon: 'credit-card' },
  bank: { label: '계좌이체', icon: 'bank' },
  cash: { label: '현금', icon: 'cash' },
  point: { label: '포인트', icon: 'wallet' },
};

// 임시 결제 데이터
const DUMMY_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    date: '2025-05-15T14:30:00',
    amount: 35000,
    status: 'paid',
    deliveryId: 'd1',
    deliveryAddress: '서울시 강남구 테헤란로 152',
    paymentMethod: 'card',
  },
  {
    id: 'p2',
    date: '2025-05-10T09:15:00',
    amount: 28000,
    status: 'paid',
    deliveryId: 'd2',
    deliveryAddress: '서울시 서초구 서초대로 389',
    paymentMethod: 'bank',
  },
  {
    id: 'p3',
    date: '2025-05-05T16:45:00',
    amount: 42000,
    status: 'paid',
    deliveryId: 'd3',
    deliveryAddress: '서울시 송파구 올림픽로 300',
    paymentMethod: 'card',
  },
  {
    id: 'p4',
    date: '2025-04-28T11:20:00',
    amount: 31500,
    status: 'paid',
    deliveryId: 'd4',
    deliveryAddress: '서울시 마포구 와우산로 94',
    paymentMethod: 'cash',
  },
  {
    id: 'p5',
    date: '2025-04-20T13:10:00',
    amount: 45000,
    status: 'pending',
    deliveryId: 'd5',
    deliveryAddress: '서울시 용산구 한남대로 42',
    paymentMethod: 'bank',
    memo: '정산 예정일: 2025년 4월 25일',
  },
];

const PaymentHistoryScreen = () => {
  const navigation = useNavigation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);

  // 결제 내역 로드 함수
  const loadPayments = async () => {
    try {
      setIsLoading(true);
      // 실제 구현시 API 호출로 대체
      // const response = await api-client.get('/payments/history');
      // const paymentData = response.data;

      // 임시 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 1000));
      const paymentData = DUMMY_PAYMENTS;

      // 결제 내역 시간 순 정렬 (최신순)
      const sortedPayments = [...paymentData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setPayments(sortedPayments);

      // 통계 계산
      const total = sortedPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const pending = sortedPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, payment) => sum + payment.amount, 0);

      setTotalEarnings(total);
      setPendingEarnings(pending);
    } catch (error) {
      console.error('결제 내역 불러오기 오류:', error);
      Alert.alert('오류', '결제 내역을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 필터링된 결제 내역
  const filteredPayments = payments.filter(
    payment => filter === 'all' || payment.status === filter
  );

  // 화면 로드 시 데이터 불러오기
  useEffect(() => {
    loadPayments();
  }, []);

  // 새로고침 핸들러
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPayments();
  };

  // 결제 상태 필터 변경
  const handleFilterChange = (newFilter: 'all' | 'paid' | 'pending' | 'failed') => {
    setFilter(newFilter);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 시간 포맷팅 함수
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 금액 포맷팅 함수
  const formatAmount = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 필터 버튼 컴포넌트
  const FilterButton = ({
    title,
    value,
    count,
  }: {
    title: string;
    value: 'all' | 'paid' | 'pending' | 'failed';
    count?: number;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => handleFilterChange(value)}
    >
      <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>
        {title} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>정산 내역</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 요약 정보 */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>총 정산 금액</Text>
          <Text style={styles.summaryValue}>{formatAmount(totalEarnings)}원</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>정산 예정 금액</Text>
          <Text style={[styles.summaryValue, { color: '#f39c12' }]}>
            {formatAmount(pendingEarnings)}원
          </Text>
        </View>
      </View>

      {/* 필터 버튼 */}
      <View style={styles.filterContainer}>
        <FilterButton title="전체" value="all" count={payments.length} />
        <FilterButton
          title="완료"
          value="paid"
          count={payments.filter(p => p.status === 'paid').length}
        />
        <FilterButton
          title="대기중"
          value="pending"
          count={payments.filter(p => p.status === 'pending').length}
        />
        <FilterButton
          title="실패"
          value="failed"
          count={payments.filter(p => p.status === 'failed').length}
        />
      </View>

      {/* 결제 내역 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>정산 내역을 불러오는 중...</Text>
        </View>
      ) : filteredPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cash-multiple" size={60} color="#95a5a6" />
          <Text style={styles.emptyText}>정산 내역이 없습니다.</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>새로고침</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.paymentItem}>
              <View style={styles.paymentHeader}>
                <View style={styles.dateTimeContainer}>
                  <Text style={styles.paymentDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.paymentTime}>{formatTime(item.date)}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_CONFIG[item.status].color },
                  ]}
                >
                  <Icon
                    name={STATUS_CONFIG[item.status].icon}
                    size={12}
                    color="#fff"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.statusText}>{STATUS_CONFIG[item.status].label}</Text>
                </View>
              </View>

              <View style={styles.paymentContent}>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>정산 금액</Text>
                  <Text style={styles.amountValue}>{formatAmount(item.amount)}원</Text>
                </View>

                <View style={styles.paymentInfoContainer}>
                  <View style={styles.paymentInfoItem}>
                    <Icon name="map-marker" size={16} color="#7f8c8d" />
                    <Text style={styles.paymentInfoText} numberOfLines={1}>
                      {item.deliveryAddress}
                    </Text>
                  </View>

                  <View style={styles.paymentInfoItem}>
                    <Icon
                      name={PAYMENT_METHOD_CONFIG[item.paymentMethod]?.icon || 'cash'}
                      size={16}
                      color="#7f8c8d"
                    />
                    <Text style={styles.paymentInfoText}>
                      {PAYMENT_METHOD_CONFIG[item.paymentMethod]?.label || item.paymentMethod}
                    </Text>
                  </View>

                  <View style={styles.paymentInfoItem}>
                    <Icon name="truck-delivery" size={16} color="#7f8c8d" />
                    <Text style={styles.paymentInfoText}>배송 ID: {item.deliveryId}</Text>
                  </View>
                </View>

                {item.memo && (
                  <View style={styles.memoContainer}>
                    <Icon name="information" size={16} color="#3498db" />
                    <Text style={styles.memoText}>{item.memo}</Text>
                  </View>
                )}
              </View>
            </View>
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
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 4,
  },
  filterButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
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
    padding: 24,
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
    padding: 12,
  },
  paymentItem: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'column',
  },
  paymentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  paymentTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  paymentContent: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  amountLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  paymentInfoContainer: {
    marginBottom: 8,
  },
  paymentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  paymentInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#34495e',
  },
  memoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf7fd',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  memoText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#3498db',
  },
});

export default PaymentHistoryScreen;
