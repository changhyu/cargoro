import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import {
  IntegratedRootStackParamList,
  VehicleDiagnosticData,
  MaintenanceRecommendation,
} from '../../types/integrated-navigation';
import integratedNavigationService from '../../services/integrated-navigation-service';

type SmartDiagnosisScreenProps = StackNavigationProp<
  IntegratedRootStackParamList,
  'SmartDiagnosis'
>;
type SmartDiagnosisRouteProps = RouteProp<IntegratedRootStackParamList, 'SmartDiagnosis'>;

export default function SmartDiagnosisScreen() {
  const navigation = useNavigation<SmartDiagnosisScreenProps>();
  const route = useRoute<SmartDiagnosisRouteProps>();

  // 상태 관리
  const [diagnosticData, setDiagnosticData] = useState<VehicleDiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningDiagnosis, setIsRunningDiagnosis] = useState(false);

  const { vehicleId } = route.params;

  // 진단 데이터 로드
  useEffect(() => {
    loadDiagnosticData();
  }, [vehicleId]);

  const loadDiagnosticData = async () => {
    try {
      setIsLoading(true);
      const data = await integratedNavigationService.getVehicleDiagnostics(vehicleId);
      setDiagnosticData(data);
    } catch (error) {
      console.error('진단 데이터 로드 실패:', error);
      Alert.alert('오류', '진단 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 새로운 진단 실행
  const runNewDiagnosis = async () => {
    Alert.alert(
      '진단 시작',
      '차량 스마트 진단을 시작하시겠습니까?\n진단에는 약 2-3분이 소요됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '시작',
          onPress: async () => {
            setIsRunningDiagnosis(true);
            try {
              // 실제로는 OBD 디바이스와 통신하여 진단
              await new Promise(resolve => setTimeout(resolve, 3000));
              await loadDiagnosticData();
              Alert.alert('완료', '진단이 완료되었습니다.');
            } catch (error) {
              Alert.alert('오류', '진단 중 오류가 발생했습니다.');
            } finally {
              setIsRunningDiagnosis(false);
            }
          },
        },
      ]
    );
  };

  // 정비 예약하기
  const handleMaintenanceBooking = (recommendation: MaintenanceRecommendation) => {
    navigation.navigate('MaintenanceBooking', {
      serviceType: recommendation.type,
    });
  };

  // 상태에 따른 색상 결정
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return '양호';
      case 'warning':
        return '주의';
      case 'critical':
        return '위험';
      default:
        return '알 수 없음';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'high':
        return '#EF4444';
      case 'urgent':
        return '#7C3AED';
      default:
        return '#6B7280';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low':
        return '낮음';
      case 'medium':
        return '보통';
      case 'high':
        return '높음';
      case 'urgent':
        return '긴급';
      default:
        return '알 수 없음';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="analytics" size={48} color="#6366F1" />
          <Text style={styles.loadingText}>진단 데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!diagnosticData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>진단 데이터를 불러올 수 없습니다.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDiagnosticData}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>스마트 진단</Text>
          <TouchableOpacity onPress={runNewDiagnosis} disabled={isRunningDiagnosis}>
            <Ionicons name="refresh" size={24} color={isRunningDiagnosis ? '#9CA3AF' : '#6366F1'} />
          </TouchableOpacity>
        </View>

        {/* 진단 진행 중 표시 */}
        {isRunningDiagnosis && (
          <View style={styles.diagnosisProgress}>
            <Ionicons name="sync" size={20} color="#6366F1" />
            <Text style={styles.diagnosisProgressText}>진단 진행 중...</Text>
          </View>
        )}

        {/* 전체 상태 요약 */}
        <View style={styles.statusSummaryCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="car-sport" size={28} color="#6366F1" />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>전체 상태</Text>
              <Text style={styles.statusTimestamp}>
                마지막 진단: {new Date(diagnosticData.timestamp).toLocaleString('ko-KR')}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(diagnosticData.engineStatus) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {getStatusText(diagnosticData.engineStatus)}
              </Text>
            </View>
          </View>
        </View>

        {/* 주요 지표들 */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>주요 지표</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Ionicons name="battery-half" size={24} color="#6366F1" />
              <Text style={styles.metricLabel}>배터리</Text>
              <Text style={styles.metricValue}>{diagnosticData.batteryLevel}%</Text>
              <View
                style={[
                  styles.metricBar,
                  { backgroundColor: diagnosticData.batteryLevel > 50 ? '#10B981' : '#EF4444' },
                ]}
              />
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="speedometer" size={24} color="#6366F1" />
              <Text style={styles.metricLabel}>연료</Text>
              <Text style={styles.metricValue}>{diagnosticData.fuelLevel}%</Text>
              <View
                style={[
                  styles.metricBar,
                  { backgroundColor: diagnosticData.fuelLevel > 25 ? '#10B981' : '#EF4444' },
                ]}
              />
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="thermometer" size={24} color="#6366F1" />
              <Text style={styles.metricLabel}>냉각수 온도</Text>
              <Text style={styles.metricValue}>{diagnosticData.coolantTemperature}°C</Text>
              <View
                style={[
                  styles.metricBar,
                  {
                    backgroundColor:
                      diagnosticData.coolantTemperature < 100 ? '#10B981' : '#EF4444',
                  },
                ]}
              />
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="speedometer" size={24} color="#6366F1" />
              <Text style={styles.metricLabel}>오일 압력</Text>
              <Text style={styles.metricValue}>{diagnosticData.oilPressure} PSI</Text>
              <View
                style={[
                  styles.metricBar,
                  { backgroundColor: diagnosticData.oilPressure > 30 ? '#10B981' : '#EF4444' },
                ]}
              />
            </View>
          </View>
        </View>

        {/* 타이어 압력 */}
        <View style={styles.tireContainer}>
          <Text style={styles.sectionTitle}>타이어 압력</Text>
          <View style={styles.tireGrid}>
            <View style={styles.tireItem}>
              <Text style={styles.tireLabel}>앞 좌</Text>
              <Text style={styles.tireValue}>{diagnosticData.tirePressure.frontLeft} PSI</Text>
            </View>
            <View style={styles.tireItem}>
              <Text style={styles.tireLabel}>앞 우</Text>
              <Text style={styles.tireValue}>{diagnosticData.tirePressure.frontRight} PSI</Text>
            </View>
            <View style={styles.tireItem}>
              <Text style={styles.tireLabel}>뒤 좌</Text>
              <Text style={styles.tireValue}>{diagnosticData.tirePressure.rearLeft} PSI</Text>
            </View>
            <View style={styles.tireItem}>
              <Text style={styles.tireLabel}>뒤 우</Text>
              <Text style={styles.tireValue}>{diagnosticData.tirePressure.rearRight} PSI</Text>
            </View>
          </View>
        </View>

        {/* 진단 코드 */}
        {diagnosticData.diagnosticCodes.length > 0 && (
          <View style={styles.diagnosticCodesContainer}>
            <Text style={styles.sectionTitle}>진단 코드</Text>
            {diagnosticData.diagnosticCodes.map((code, index) => (
              <View key={index} style={styles.diagnosticCodeItem}>
                <Ionicons name="warning" size={16} color="#F59E0B" />
                <Text style={styles.diagnosticCodeText}>{code}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 정비 권장사항 */}
        {diagnosticData.maintenanceRecommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>정비 권장사항</Text>
            {diagnosticData.maintenanceRecommendations.map(recommendation => (
              <View key={recommendation.id} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Ionicons name="construct" size={20} color="#6366F1" />
                  <View style={styles.recommendationInfo}>
                    <Text style={styles.recommendationType}>
                      {recommendation.type.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <View
                      style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(recommendation.severity) },
                      ]}
                    >
                      <Text style={styles.severityText}>
                        {getSeverityText(recommendation.severity)}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.recommendationDescription}>{recommendation.description}</Text>

                <View style={styles.recommendationFooter}>
                  <Text style={styles.recommendationCost}>
                    예상 비용: ₩{recommendation.estimatedCost.toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.bookingButton}
                    onPress={() => handleMaintenanceBooking(recommendation)}
                  >
                    <Text style={styles.bookingButtonText}>예약하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 액션 버튼들 */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.newDiagnosisButton}
            onPress={runNewDiagnosis}
            disabled={isRunningDiagnosis}
          >
            <Ionicons name="analytics" size={20} color="#FFFFFF" />
            <Text style={styles.newDiagnosisButtonText}>
              {isRunningDiagnosis ? '진단 중...' : '새 진단 실행'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  diagnosisProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 8,
  },
  diagnosisProgressText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  statusSummaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusTimestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  metricBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  tireContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tireGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tireItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tireLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  tireValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  diagnosticCodesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  diagnosticCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diagnosticCodeText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationInfo: {
    flex: 1,
    marginLeft: 8,
  },
  recommendationType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  bookingButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  newDiagnosisButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  newDiagnosisButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
