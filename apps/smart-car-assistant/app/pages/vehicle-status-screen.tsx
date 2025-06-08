import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList, VehicleStatusScreenNavigationProp } from '../types/navigation';

// 임시 차량 데이터
const DUMMY_VEHICLE = {
  id: 'v1',
  make: '현대',
  model: '아이오닉 5',
  year: 2023,
  licensePlate: '123가 4567',
  vin: 'KM8J3CAL6NU123456',
  color: '티알 그린',
  lastDriven: '오늘',
  batteryLevel: 76,
  range: 348,
  nextService: '3,200km 후 또는 2024-07-15',
  health: 92,
  location: '서울시 강남구',
  odometerReading: '12,845',
  lastCharged: '2025-05-21 19:30',
  tirePressure: {
    frontLeft: 32,
    frontRight: 32,
    rearLeft: 31,
    rearRight: 29, // 약간 낮음
  },
  fluidLevels: {
    coolant: 'normal',
    brakeFluid: 'normal',
    windshieldWasher: 'low',
  },
  engine: {
    status: 'good',
    temperature: 'normal',
    oil: 'normal',
  },
  transmission: 'normal',
  brakes: {
    status: 'normal',
    frontPads: 'good',
    rearPads: 'good',
  },
  battery: {
    voltage: 12.7,
    health: 'good',
    status: 'normal',
  },
  lights: {
    headlights: 'normal',
    brakeLight: 'normal',
    signalLights: 'normal',
  },
  alerts: ['타이어 공기압 (우측 뒤) 낮음'],
};

