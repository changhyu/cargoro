import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { apiService } from '../../services/api-service';
import { Delivery } from './delivery-list-screen';

// 상태별 색상 및 아이콘 (delivery-list-screen.tsx에서 가져온 동일한 설정)
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

// 우선순위별 색상 및 라벨
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

// 상세 배송 정보 인터페이스 (기본 배송 정보 확장)
interface DeliveryDetail extends Delivery {
  actual_pickup_time?: string;
  actual_delivery_time?: string;
  driver_id?: string;
  completed_by?: string;
  customer_signature?: string;
  issues?: string[];
  notes?: string;
  vehicle_id: string;
  vehicle_info?: {
    make: string;
    model: string;
    licensePlate: string;
    year: number;
    color: string;
  };
}

// 경로 파라미터 타입
type DeliveryDetailRouteParams = {
  DeliveryDetail: {
    deliveryId: string;
  };
};

const DeliveryDetailScreen: React.FC = () => {
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);

  const navigation = useNavigation();
  const route = useRoute<RouteProp<DeliveryDetailRouteParams, 'DeliveryDetail'>>();
  const { deliveryId } = route.params;

  // 배송 정보 조회 함수
  const fetchDeliveryDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDelivery(deliveryId);
      setDelivery(data);
    } catch (err) {
      console.error('배송 상세 정보 조회 오류:', err);
      setError('배송 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryDetail();
  }, [deliveryId]);

  // 전화 연결 함수
  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) {
      Alert.alert('오류', '연락처 정보가 없습니다.');
      return;
    }

    const phoneUrl = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        }
        Alert.alert('오류', '전화 앱을 열 수 없습니다.');
      })
      .catch(() => {
        Alert.alert('오류', '전화 연결에 실패했습니다.');
      });
  };

  // 지도 앱 열기
  const handleOpenMap = (location: string) => {
    if (!location) {
      Alert.alert('오류', '위치 정보가 없습니다.');
      return;
    }

    const mapUrl =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${encodeURIComponent(location)}`
        : `geo:0,0?q=${encodeURIComponent(location)}`;

    Linking.canOpenURL(mapUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(mapUrl);
        }
        // 기본 맵 앱을 열 수 없는 경우 구글 맵 웹 URL로 시도
        const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
        return Linking.openURL(googleMapsUrl);
      })
      .catch(() => {
        Alert.alert('오류', '지도 앱을 열 수 없습니다.');
      });
  };

  // 상태 업데이트 함수
  const handleUpdateStatus = async (newStatus: string) => {
    if (!delivery) return;

    // 상태 변경이 논리적으로 가능한지 확인
    const currentStatus = delivery.status;
    if (
      (currentStatus === 'completed' ||
        currentStatus === 'cancelled' ||
        currentStatus === 'failed') &&
      newStatus !== 'assigned'
    ) {
      Alert.alert('상태 변경 불가', '이미 완료, 실패 또는 취소된 배송입니다.');
      return;
    }

    // 상태별 메시지
    const statusMessages = {
      assigned: '배송을 시작하시겠습니까?',
      in_transit: '배송 중으로 상태를 변경하시겠습니까?',
      completed: '배송을 완료하시겠습니까?',
      failed: '배송 실패로 처리하시겠습니까?',
      cancelled: '배송을 취소하시겠습니까?',
    };

    // 사용자 확인
    Alert.alert('상태 변경', statusMessages[newStatus as keyof typeof statusMessages], [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          try {
            setUpdating(true);
            if (newStatus === 'completed') {
              // 완료 처리는 별도 API
              await apiService.completeDelivery(deliveryId, { completedBy: 'driver_app' });
            } else if (newStatus === 'cancelled') {
              // 취소 처리는 별도 API
              await apiService.cancelDelivery(deliveryId, '기사에 의한 취소');
            } else {
              // 일반 상태 업데이트
              await apiService.updateDeliveryStatus(deliveryId, newStatus);
            }

            // 데이터 새로고침
            await fetchDeliveryDetail();
            Alert.alert('완료', '배송 상태가 업데이트되었습니다.');
          } catch (err) {
            console.error('상태 업데이트 오류:', err);
            Alert.alert('오류', '상태 업데이트에 실패했습니다.');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>배송 정보 불러오는 중...</Text>
      </View>
    );
  }

  // 오류 발생시 표시
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Feather name="alert-circle" size={40} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeliveryDetail}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 데이터가 없을 때 표시
  if (!delivery) {
    return (
      <View style={styles.centeredContainer}>
        <Feather name="package" size={40} color="#9CA3AF" />
        <Text style={styles.emptyText}>배송 정보를 찾을 수 없습니다</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>목록으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.pending;
  const priorityConfig = PRIORITY_CONFIG[delivery.priority] || PRIORITY_CONFIG.normal;
  const typeLabel = DELIVERY_TYPE_LABELS[delivery.delivery_type] || '배송';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 헤더 섹션 */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Feather name={statusConfig.icon} size={16} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
        <Text style={styles.deliveryType}>{typeLabel}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '20' }]}>
          <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
            {priorityConfig.label}
          </Text>
        </View>
      </View>

      {/* 위치 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>위치 정보</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Feather name="map-pin" size={18} color="#2563EB" />
            <Text style={styles.locationTitle}>출발지</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => handleOpenMap(delivery.origin_location)}
            >
              <Feather name="map" size={14} color="#2563EB" />
              <Text style={styles.mapButtonText}>지도보기</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.locationAddress}>{delivery.origin_location}</Text>
        </View>

        <View style={styles.divider}></View>

        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Feather name="flag" size={18} color="#2563EB" />
            <Text style={styles.locationTitle}>도착지</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => handleOpenMap(delivery.destination_location)}
            >
              <Feather name="map" size={14} color="#2563EB" />
              <Text style={styles.mapButtonText}>지도보기</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.locationAddress}>{delivery.destination_location}</Text>
        </View>
      </View>

      {/* 일정 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>일정 정보</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>예정일</Text>
          <Text style={styles.infoValue}>
            {new Date(delivery.scheduled_date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {delivery.actual_pickup_time && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>실제 픽업</Text>
            <Text style={styles.infoValue}>
              {new Date(delivery.actual_pickup_time).toLocaleString('ko-KR')}
            </Text>
          </View>
        )}

        {delivery.actual_delivery_time && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>실제 배송</Text>
            <Text style={styles.infoValue}>
              {new Date(delivery.actual_delivery_time).toLocaleString('ko-KR')}
            </Text>
          </View>
        )}
      </View>

      {/* 차량 정보 섹션 */}
      {delivery.vehicle_info && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>차량 정보</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>차량</Text>
              <Text style={styles.infoValue}>
                {delivery.vehicle_info.make} {delivery.vehicle_info.model} (
                {delivery.vehicle_info.year})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>번호판</Text>
              <Text style={styles.infoValue}>{delivery.vehicle_info.licensePlate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>색상</Text>
              <Text style={styles.infoValue}>{delivery.vehicle_info.color}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 연락처 정보 섹션 */}
      {(delivery.contact_person || delivery.contact_phone) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>연락처 정보</Text>
          {delivery.contact_person && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>담당자</Text>
              <Text style={styles.infoValue}>{delivery.contact_person}</Text>
            </View>
          )}
          {delivery.contact_phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>전화번호</Text>
              <TouchableOpacity onPress={() => handleCall(delivery.contact_phone || '')}>
                <Text style={styles.phoneValue}>{delivery.contact_phone}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* 추가 정보 섹션 */}
      {delivery.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <Text style={styles.notesText}>{delivery.notes}</Text>
        </View>
      )}

      {/* 이슈 정보 섹션 */}
      {delivery.issues && delivery.issues.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이슈 정보</Text>
          {delivery.issues.map((issue, index) => (
            <View key={index} style={styles.issueItem}>
              <Feather name="alert-triangle" size={16} color="#FFA500" />
              <Text style={styles.issueText}>{issue}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 액션 버튼 섹션 */}
      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>작업</Text>
        <View style={styles.actionButtons}>
          {delivery.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#3498DB' }]}
              onPress={() => handleUpdateStatus('assigned')}
              disabled={updating}
            >
              <Feather name="check-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>배송 시작</Text>
            </TouchableOpacity>
          )}

          {delivery.status === 'assigned' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#27AE60' }]}
              onPress={() => handleUpdateStatus('in_transit')}
              disabled={updating}
            >
              <Feather name="truck" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>배송 중으로 변경</Text>
            </TouchableOpacity>
          )}

          {delivery.status === 'in_transit' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2ECC71' }]}
              onPress={() => handleUpdateStatus('completed')}
              disabled={updating}
            >
              <Feather name="check" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>배송 완료</Text>
            </TouchableOpacity>
          )}

          {(delivery.status === 'assigned' || delivery.status === 'in_transit') && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#E74C3C' }]}
                onPress={() => handleUpdateStatus('failed')}
                disabled={updating}
              >
                <Feather name="x-circle" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>배송 실패</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#95A5A6' }]}
                onPress={() => handleUpdateStatus('cancelled')}
                disabled={updating}
              >
                <Feather name="slash" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>배송 취소</Text>
              </TouchableOpacity>
            </>
          )}

          {(delivery.status === 'completed' ||
            delivery.status === 'failed' ||
            delivery.status === 'cancelled') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#3498DB' }]}
              onPress={() => handleUpdateStatus('assigned')}
              disabled={updating}
            >
              <Feather name="refresh-cw" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>배송 재시작</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  deliveryType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  locationCard: {
    marginBottom: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 6,
    flex: 1,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#EBF5FF',
  },
  mapButtonText: {
    fontSize: 12,
    color: '#2563EB',
    marginLeft: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 24,
  },
  divider: {
    height: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    marginLeft: 9,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  phoneValue: {
    fontSize: 14,
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  vehicleCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  issueText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  actionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
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
  backButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6B7280',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default DeliveryDetailScreen;
