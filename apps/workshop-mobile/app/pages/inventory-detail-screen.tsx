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
interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  costPrice: number;
  quantity: number;
  minQuantity: number;
  location: string;
  compatibleVehicles: string[];
  lastRestocked: string;
  description?: string;
  supplier?: string;
  imageUrl?: string;
}

type InventoryDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type InventoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'InventoryDetail'>;

// 임시 데이터 (API 연동 전까지 사용)
const DUMMY_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: '엔진 오일 필터',
    sku: 'FIL-OIL-001',
    category: '필터',
    brand: '현대/기아',
    price: 15000,
    costPrice: 8500,
    quantity: 24,
    minQuantity: 10,
    location: 'A1-03',
    compatibleVehicles: ['현대 아반떼', '기아 K3', '현대 쏘나타'],
    lastRestocked: '2025-05-10',
    description: '순정 엔진 오일 필터, 15,000km 또는 1년마다 교체 권장',
    supplier: '현대모비스',
  },
  {
    id: '2',
    name: '브레이크 패드 (앞)',
    sku: 'BRK-PAD-F01',
    category: '브레이크',
    brand: 'Bosch',
    price: 45000,
    costPrice: 32000,
    quantity: 8,
    minQuantity: 5,
    location: 'B2-12',
    compatibleVehicles: ['현대 아반떼', '기아 K5', '현대 싼타페'],
    lastRestocked: '2025-05-05',
    description: 'Bosch 세라믹 브레이크 패드, 저소음, 저분진, 장수명',
    supplier: '보쉬코리아',
  },
  {
    id: '3',
    name: '에어컨 필터',
    sku: 'FIL-AIR-002',
    category: '필터',
    brand: '3M',
    price: 18000,
    costPrice: 11000,
    quantity: 15,
    minQuantity: 8,
    location: 'A1-06',
    compatibleVehicles: ['현대 아반떼', '기아 K5', '쌍용 코란도'],
    lastRestocked: '2025-05-12',
    description: '3M 활성탄 에어컨 필터, 미세먼지 차단, 6개월마다 교체 권장',
    supplier: '3M코리아',
  },
  {
    id: '4',
    name: '엔진 오일 5W-30 (1L)',
    sku: 'OIL-5W30-1L',
    category: '오일',
    brand: 'Shell',
    price: 12000,
    costPrice: 8000,
    quantity: 36,
    minQuantity: 20,
    location: 'C3-01',
    compatibleVehicles: ['다양한 차종'],
    lastRestocked: '2025-05-15',
    description: 'Shell Helix Ultra 합성 엔진 오일, 고성능 엔진 보호',
    supplier: '쉘코리아',
  },
  {
    id: '5',
    name: '타이밍 벨트 키트',
    sku: 'BLT-TIM-K01',
    category: '엔진',
    brand: 'Gates',
    price: 150000,
    costPrice: 95000,
    quantity: 3,
    minQuantity: 2,
    location: 'D2-08',
    compatibleVehicles: ['현대 쏘나타', '기아 K5'],
    lastRestocked: '2025-04-28',
    description: 'Gates 타이밍 벨트 키트, 텐셔너 및 아이들러 풀리 포함',
    supplier: '게이츠코리아',
  },
];

const getInventoryItemById = (id: string): InventoryItem | undefined => {
  return DUMMY_INVENTORY.find(item => item.id === id);
};

const formatCurrency = (amount: number): string => {
  return `₩${amount.toLocaleString()}`;
};

