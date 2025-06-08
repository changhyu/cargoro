import React, { useEffect, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../navigation';

// 고객 타입 정의
interface Vehicle {
  model: string;
  year: string;
  licensePlate: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  vehicles: Vehicle[];
  lastVisit: string;
  visitCount: number;
}

// 네비게이션 타입 정의
type CustomerListScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// 임시 데이터 (API 연동 전까지 사용)
const DUMMY_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: '김민수',
    phone: '010-1234-5678',
    email: 'kim.minsoo@example.com',
    address: '서울시 강남구 테헤란로 123',
    vehicles: [{ model: '현대 아반떼', year: '2022', licensePlate: '12가 3456' }],
    lastVisit: '2025-05-15',
    visitCount: 8,
  },
  {
    id: '2',
    name: '이지영',
    phone: '010-2345-6789',
    email: 'lee.jiyoung@example.com',
    address: '서울시 서초구 반포대로 45',
    vehicles: [{ model: '기아 K5', year: '2021', licensePlate: '34나 5678' }],
    lastVisit: '2025-05-18',
    visitCount: 3,
  },
  {
    id: '3',
    name: '박준호',
    phone: '010-3456-7890',
    email: 'park.junho@example.com',
    address: '경기도 성남시 분당구 판교역로 220',
    vehicles: [
      { model: '쌍용 코란도', year: '2020', licensePlate: '56다 7890' },
      { model: '현대 그랜저', year: '2023', licensePlate: '67라 8901' },
    ],
    lastVisit: '2025-05-10',
    visitCount: 12,
  },
  {
    id: '4',
    name: '최수진',
    phone: '010-4567-8901',
    email: 'choi.soojin@example.com',
    address: '서울시 송파구 올림픽로 300',
    vehicles: [{ model: '현대 싼타페', year: '2019', licensePlate: '78라 9012' }],
    lastVisit: '2025-05-20',
    visitCount: 5,
  },
  {
    id: '5',
    name: '정현우',
    phone: '010-5678-9012',
    email: 'jung.hyunwoo@example.com',
    address: '경기도 고양시 일산동구 중앙로 1234',
    vehicles: [{ model: '기아 스포티지', year: '2022', licensePlate: '90마 1234' }],
    lastVisit: '2025-05-12',
    visitCount: 7,
  },
];

const CustomerListScreen = () => {
  const navigation = useNavigation<CustomerListScreenNavigationProp>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API 연동 시 여기에서 데이터를 가져옵니다
    // 지금은 임시 데이터를 사용합니다
    setTimeout(() => {
      setCustomers(DUMMY_CUSTOMERS);
      setFilteredCustomers(DUMMY_CUSTOMERS);
      setLoading(false);
    }, 1000);
  }, []);

  // 검색 기능
  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => {
      const nameMatch = customer.name.toLowerCase().includes(text.toLowerCase());
      const phoneMatch = customer.phone.includes(text);
      const emailMatch = customer.email.toLowerCase().includes(text.toLowerCase());
      const licensePlateMatch = customer.vehicles.some(vehicle =>
        vehicle.licensePlate.toLowerCase().includes(text.toLowerCase())
      );

      return nameMatch || phoneMatch || emailMatch || licensePlateMatch;
    });

    setFilteredCustomers(filtered);
  };

  const handleAddCustomer = () => {
    navigation.navigate('CustomerCreate');
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerItem}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
    >
      <View style={styles.customerHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerPhone}>{item.phone}</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.visitCount}>{item.visitCount}회 방문</Text>
          <Text style={styles.lastVisit}>최근: {item.lastVisit}</Text>
        </View>
      </View>

      <View style={styles.vehiclesContainer}>
        {item.vehicles.map((vehicle: Vehicle, index: number) => (
          <View key={index} style={styles.vehicleItem}>
            <Icon name="car" size={16} color="#7f8c8d" />
            <Text style={styles.vehicleText}>
              {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.contactContainer}>
        <TouchableOpacity style={styles.contactButton}>
          <Icon name="phone" size={16} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton}>
          <Icon name="message-text" size={16} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton}>
          <Icon name="calendar-plus" size={16} color="#3498db" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>고객 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCustomer}>
          <Icon name="account-plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="이름, 연락처, 차량번호 검색..."
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>고객 목록 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          renderItem={renderCustomerItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-search" size={64} color="#e0e0e0" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? `"${searchQuery}" 검색 결과가 없습니다`
                  : '등록된 고객이 없습니다'}
              </Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity style={styles.resetButton} onPress={() => handleSearch('')}>
                  <Text style={styles.resetButtonText}>검색 초기화</Text>
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
    marginBottom: 8,
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
  listContainer: {
    padding: 16,
  },
  customerItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  customerPhone: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  visitCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  lastVisit: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  vehiclesContainer: {
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  vehicleText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2c3e50',
  },
  contactContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  contactButton: {
    marginRight: 16,
    padding: 4,
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

export default CustomerListScreen;
