import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

interface InspectionCategory {
  id: string;
  name: string;
  icon: string;
  items: InspectionItem[];
}

interface InspectionItem {
  id: string;
  name: string;
  type: 'check' | 'measure' | 'note';
  unit?: string;
}

const inspectionCategories: InspectionCategory[] = [
  {
    id: 'exterior',
    name: '외관 점검',
    icon: 'eye',
    items: [
      { id: 'body_damage', name: '차체 손상', type: 'check' },
      { id: 'paint_condition', name: '도장 상태', type: 'check' },
      { id: 'glass_condition', name: '유리 상태', type: 'check' },
      { id: 'lights', name: '등화류', type: 'check' },
    ],
  },
  {
    id: 'engine',
    name: '엔진룸',
    icon: 'settings',
    items: [
      { id: 'engine_oil', name: '엔진 오일', type: 'check' },
      { id: 'coolant', name: '냉각수', type: 'check' },
      { id: 'brake_fluid', name: '브레이크액', type: 'check' },
      { id: 'battery', name: '배터리', type: 'measure', unit: 'V' },
    ],
  },
  {
    id: 'tires',
    name: '타이어',
    icon: 'disc',
    items: [
      { id: 'tire_pressure_fl', name: '앞좌 공기압', type: 'measure', unit: 'psi' },
      { id: 'tire_pressure_fr', name: '앞우 공기압', type: 'measure', unit: 'psi' },
      { id: 'tire_pressure_rl', name: '뒤좌 공기압', type: 'measure', unit: 'psi' },
      { id: 'tire_pressure_rr', name: '뒤우 공기압', type: 'measure', unit: 'psi' },
      { id: 'tire_tread', name: '타이어 마모', type: 'check' },
    ],
  },
  {
    id: 'interior',
    name: '실내 점검',
    icon: 'grid',
    items: [
      { id: 'seats', name: '시트 상태', type: 'check' },
      { id: 'dashboard', name: '계기판 작동', type: 'check' },
      { id: 'ac_heater', name: '에어컨/히터', type: 'check' },
      { id: 'audio', name: '오디오 시스템', type: 'check' },
    ],
  },
  {
    id: 'underbody',
    name: '하부 점검',
    icon: 'layers',
    items: [
      { id: 'oil_leak', name: '오일 누유', type: 'check' },
      { id: 'exhaust', name: '배기 시스템', type: 'check' },
      { id: 'suspension', name: '서스펜션', type: 'check' },
      { id: 'brake_pads', name: '브레이크 패드', type: 'check' },
    ],
  },
];

export default function InspectionScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string>('exterior');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [inspectionData, setInspectionData] = useState<Record<string, any>>({});

  const handleStartInspection = () => {
    if (!vehicleNumber) {
      Alert.alert('오류', '차량 번호를 입력해주세요.');
      return;
    }

    navigation.navigate('VehicleInspection', {
      workOrderId: 'new',
      vehicleId: vehicleNumber,
    });
  };

  const handleQuickInspection = (type: string) => {
    Alert.alert('빠른 점검', `${type} 점검을 시작하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '시작', onPress: () => console.log(`Starting ${type} inspection`) },
    ]);
  };

  const currentCategory = inspectionCategories.find(cat => cat.id === selectedCategory);

  return (
    <View style={styles.container}>
      {/* 차량 정보 입력 */}
      <View style={styles.vehicleInputSection}>
        <Text style={styles.sectionTitle}>차량 정보</Text>
        <View style={styles.inputContainer}>
          <Icon name="truck" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="차량 번호 입력"
            placeholderTextColor="#9CA3AF"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('QRScanner', { type: 'vehicle' })}
          >
            <Icon name="maximize" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 빠른 점검 */}
      <View style={styles.quickInspectionSection}>
        <Text style={styles.sectionTitle}>빠른 점검</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => handleQuickInspection('일반 점검')}
          >
            <Icon name="check-circle" size={24} color="#3B82F6" />
            <Text style={styles.quickCardTitle}>일반 점검</Text>
            <Text style={styles.quickCardDesc}>기본 20항목</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => handleQuickInspection('정밀 점검')}
          >
            <Icon name="search" size={24} color="#10B981" />
            <Text style={styles.quickCardTitle}>정밀 점검</Text>
            <Text style={styles.quickCardDesc}>전체 50항목</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => handleQuickInspection('출고 점검')}
          >
            <Icon name="send" size={24} color="#F59E0B" />
            <Text style={styles.quickCardTitle}>출고 점검</Text>
            <Text style={styles.quickCardDesc}>출고 전 확인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => handleQuickInspection('긴급 점검')}
          >
            <Icon name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.quickCardTitle}>긴급 점검</Text>
            <Text style={styles.quickCardDesc}>문제 부위만</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 점검 카테고리 */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>점검 항목</Text>

        {/* 카테고리 탭 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
          {inspectionCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Icon
                name={category.icon}
                size={16}
                color={selectedCategory === category.id ? '#10B981' : '#6B7280'}
              />
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === category.id && styles.categoryTabTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 점검 항목 목록 */}
        <ScrollView style={styles.itemsList}>
          {currentCategory?.items.map(item => (
            <View key={item.id} style={styles.inspectionItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemActions}>
                {item.type === 'check' && (
                  <View style={styles.checkButtons}>
                    <TouchableOpacity style={[styles.checkButton, styles.checkButtonGood]}>
                      <Icon name="check" size={16} color="#10B981" />
                      <Text style={styles.checkButtonText}>양호</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.checkButton, styles.checkButtonBad]}>
                      <Icon name="x" size={16} color="#EF4444" />
                      <Text style={styles.checkButtonText}>불량</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {item.type === 'measure' && (
                  <View style={styles.measureInput}>
                    <TextInput
                      style={styles.measureTextInput}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                    <Text style={styles.measureUnit}>{item.unit}</Text>
                  </View>
                )}
                {item.type === 'note' && (
                  <TouchableOpacity style={styles.noteButton}>
                    <Icon name="edit-3" size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 점검 시작 버튼 */}
      <TouchableOpacity
        style={[styles.startButton, !vehicleNumber && styles.startButtonDisabled]}
        onPress={handleStartInspection}
        disabled={!vehicleNumber}
      >
        <Icon name="clipboard" size={20} color="#FFFFFF" />
        <Text style={styles.startButtonText}>점검 시작</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  vehicleInputSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  scanButton: {
    padding: 8,
  },
  quickInspectionSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  quickCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  quickCardDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    flex: 1,
  },
  categoryTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#D1FAE5',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: '#10B981',
  },
  itemsList: {
    padding: 16,
  },
  inspectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemName: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButtons: {
    flexDirection: 'row',
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
  },
  checkButtonGood: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  checkButtonBad: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  checkButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#374151',
  },
  measureInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  measureTextInput: {
    fontSize: 16,
    color: '#1F2937',
    width: 60,
    textAlign: 'center',
  },
  measureUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  noteButton: {
    padding: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    margin: 16,
    borderRadius: 12,
  },
  startButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