const VehicleStatusScreen = () => {
  const navigation = useNavigation<VehicleStatusScreenNavigationProp>();
  const [vehicle, _setVehicleData] = useState(DUMMY_VEHICLE); // 미사용 변수에 언더스코어 추가
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    if (status === 'good') return '#22c55e';
    if (status === 'warning') return '#f59e0b';
    return '#ef4444'; // critical
  };

  const getTirePressureStatus = (value: number) => {
    if (value >= 32 && value <= 36) return 'good';
    if (value >= 28 && value < 32) return 'warning';
    return 'critical';
  };

  // 타이어 상태 스타일 적용 조건 수정
  const isTireWarning = (value: number) => {
    const status = getTirePressureStatus(value);
    return status === 'warning' || status === 'critical';
  };

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'diagnostics':
        return renderDiagnosticsTab();
      case 'maintenance':
        return renderMaintenanceTab();
      default:
        return renderOverviewTab();
    }
  };

  // 개요 탭
  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>기본 정보</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>모델</Text>
            <Text style={styles.infoValue}>
              {vehicle.make} {vehicle.model}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>연식</Text>
            <Text style={styles.infoValue}>{vehicle.year}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>차량번호</Text>
            <Text style={styles.infoValue}>{vehicle.licensePlate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>색상</Text>
            <Text style={styles.infoValue}>{vehicle.color}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>누적 주행거리</Text>
            <Text style={styles.infoValue}>{vehicle.odometerReading}km</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>마지막 충전</Text>
            <Text style={styles.infoValue}>{vehicle.lastCharged}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>주요 상태</Text>

        <View style={styles.gaugeContainer}>
          <View style={styles.gauge}>
            <View style={styles.gaugeTextContainer}>
              <Text style={styles.gaugeValue}>{vehicle.batteryLevel}%</Text>
              <Text style={styles.gaugeLabel}>배터리</Text>
            </View>
            <View style={styles.gaugeBarContainer}>
              <View
                style={[
                  styles.gaugeBar,
                  {
                    width: `${vehicle.batteryLevel}%`,
                    backgroundColor:
                      vehicle.batteryLevel > 50
                        ? '#27ae60'
                        : vehicle.batteryLevel > 20
                          ? '#f39c12'
                          : '#e74c3c',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.gauge}>
            <View style={styles.gaugeTextContainer}>
              <Text style={styles.gaugeValue}>{vehicle.health}%</Text>
              <Text style={styles.gaugeLabel}>차량 건강</Text>
            </View>
            <View style={styles.gaugeBarContainer}>
              <View
                style={[
                  styles.gaugeBar,
                  {
                    width: `${vehicle.health}%`,
                    backgroundColor:
                      vehicle.health > 80 ? '#27ae60' : vehicle.health > 60 ? '#f39c12' : '#e74c3c',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.tiresContainer}>
          <Text style={styles.subSectionTitle}>타이어 공기압</Text>
          <View style={styles.tiresGrid}>
            <View style={styles.tireRow}>
              <View
                style={[
                  styles.tire,
                  isTireWarning(vehicle.tirePressure.frontLeft) && styles.tireWarning,
                ]}
              >
                <Text style={styles.tirePressureValue}>{vehicle.tirePressure.frontLeft}</Text>
                <Text style={styles.tirePressureLabel}>PSI</Text>
                <Text style={styles.tireLabel}>좌측 앞</Text>
              </View>
              <View style={styles.carIcon}>
                <Icon name="car-top" size={40} color="#95a5a6" />
              </View>
              <View
                style={[
                  styles.tire,
                  isTireWarning(vehicle.tirePressure.frontRight) && styles.tireWarning,
                ]}
              >
                <Text style={styles.tirePressureValue}>{vehicle.tirePressure.frontRight}</Text>
                <Text style={styles.tirePressureLabel}>PSI</Text>
                <Text style={styles.tireLabel}>우측 앞</Text>
              </View>
            </View>

            <View style={styles.tireRow}>
              <View
                style={[
                  styles.tire,
                  isTireWarning(vehicle.tirePressure.rearLeft) && styles.tireWarning,
                ]}
              >
                <Text style={styles.tirePressureValue}>{vehicle.tirePressure.rearLeft}</Text>
                <Text style={styles.tirePressureLabel}>PSI</Text>
                <Text style={styles.tireLabel}>좌측 뒤</Text>
              </View>
              <View
                style={[
                  styles.tire,
                  isTireWarning(vehicle.tirePressure.rearRight) && styles.tireWarning,
                ]}
              >
                <Text style={styles.tirePressureValue}>{vehicle.tirePressure.rearRight}</Text>
                <Text style={styles.tirePressureLabel}>PSI</Text>
                <Text style={styles.tireLabel}>우측 뒤</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {vehicle.alerts.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>주의 사항</Text>
          {vehicle.alerts.map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <Icon
                name="alert-circle-outline"
                size={20}
                color="#f39c12"
                style={styles.alertIcon}
              />
              <Text style={styles.alertText}>{alert}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // 진단 탭
  const renderDiagnosticsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>진단 결과</Text>
        <View style={styles.diagnosticsItem}>
          <View style={styles.diagnosticsHeader}>
            <Icon name="engine" size={20} color="#2c3e50" />
            <Text style={styles.diagnosticsTitle}>엔진 상태</Text>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(vehicle.engine.status) },
              ]}
            />
          </View>
          <View style={styles.diagnosticDetails}>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>온도:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.engine.temperature}</Text>
            </View>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>오일 레벨:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.engine.oil}</Text>
            </View>
          </View>
        </View>

        <View style={styles.diagnosticsItem}>
          <View style={styles.diagnosticsHeader}>
            <Icon name="car-shift-pattern" size={20} color="#2c3e50" />
            <Text style={styles.diagnosticsTitle}>트랜스미션</Text>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(vehicle.transmission) },
              ]}
            />
          </View>
        </View>

        <View style={styles.diagnosticsItem}>
          <View style={styles.diagnosticsHeader}>
            <Icon name="car-brake-fluid-level" size={20} color="#2c3e50" />
            <Text style={styles.diagnosticsTitle}>브레이크 시스템</Text>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(vehicle.brakes.status) },
              ]}
            />
          </View>
          <View style={styles.diagnosticDetails}>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>앞 패드:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.brakes.frontPads}</Text>
            </View>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>뒤 패드:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.brakes.rearPads}</Text>
            </View>
          </View>
        </View>

        <View style={styles.diagnosticsItem}>
          <View style={styles.diagnosticsHeader}>
            <Icon name="car-battery" size={20} color="#2c3e50" />
            <Text style={styles.diagnosticsTitle}>배터리 (12V)</Text>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(vehicle.battery.status) },
              ]}
            />
          </View>
          <View style={styles.diagnosticDetails}>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>전압:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.battery.voltage}V</Text>
            </View>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>건강:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.battery.health}</Text>
            </View>
          </View>
        </View>

        <View style={styles.diagnosticsItem}>
          <View style={styles.diagnosticsHeader}>
            <Icon name="car-light-high" size={20} color="#2c3e50" />
            <Text style={styles.diagnosticsTitle}>램프</Text>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(vehicle.lights.headlights) },
              ]}
            />
          </View>
          <View style={styles.diagnosticDetails}>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>헤드라이트:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.lights.headlights}</Text>
            </View>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>브레이크등:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.lights.brakeLight}</Text>
            </View>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>방향지시등:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.lights.signalLights}</Text>
            </View>
          </View>
        </View>

        <View style={styles.diagnosticsItem}>
          <View style={styles.diagnosticsHeader}>
            <Icon name="water" size={20} color="#2c3e50" />
            <Text style={styles.diagnosticsTitle}>유체 레벨</Text>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    vehicle.fluidLevels.windshieldWasher === 'low'
                      ? '#f39c12'
                      : vehicle.fluidLevels.coolant === 'normal' &&
                          vehicle.fluidLevels.brakeFluid === 'normal'
                        ? '#27ae60'
                        : '#e74c3c',
                },
              ]}
            />
          </View>
          <View style={styles.diagnosticDetails}>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>냉각수:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.fluidLevels.coolant}</Text>
            </View>
            <View style={styles.diagnosticDetail}>
              <Text style={styles.diagnosticLabel}>브레이크액:</Text>
              <Text style={styles.diagnosticValue}>{vehicle.fluidLevels.brakeFluid}</Text>
            </View>
            <View style={styles.diagnosticDetail}>
              <Text
                style={[
                  styles.diagnosticValue,
                  vehicle.fluidLevels.windshieldWasher === 'low' && { color: '#f39c12' },
                ]}
              >
                워셔액: {vehicle.fluidLevels.windshieldWasher}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.runDiagnosticButton}
        onPress={() => navigation.navigate('FullDiagnostics')}
      >
        <Text style={styles.runDiagnosticButtonText}>정밀 진단 실행</Text>
      </TouchableOpacity>
    </View>
  );

  // 정비 탭
  const renderMaintenanceTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>다가오는 정비</Text>
        <View style={styles.maintenanceItem}>
          <View style={styles.maintenanceIconContainer}>
            <Icon name="calendar" size={24} color="#3498db" />
          </View>
          <View style={styles.maintenanceInfo}>
            <Text style={styles.maintenanceTitle}>정기 점검</Text>
            <Text style={styles.maintenanceDesc}>{vehicle.nextService}</Text>
            <View style={styles.maintenanceActions}>
              <TouchableOpacity style={styles.maintenanceAction}>
                <Text style={styles.maintenanceActionText}>상세 정보</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.maintenanceAction, styles.maintenanceActionPrimary]}
                onPress={() => navigation.navigate('ScheduleService')}
              >
                <Text style={styles.maintenanceActionTextPrimary}>예약하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.maintenanceItem}>
          <View style={styles.maintenanceIconContainer}>
            <Icon name="water" size={24} color="#f39c12" />
          </View>
          <View style={styles.maintenanceInfo}>
            <Text style={styles.maintenanceTitle}>워셔액 부족</Text>
            <Text style={styles.maintenanceDesc}>워셔액이 부족합니다. 보충이 필요합니다.</Text>
            <View style={styles.maintenanceActions}>
              <TouchableOpacity style={styles.maintenanceAction}>
                <Text style={styles.maintenanceActionText}>정비 가이드</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.maintenanceAction, styles.maintenanceActionPrimary]}
                onPress={() => navigation.navigate('FindServiceCenter')}
              >
                <Text style={styles.maintenanceActionTextPrimary}>서비스센터</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>정비 이력</Text>
        <View style={styles.historyItem}>
          <View style={styles.historyDate}>
            <Text style={styles.historyDateMonth}>3월</Text>
            <Text style={styles.historyDateDay}>15</Text>
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>정기 점검</Text>
            <Text style={styles.historyDesc}>
              엔진오일 교체, 타이어 로테이션, 브레이크 패드 점검
            </Text>
            <Text style={styles.historyLocation}>현대자동차 강남 서비스센터</Text>
          </View>
        </View>

        <View style={styles.historyItem}>
          <View style={styles.historyDate}>
            <Text style={styles.historyDateMonth}>1월</Text>
            <Text style={styles.historyDateDay}>05</Text>
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>타이어 교체</Text>
            <Text style={styles.historyDesc}>전체 타이어 4개 교체 (미쉐린 크로스클라이밋2)</Text>
            <Text style={styles.historyLocation}>현대자동차 강남 서비스센터</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.fullHistoryButton}
        onPress={() => navigation.navigate('MaintenanceHistory')}
      >
        <Text style={styles.fullHistoryButtonText}>전체 정비 이력 보기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>차량 상태</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell-outline" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      <View style={styles.vehicleHeader}>
        <Text style={styles.vehicleHeaderTitle}>
          {vehicle.make} {vehicle.model}
        </Text>
        <Text style={styles.vehicleHeaderSubtitle}>{vehicle.licensePlate}</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'overview' && styles.activeTabItem]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            개요
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'diagnostics' && styles.activeTabItem]}
          onPress={() => setActiveTab('diagnostics')}
        >
          <Text style={[styles.tabText, activeTab === 'diagnostics' && styles.activeTabText]}>
            진단
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'maintenance' && styles.activeTabItem]}
          onPress={() => setActiveTab('maintenance')}
        >
          <Text style={[styles.tabText, activeTab === 'maintenance' && styles.activeTabText]}>
            정비
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  vehicleHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vehicleHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  vehicleHeaderSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  gaugeContainer: {
    marginBottom: 16,
  },
  gauge: {
    marginBottom: 12,
  },
  gaugeTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gaugeLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  gaugeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  gaugeBarContainer: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeBar: {
    height: '100%',
    borderRadius: 4,
  },
  tiresContainer: {
    marginVertical: 8,
  },
  tiresGrid: {
    alignItems: 'center',
  },
  tireRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  tire: {
    width: 80,
    height: 80,
    backgroundColor: '#ecf0f1',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  tireWarning: {
    backgroundColor: '#fef5e7',
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  tirePressureValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tirePressureLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  tireLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 4,
  },
  carIcon: {
    width: 60,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef5e7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#e67e22',
    flex: 1,
  },
  // 진단 탭 스타일
  diagnosticsItem: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  diagnosticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  diagnosticsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  diagnosticDetails: {
    marginLeft: 28,
  },
  diagnosticDetail: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  diagnosticLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    width: 80,
  },
  diagnosticValue: {
    fontSize: 12,
    color: '#2c3e50',
  },
  runDiagnosticButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  runDiagnosticButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  // 정비 탭 스타일
  maintenanceItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  maintenanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ebf5fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  maintenanceDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  maintenanceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  maintenanceAction: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  maintenanceActionPrimary: {
    backgroundColor: '#3498db',
  },
  maintenanceActionText: {
    fontSize: 12,
    color: '#3498db',
  },
  maintenanceActionTextPrimary: {
    fontSize: 12,
    color: 'white',
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  historyDate: {
    width: 50,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 6,
    marginRight: 12,
  },
  historyDateMonth: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  historyDateDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  historyDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  historyLocation: {
    fontSize: 10,
    color: '#95a5a6',
  },
  fullHistoryButton: {
    borderWidth: 1,
    borderColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  fullHistoryButtonText: {
    color: '#3498db',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default VehicleStatusScreen;