const InventoryDetailScreen = () => {
  const route = useRoute<InventoryDetailScreenRouteProp>();
  const navigation = useNavigation<InventoryDetailScreenNavigationProp>();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  // 파라미터에서 아이템 ID 가져오기
  const { itemId } = route.params;

  useEffect(() => {
    // API 연동 시 여기에서 데이터를 가져옵니다
    // 지금은 임시 데이터를 사용합니다
    setTimeout(() => {
      const foundItem = getInventoryItemById(itemId);
      if (foundItem) {
        setItem(foundItem);
      } else {
        // eslint-disable-next-line no-console
        console.error(`부품 ID ${itemId}에 해당하는 정보를 찾을 수 없습니다.`);
      }
      setLoading(false);
    }, 1000);
  }, [itemId]);

  const handleAdjustQuantity = () => {
    if (!item) return;

    Alert.alert('수량 조정', '재고 수량을 어떻게 변경하시겠습니까?', [
      {
        text: '증가 (+1)',
        onPress: () => {
          setItem({
            ...item,
            quantity: item.quantity + 1,
          });
        },
      },
      {
        text: '감소 (-1)',
        onPress: () => {
          if (item.quantity > 0) {
            setItem({
              ...item,
              quantity: item.quantity - 1,
            });
          }
        },
      },
      {
        text: '직접 입력',
        onPress: () => {
          Alert.prompt(
            '수량 입력',
            '새 수량을 입력하세요:',
            [
              {
                text: '취소',
                style: 'cancel',
              },
              {
                text: '저장',
                onPress: value => {
                  const newQuantity = parseInt(value || '0', 10);
                  if (!isNaN(newQuantity) && newQuantity >= 0) {
                    setItem({
                      ...item,
                      quantity: newQuantity,
                    });
                  }
                },
              },
            ],
            'plain-text',
            item.quantity.toString()
          );
        },
      },
      {
        text: '취소',
        style: 'cancel',
      },
    ]);
  };

  const handleEditItem = () => {
    // 부품 정보 수정 화면으로 이동
    Alert.alert('부품 정보 수정', '이 기능은 아직 구현되지 않았습니다.');
  };

  const handleCreateOrder = () => {
    // 발주서 생성 화면으로 이동
    Alert.alert('발주서 생성', '이 기능은 아직 구현되지 않았습니다.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>부품 정보 불러오는 중...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>부품 정보를 찾을 수 없습니다</Text>
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
        <Text style={styles.title}>부품 상세 정보</Text>
        <TouchableOpacity onPress={handleEditItem}>
          <Icon name="pencil" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      {/* 부품 기본 정보 */}
      <View style={styles.itemInfoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSku}>{item.sku}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
          <Text style={styles.costPrice}>원가: {formatCurrency(item.costPrice)}</Text>
        </View>

        {/* 재고 수량 정보 */}
        <View
          style={[
            styles.quantityContainer,
            item.quantity <= item.minQuantity && styles.lowQuantityContainer,
          ]}
        >
          <View style={styles.quantityInfo}>
            <Text
              style={[
                styles.quantityText,
                item.quantity <= item.minQuantity && styles.lowQuantityText,
              ]}
            >
              재고 수량: {item.quantity}
            </Text>
            <Text style={styles.minQuantityText}>최소 수량: {item.minQuantity}</Text>
          </View>

          <TouchableOpacity style={styles.adjustButton} onPress={handleAdjustQuantity}>
            <Icon name="plus-minus-variant" size={20} color="#fff" />
            <Text style={styles.adjustButtonText}>수량 조정</Text>
          </TouchableOpacity>
        </View>

        {item.quantity <= item.minQuantity && (
          <TouchableOpacity style={styles.orderButton} onPress={handleCreateOrder}>
            <Icon name="cart-plus" size={20} color="#fff" />
            <Text style={styles.orderButtonText}>발주서 생성</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 부품 상세 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>상세 정보</Text>
        <View style={styles.infoItem}>
          <Icon name="tag-outline" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>카테고리:</Text>
          <Text style={styles.infoValue}>{item.category}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="domain" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>브랜드:</Text>
          <Text style={styles.infoValue}>{item.brand}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="map-marker" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>위치:</Text>
          <Text style={styles.infoValue}>{item.location}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="calendar-check" size={18} color="#7f8c8d" />
          <Text style={styles.infoLabel}>마지막 입고:</Text>
          <Text style={styles.infoValue}>{item.lastRestocked}</Text>
        </View>
        {item.supplier && (
          <View style={styles.infoItem}>
            <Icon name="truck" size={18} color="#7f8c8d" />
            <Text style={styles.infoLabel}>공급업체:</Text>
            <Text style={styles.infoValue}>{item.supplier}</Text>
          </View>
        )}
      </View>

      {/* 호환 차량 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>호환 차량</Text>
        {item.compatibleVehicles.map((vehicle, index) => (
          <View key={index} style={styles.vehicleItem}>
            <Icon name="car" size={18} color="#7f8c8d" />
            <Text style={styles.vehicleText}>{vehicle}</Text>
          </View>
        ))}
      </View>

      {/* 부품 설명 */}
      {item.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설명</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      )}

      {/* 액션 버튼 */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditItem}>
          <Icon name="pencil" size={20} color="#3498db" />
          <Text style={styles.actionButtonText}>정보 수정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleCreateOrder}>
          <Icon name="cart-plus" size={20} color="#3498db" />
          <Text style={styles.actionButtonText}>발주 생성</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('이력 보기', '이 기능은 아직 구현되지 않았습니다.')}
        >
          <Icon name="history" size={20} color="#3498db" />
          <Text style={styles.actionButtonText}>이력 보기</Text>
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
  itemInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  nameContainer: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  costPrice: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  lowQuantityContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#f87171',
  },
  quantityInfo: {
    flex: 1,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  lowQuantityText: {
    color: '#ef4444',
  },
  minQuantityText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  adjustButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 4,
  },
  orderButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2c3e50',
  },
  descriptionText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#3498db',
    marginLeft: 4,
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

export default InventoryDetailScreen;
