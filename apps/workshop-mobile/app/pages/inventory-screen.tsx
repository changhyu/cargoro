import React, { useEffect, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
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
}

interface Category {
  id: string;
  name: string;
}

type InventoryScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type SortField = 'name' | 'quantity' | 'price';
type SortOrder = 'asc' | 'desc';

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
  },
  {
    id: '6',
    name: '스파크 플러그 (4개)',
    sku: 'PLG-SPK-401',
    category: '점화',
    brand: 'NGK',
    price: 32000,
    costPrice: 22000,
    quantity: 12,
    minQuantity: 8,
    location: 'B1-04',
    compatibleVehicles: ['현대 아반떼', '기아 K3', '현대 쏘나타'],
    lastRestocked: '2025-05-08',
  },
  {
    id: '7',
    name: '와이퍼 블레이드 (600mm)',
    sku: 'WPR-600-01',
    category: '와이퍼',
    brand: 'Bosch',
    price: 25000,
    costPrice: 16000,
    quantity: 18,
    minQuantity: 10,
    location: 'A2-09',
    compatibleVehicles: ['다양한 차종'],
    lastRestocked: '2025-05-14',
  },
];

// 카테고리 목록
const CATEGORIES: Category[] = [
  { id: 'all', name: '전체' },
  { id: '필터', name: '필터' },
  { id: '브레이크', name: '브레이크' },
  { id: '오일', name: '오일' },
  { id: '엔진', name: '엔진' },
  { id: '점화', name: '점화' },
  { id: '와이퍼', name: '와이퍼' },
];

const formatCurrency = (amount: number): string => {
  return `₩${amount.toLocaleString()}`;
};

const InventoryScreen = () => {
  const navigation = useNavigation<InventoryScreenNavigationProp>();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    // API 연동 시 여기에서 데이터를 가져옵니다
    // 지금은 임시 데이터를 사용합니다
    setTimeout(() => {
      setInventory(DUMMY_INVENTORY);
      setFilteredInventory(DUMMY_INVENTORY);
      setLoading(false);
    }, 1000);
  }, []);

  // 검색, 카테고리 필터링, 정렬을 모두 적용한 데이터를 계산
  useEffect(() => {
    let result = [...inventory];

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // 검색 필터링
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query)
      );
    }

    // 정렬
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'quantity') {
        comparison = a.quantity - b.quantity;
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredInventory(result);
  }, [inventory, searchQuery, selectedCategory, sortBy, sortOrder]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSort = (field: SortField) => {
    // 같은 필드를 선택하면 정렬 방향 전환
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAddInventory = () => {
    Alert.alert('재고 추가', '이 기능은 아직 구현되지 않았습니다.');
  };

  const handleAdjustQuantity = (itemId: string) => {
    Alert.alert('수량 조정', '재고 수량을 어떻게 변경하시겠습니까?', [
      {
        text: '증가 (+1)',
        onPress: () => {
          // 수량 증가 로직
          const updatedInventory = inventory.map(item =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          );
          setInventory(updatedInventory);
          // 재고 수량 변경 API 호출 (실제 구현 시)
        },
      },
      {
        text: '감소 (-1)',
        onPress: () => {
          // 수량 감소 로직 (0 미만으로 내려가지 않도록)
          const updatedInventory = inventory.map(item =>
            item.id === itemId && item.quantity > 0
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
          setInventory(updatedInventory);
          // 재고 수량 변경 API 호출 (실제 구현 시)
        },
      },
      {
        text: '취소',
        style: 'cancel',
      },
    ]);
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      style={[styles.itemCard, item.quantity <= item.minQuantity && styles.lowStockCard]}
      onPress={() => navigation.navigate('InventoryDetail', { itemId: item.id })}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.quantity <= item.minQuantity && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>재고 부족</Text>
          </View>
        )}
      </View>

      <View style={styles.itemDetails}>
        <View style={styles.itemDetailColumn}>
          <Text style={styles.itemSku}>{item.sku}</Text>
          <Text style={styles.itemCategory}>
            {item.category} | {item.brand}
          </Text>
        </View>
        <View style={styles.itemDetailColumn}>
          <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
          <Text style={styles.itemLocation}>위치: {item.location}</Text>
        </View>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.quantityContainer}>
          <Text
            style={[
              styles.quantityText,
              item.quantity <= item.minQuantity && styles.lowQuantityText,
            ]}
          >
            수량: <Text style={styles.quantityValue}>{item.quantity}</Text>
            {item.minQuantity > 0 && ` (최소: ${item.minQuantity})`}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAdjustQuantity(item.id)}
          >
            <Icon name="plus-minus-variant" size={18} color="#3498db" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('발주 생성', '이 기능은 아직 구현되지 않았습니다.')}
          >
            <Icon name="cart-plus" size={18} color="#3498db" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>부품 재고</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddInventory}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="부품명, SKU, 브랜드 검색..."
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={16} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.activeCategoryButton,
              ]}
              onPress={() => handleCategorySelect(item.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item.id && styles.activeCategoryButtonText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>정렬:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'name' && styles.activeSortButton]}
          onPress={() => handleSort('name')}
        >
          <Text style={styles.sortButtonText}>이름</Text>
          {sortBy === 'name' && (
            <Icon
              name={
                sortOrder === 'asc' ? 'sort-alphabetical-ascending' : 'sort-alphabetical-descending'
              }
              size={14}
              color="#3498db"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'quantity' && styles.activeSortButton]}
          onPress={() => handleSort('quantity')}
        >
          <Text style={styles.sortButtonText}>수량</Text>
          {sortBy === 'quantity' && (
            <Icon
              name={sortOrder === 'asc' ? 'sort-numeric-ascending' : 'sort-numeric-descending'}
              size={14}
              color="#3498db"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price' && styles.activeSortButton]}
          onPress={() => handleSort('price')}
        >
          <Text style={styles.sortButtonText}>가격</Text>
          {sortBy === 'price' && (
            <Icon
              name={sortOrder === 'asc' ? 'sort-numeric-ascending' : 'sort-numeric-descending'}
              size={14}
              color="#3498db"
            />
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => Alert.alert('고급 필터', '이 기능은 아직 구현되지 않았습니다.')}
        >
          <Icon name="filter-variant" size={18} color="#3498db" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>재고 목록 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="package-variant-closed-remove" size={64} color="#e0e0e0" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 || selectedCategory !== 'all'
                  ? '검색 결과가 없습니다'
                  : '등록된 재고 항목이 없습니다'}
              </Text>
              {(searchQuery.length > 0 || selectedCategory !== 'all') && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  <Text style={styles.resetButtonText}>필터 초기화</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#2c3e50',
  },
  clearButton: {
    padding: 4,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeCategoryButton: {
    backgroundColor: '#3498db',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  activeCategoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  activeSortButton: {
    borderWidth: 1,
    borderColor: '#3498db',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#2c3e50',
    marginRight: 4,
  },
  spacer: {
    flex: 1,
  },
  filterButton: {
    padding: 8,
  },
  listContainer: {
    padding: 12,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  lowStockBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lowStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemDetailColumn: {
    flex: 1,
  },
  itemSku: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  itemCategory: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'right',
  },
  itemLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'right',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  quantityContainer: {
    flex: 1,
  },
  quantityText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  lowQuantityText: {
    color: '#e74c3c',
  },
  quantityValue: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default InventoryScreen;
