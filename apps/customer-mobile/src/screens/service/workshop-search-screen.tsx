import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { IntegratedRootStackParamList } from '../../types/integrated-navigation';

type WorkshopSearchScreenNavigationProp = StackNavigationProp<
  IntegratedRootStackParamList,
  'WorkshopSearch'
>;

type WorkshopSearchScreenRouteProp = RouteProp<IntegratedRootStackParamList, 'WorkshopSearch'>;

interface Workshop {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  phoneNumber: string;
  isOpen: boolean;
  openHours: string;
  services: ServiceType[];
  specialties: string[];
  images: string[];
  latitude: number;
  longitude: number;
}

interface ServiceType {
  id: string;
  name: string;
  price: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const WorkshopSearchScreen: React.FC = () => {
  const navigation = useNavigation<WorkshopSearchScreenNavigationProp>();
  const route = useRoute<WorkshopSearchScreenRouteProp>();
  const { currentLocation, serviceType } = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>(serviceType || 'all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  const serviceFilters = [
    { id: 'all', name: '전체', icon: 'grid-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'oil-change', name: '오일교환', icon: 'car-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'tire', name: '타이어', icon: 'ellipse-outline' as keyof typeof Ionicons.glyphMap },
    {
      id: 'brake',
      name: '브레이크',
      icon: 'stop-circle-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 'battery',
      name: '배터리',
      icon: 'battery-charging-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 'emergency',
      name: '응급수리',
      icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
    },
  ];

  const mockWorkshops: Workshop[] = [
    {
      id: '1',
      name: '카고로 정비센터 강남점',
      address: '서울시 강남구 테헤란로 123',
      distance: '1.2km',
      rating: 4.8,
      reviewCount: 127,
      phoneNumber: '02-1234-5678',
      isOpen: true,
      openHours: '09:00 - 18:00',
      services: [
        { id: 'oil-change', name: '엔진오일 교환', price: '60,000원', icon: 'car-outline' },
        { id: 'tire', name: '타이어 교체', price: '150,000원', icon: 'ellipse-outline' },
      ],
      specialties: ['수입차 전문', '친환경 오일'],
      images: [],
      latitude: 37.5665,
      longitude: 126.978,
    },
    {
      id: '2',
      name: '스마트카 서비스센터',
      address: '서울시 강남구 삼성로 456',
      distance: '2.1km',
      rating: 4.6,
      reviewCount: 89,
      phoneNumber: '02-2345-6789',
      isOpen: true,
      openHours: '08:30 - 19:00',
      services: [
        {
          id: 'battery',
          name: '배터리 교체',
          price: '120,000원',
          icon: 'battery-charging-outline',
        },
        { id: 'emergency', name: '응급 수리', price: '견적 후', icon: 'warning-outline' },
      ],
      specialties: ['24시간 출동', '전기차 정비'],
      images: [],
      latitude: 37.5172,
      longitude: 127.0473,
    },
    {
      id: '3',
      name: '프리미엄 오토케어',
      address: '서울시 서초구 강남대로 789',
      distance: '3.5km',
      rating: 4.9,
      reviewCount: 203,
      phoneNumber: '02-3456-7890',
      isOpen: false,
      openHours: '09:00 - 18:00 (일요일 휴무)',
      services: [
        { id: 'oil-change', name: '엔진오일 교환', price: '55,000원', icon: 'car-outline' },
        { id: 'brake', name: '브레이크 정비', price: '80,000원', icon: 'stop-circle-outline' },
        { id: 'tire', name: '타이어 교체', price: '140,000원', icon: 'ellipse-outline' },
      ],
      specialties: ['고급차 전문', '정품 부품'],
      images: [],
      latitude: 37.4979,
      longitude: 127.0276,
    },
  ];

  useEffect(() => {
    setWorkshops(mockWorkshops);
  }, []);

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch =
      workshop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' || workshop.services.some(service => service.id === selectedFilter);

    return matchesSearch && matchesFilter;
  });

  const sortedWorkshops = [...filteredWorkshops].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        // 가격 정렬은 복잡하므로 임시로 이름순
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleWorkshopPress = (workshop: Workshop) => {
    Alert.alert(
      workshop.name,
      `전화: ${workshop.phoneNumber}\n주소: ${workshop.address}\n영업시간: ${workshop.openHours}`,
      [
        { text: '취소', style: 'cancel' },
        { text: '전화걸기', onPress: () => Alert.alert('전화', '전화 앱을 실행합니다.') },
        { text: '예약하기', onPress: () => navigation.navigate('MaintenanceBooking', {}) },
        {
          text: '길찾기',
          onPress: () =>
            navigation.navigate('MapDetail', {
              destination: {
                latitude: workshop.latitude,
                longitude: workshop.longitude,
                name: workshop.name,
              },
            }),
        },
      ]
    );
  };

  const renderWorkshopCard = (workshop: Workshop) => (
    <TouchableOpacity
      key={workshop.id}
      style={styles.workshopCard}
      onPress={() => handleWorkshopPress(workshop)}
    >
      <View style={styles.workshopHeader}>
        <View style={styles.workshopInfo}>
          <Text style={styles.workshopName}>{workshop.name}</Text>
          <Text style={styles.workshopAddress}>{workshop.address}</Text>
          <View style={styles.workshopMeta}>
            <Text style={styles.distance}>📍 {workshop.distance}</Text>
            <Text style={styles.rating}>
              ⭐ {workshop.rating} ({workshop.reviewCount})
            </Text>
          </View>
        </View>
        <View style={styles.workshopStatus}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: workshop.isOpen ? '#4CAF50' : '#F44336' },
            ]}
          />
          <Text style={[styles.statusText, { color: workshop.isOpen ? '#4CAF50' : '#F44336' }]}>
            {workshop.isOpen ? '영업중' : '영업종료'}
          </Text>
        </View>
      </View>

      <View style={styles.workshopDetails}>
        <Text style={styles.openHours}>🕒 {workshop.openHours}</Text>
        <Text style={styles.phone}>📞 {workshop.phoneNumber}</Text>
      </View>

      <View style={styles.servicesContainer}>
        <Text style={styles.servicesTitle}>제공 서비스:</Text>
        <View style={styles.servicesList}>
          {workshop.services.map(service => (
            <View key={service.id} style={styles.serviceTag}>
              <Ionicons name={service.icon} size={14} color="#666" />
              <Text style={styles.serviceTagText}>{service.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {workshop.specialties.length > 0 && (
        <View style={styles.specialtiesContainer}>
          <Text style={styles.specialtiesTitle}>전문 분야:</Text>
          <View style={styles.specialtiesList}>
            {workshop.specialties.map((specialty, index) => (
              <Text key={index} style={styles.specialtyTag}>
                {specialty}
              </Text>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>정비소 찾기</Text>
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="정비소 이름 또는 주소 검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 필터 및 정렬 */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {serviceFilters.map(filter => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.activeFilterButton,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={selectedFilter === filter.id ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter.id && styles.activeFilterButtonText,
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const options = ['distance', 'rating', 'price'];
              const currentIndex = options.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % options.length;
              setSortBy(options[nextIndex] as typeof sortBy);
            }}
          >
            <Ionicons name="swap-vertical-outline" size={16} color="#666" />
            <Text style={styles.sortButtonText}>
              {sortBy === 'distance' ? '거리순' : sortBy === 'rating' ? '평점순' : '가격순'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 결과 목록 */}
      <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>총 {sortedWorkshops.length}개의 정비소</Text>
        </View>

        {sortedWorkshops.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>검색 결과가 없습니다</Text>
            <Text style={styles.emptyStateSubtext}>다른 검색어나 필터를 시도해보세요</Text>
          </View>
        ) : (
          sortedWorkshops.map(renderWorkshopCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mapButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  sortContainer: {
    paddingRight: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  resultsList: {
    flex: 1,
    padding: 20,
  },
  resultsHeader: {
    marginBottom: 15,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  workshopCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workshopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workshopInfo: {
    flex: 1,
  },
  workshopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workshopAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  workshopMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
  workshopStatus: {
    alignItems: 'center',
    gap: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  workshopDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  openHours: {
    fontSize: 14,
    color: '#666',
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  servicesContainer: {
    marginBottom: 12,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#666',
  },
  specialtiesContainer: {
    marginBottom: 8,
  },
  specialtiesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default WorkshopSearchScreen;
