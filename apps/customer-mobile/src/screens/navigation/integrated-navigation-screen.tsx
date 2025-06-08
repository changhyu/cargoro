import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import {
  IntegratedRootStackParamList,
  NavigationLocation,
  NavigationRoute,
} from '../../types/integrated-navigation';
import integratedNavigationService from '../../services/integrated-navigation-service';

type NavigationScreenProps = StackNavigationProp<IntegratedRootStackParamList, 'Navigation'>;

export default function IntegratedNavigationScreen() {
  const navigation = useNavigation<NavigationScreenProps>();

  // 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NavigationLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [favoriteLocations, setFavoriteLocations] = useState<NavigationLocation[]>([]);
  const [nearbyWorkshops, setNearbyWorkshops] = useState<NavigationLocation[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<NavigationLocation | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'workshops'>('search');

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await integratedNavigationService.getCurrentLocation();
      setCurrentLocation(location);

      // 주변 정비소 검색
      const workshops = await integratedNavigationService.searchNearbyWorkshops(location);
      setNearbyWorkshops(workshops);
    } catch (error) {
      console.error('현재 위치 가져오기 실패:', error);
      Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
    }
  }, []);

  // 즐겨찾기 로드
  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await integratedNavigationService.getFavoriteLocations();
      setFavoriteLocations(favorites);
    } catch (error) {
      console.error('즐겨찾기 로드 실패:', error);
    }
  }, []);

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    getCurrentLocation();
    loadFavorites();
  }, [getCurrentLocation, loadFavorites]);

  // 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await integratedNavigationService.searchLocations(
        searchQuery,
        currentLocation || undefined
      );
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error('검색 실패:', error);
      Alert.alert('검색 오류', '검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 장소 선택 처리
  const handleSelectLocation = async (location: NavigationLocation) => {
    setSelectedDestination(location);

    if (currentLocation) {
      // 지도 화면으로 이동하여 경로 표시
      navigation.navigate('MapDetail', {
        destination: {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
        },
      });
    } else {
      Alert.alert('위치 오류', '현재 위치를 찾을 수 없습니다.');
    }
  };

  // 즐겨찾기 추가
  const handleAddToFavorites = async (location: NavigationLocation) => {
    try {
      await integratedNavigationService.addFavoriteLocation(location);
      await loadFavorites();
      Alert.alert('추가 완료', '즐겨찾기에 추가되었습니다.');
    } catch (error) {
      console.error('즐겨찾기 추가 실패:', error);
      Alert.alert('오류', '즐겨찾기 추가에 실패했습니다.');
    }
  };

  // 정비소로 전화하기
  const handleCallWorkshop = (phoneNumber: string) => {
    Alert.alert('전화 걸기', `${phoneNumber}로 전화를 걸겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '전화걸기', onPress: () => console.log('전화걸기:', phoneNumber) },
    ]);
  };

  // 긴급 서비스 버튼 처리
  const handleEmergencyService = () => {
    navigation.navigate('EmergencyService');
  };

  // 서비스 허브로 이동
  const handleGoToServiceHub = () => {
    navigation.navigate('ServiceHub');
  };

  // 위치 항목 렌더링
  const renderLocationItem = ({ item }: { item: NavigationLocation }) => (
    <TouchableOpacity style={styles.locationItem} onPress={() => handleSelectLocation(item)}>
      <View style={styles.locationInfo}>
        <View style={styles.locationHeader}>
          <Ionicons
            name={item.category === 'workshop' ? 'build-outline' : 'location-outline'}
            size={20}
            color="#6366F1"
          />
          <Text style={styles.locationName}>{item.name}</Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          )}
        </View>
        <Text style={styles.locationAddress}>{item.address}</Text>
        {item.distance && <Text style={styles.distance}>{Math.round(item.distance)}m</Text>}
        {item.category === 'workshop' && (
          <View style={styles.workshopActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => item.phoneNumber && handleCallWorkshop(item.phoneNumber)}
            >
              <Ionicons name="call-outline" size={16} color="#10B981" />
              <Text style={styles.actionText}>전화</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAddToFavorites(item)}
            >
              <Ionicons name="heart-outline" size={16} color="#EF4444" />
              <Text style={styles.actionText}>즐겨찾기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // 빈 목록 컴포넌트
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>
        {activeTab === 'search'
          ? '검색 결과가 없습니다'
          : activeTab === 'favorites'
            ? '즐겨찾기가 없습니다'
            : '주변 정비소가 없습니다'}
      </Text>
    </View>
  );

  // 현재 탭의 데이터 가져오기
  const getCurrentData = () => {
    switch (activeTab) {
      case 'search':
        return searchResults;
      case 'favorites':
        return favoriteLocations;
      case 'workshops':
        return nearbyWorkshops;
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>스마트 네비게이션</Text>
        <TouchableOpacity onPress={handleEmergencyService} style={styles.emergencyButton}>
          <Ionicons name="warning" size={20} color="#FFFFFF" />
          <Text style={styles.emergencyText}>긴급</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="목적지를 검색해보세요"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {isSearching && <ActivityIndicator size="small" color="#6366F1" />}
        </View>
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 퀵 액션 버튼들 */}
      <View style={styles.quickActions}>
        <TouchableOpacity onPress={getCurrentLocation} style={styles.quickActionButton}>
          <Ionicons name="location" size={24} color="#6366F1" />
          <Text style={styles.quickActionText}>현재위치</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGoToServiceHub} style={styles.quickActionButton}>
          <Ionicons name="construct" size={24} color="#6366F1" />
          <Text style={styles.quickActionText}>서비스</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('workshops')}
          style={styles.quickActionButton}
        >
          <Ionicons name="car-sport" size={24} color="#6366F1" />
          <Text style={styles.quickActionText}>정비소</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 네비게이션 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            검색결과
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            즐겨찾기
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workshops' && styles.activeTab]}
          onPress={() => setActiveTab('workshops')}
        >
          <Text style={[styles.tabText, activeTab === 'workshops' && styles.activeTabText]}>
            주변정비소
          </Text>
        </TouchableOpacity>
      </View>

      {/* 결과 목록 */}
      <FlatList
        data={getCurrentData()}
        renderItem={renderLocationItem}
        keyExtractor={item => item.id}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#6366F1',
    marginTop: 4,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  resultsList: {
    flex: 1,
  },
  locationItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationInfo: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 2,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 28,
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 28,
    fontWeight: '500',
  },
  workshopActions: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 28,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
