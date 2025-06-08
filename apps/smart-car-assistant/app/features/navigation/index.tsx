import React, { useState, useEffect, useCallback } from 'react';

import { getCurrentLocation } from '@cargoro/gps-obd-lib';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import navigationService, { Location, Route } from '../../services/navigation-service';
import { useStore } from '../../state';

/**
 * 내비게이션 화면 컴포넌트
 * 지도 검색, 경로 안내 및 주변 정비소 검색 기능 제공
 */
export const NavigationScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<Location | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Location | null>(null);
  const [calculatedRoute, setCalculatedRoute] = useState<Route | null>(null);
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<Location[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 현재 위치 정보 가져오기
  const fetchCurrentPosition = useCallback(async () => {
    try {
      const position = await getCurrentLocation();
      setCurrentPosition({
        latitude: position.latitude,
        longitude: position.longitude,
      });
    } catch (error) {
      console.error('현재 위치를 가져오는 중 오류 발생:', error);
    }
  }, []);

  // 컴포넌트 마운트 시 즐겨찾기 및 현재 위치 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 즐겨찾기 로드
        const favorites = await navigationService.getFavoriteLocations();
        setFavoriteLocations(favorites);

        // 현재 위치 가져오기
        await fetchCurrentPosition();
      } catch (error) {
        console.error('초기 데이터 로드 중 오류 발생:', error);
      }
    };

    loadInitialData();
  }, [fetchCurrentPosition]);

  // 검색 처리
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await navigationService.searchLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('장소 검색 중 오류 발생:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 장소 선택 처리
  const handleSelectLocation = async (location: Location, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setSelectedOrigin(location);
    } else {
      setSelectedDestination(location);
    }

    // 출발지와 목적지가 모두 선택되면 경로 계산
    if ((type === 'origin' && selectedDestination) || (type === 'destination' && selectedOrigin)) {
      try {
        const route = await navigationService.calculateRoute(
          type === 'origin' ? location.id : selectedOrigin!.id,
          type === 'destination' ? location.id : selectedDestination!.id
        );
        setCalculatedRoute(route);
      } catch (error) {
        console.error('경로 계산 중 오류 발생:', error);
      }
    }

    // 최근 장소에 추가
    if (!recentLocations.find(item => item.id === location.id)) {
      setRecentLocations([location, ...recentLocations.slice(0, 4)]);
    }
  };

  // 주변 정비소 검색
  const searchNearbyWorkshops = async () => {
    setIsSearching(true);
    try {
      if (!currentPosition) {
        await fetchCurrentPosition();
      }

      if (currentPosition) {
        const nearbyWorkshops = await navigationService.searchNearbyWorkshops(
          currentPosition.latitude,
          currentPosition.longitude,
          5 // 5km 반경
        );
        setSearchResults(nearbyWorkshops);
      } else {
        console.error('현재 위치를 확인할 수 없습니다.');
      }
    } catch (error) {
      console.error('주변 정비소 검색 중 오류 발생:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 즐겨찾기 추가
  const addToFavorites = async (location: Location) => {
    try {
      const updatedLocation = await navigationService.addFavoriteLocation({
        ...location,
        type: 'favorite',
      });
      setFavoriteLocations([updatedLocation, ...favoriteLocations]);
    } catch (error) {
      console.error('즐겨찾기 추가 중 오류 발생:', error);
    }
  };

  // 즐겨찾기 제거
  const removeFromFavorites = async (locationId: string) => {
    try {
      await navigationService.removeFavoriteLocation(locationId);
      setFavoriteLocations(favoriteLocations.filter(loc => loc.id !== locationId));
    } catch (error) {
      console.error('즐겨찾기 제거 중 오류 발생:', error);
    }
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleSelectLocation(item, selectedOrigin ? 'destination' : 'origin')}
    >
      <View style={styles.locationIconContainer}>
        <Ionicons
          name={item.type === 'favorite' ? 'star' : item.type === 'poi' ? 'location' : 'home'}
          size={20}
          color="#007aff"
        />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationAddress}>{item.address}</Text>
        {item.distance && <Text style={styles.locationDistance}>{item.distance}km</Text>}
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() =>
          item.type === 'favorite' ? removeFromFavorites(item.id) : addToFavorites(item)
        }
      >
        <Ionicons
          name={item.type === 'favorite' ? 'star' : 'star-outline'}
          size={20}
          color="#007aff"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="주소, 장소 검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.nearbyButton} onPress={searchNearbyWorkshops}>
          <Ionicons name="locate" size={22} color="#007aff" />
          <Text style={styles.nearbyButtonText}>주변 정비소</Text>
        </TouchableOpacity>
      </View>

      {selectedOrigin && !calculatedRoute && (
        <View style={styles.routeInput}>
          <View style={styles.routePoint}>
            <Ionicons name="location" size={22} color="green" />
            <Text style={styles.routePointText}>{selectedOrigin.name}</Text>
          </View>
          <View style={styles.routePointDivider} />
          <TouchableOpacity style={styles.routePoint}>
            <Ionicons name="location" size={22} color="red" />
            <Text style={styles.routePointText}>목적지 선택</Text>
          </TouchableOpacity>
        </View>
      )}

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={styles.loadingText}>검색 중...</Text>
        </View>
      ) : calculatedRoute ? (
        <View style={styles.routeContainer}>
          <View style={styles.routeSummary}>
            <Text style={styles.routeTitle}>
              {calculatedRoute.distance.toFixed(1)}km ({Math.floor(calculatedRoute.duration)}분)
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setCalculatedRoute(null);
                setSelectedOrigin(null);
                setSelectedDestination(null);
              }}
            >
              <Ionicons name="refresh" size={20} color="#007aff" />
              <Text style={styles.resetButtonText}>재검색</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={calculatedRoute.steps}
            renderItem={({ item, index }) => (
              <View style={styles.routeStep}>
                <View style={styles.routeStepIconContainer}>
                  <Text style={styles.routeStepNumber}>{index + 1}</Text>
                </View>
                <View style={styles.routeStepInfo}>
                  <Text style={styles.routeStepInstruction}>{item.instruction}</Text>
                  <Text style={styles.routeStepDistance}>
                    {item.distance.toFixed(1)}km ({Math.ceil(item.duration)}분)
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={(item, index) => `step-${index}`}
          />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderLocationItem}
          keyExtractor={item => `location-${item.id}`}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.suggestionsContainer}>
          {recentLocations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>최근 검색</Text>
              <FlatList
                data={recentLocations}
                renderItem={renderLocationItem}
                keyExtractor={item => `recent-${item.id}`}
                scrollEnabled={false}
              />
            </View>
          )}

          {favoriteLocations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>즐겨찾기</Text>
              <FlatList
                data={favoriteLocations}
                renderItem={renderLocationItem}
                keyExtractor={item => `favorite-${item.id}`}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  nearbyButtonText: {
    marginLeft: 6,
    fontSize: 15,
    color: '#007aff',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  routeInput: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  routePointText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  routePointDivider: {
    height: 16,
    width: 1,
    backgroundColor: '#cccccc',
    marginLeft: 10,
  },
  listContainer: {
    padding: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  locationDistance: {
    fontSize: 14,
    color: '#007aff',
    marginTop: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  routeContainer: {
    flex: 1,
    padding: 16,
  },
  routeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    marginBottom: 16,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007aff',
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  routeStepIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007aff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  routeStepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  routeStepInfo: {
    flex: 1,
    marginLeft: 12,
  },
  routeStepInstruction: {
    fontSize: 15,
    color: '#333333',
  },
  routeStepDistance: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
});

export default NavigationScreen;
