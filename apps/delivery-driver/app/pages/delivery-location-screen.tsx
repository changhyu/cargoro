import React, { useState } from 'react';

import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';

interface 배송정보 {
  id: string;
  출발지: string;
  도착지: string;
  고객명: string;
  상태: '대기' | '진행중' | '완료';
  예상시간: string;
  거리: string;
  우선순위: '일반' | '긴급';
}

const 샘플배송데이터: 배송정보[] = [
  {
    id: '1',
    출발지: '서울시 강남구',
    도착지: '부산시 해운대구',
    고객명: '김철수',
    상태: '진행중',
    예상시간: '4시간 30분',
    거리: '325km',
    우선순위: '긴급',
  },
  {
    id: '2',
    출발지: '인천시 연수구',
    도착지: '대전시 유성구',
    고객명: '이영희',
    상태: '대기',
    예상시간: '2시간 15분',
    거리: '165km',
    우선순위: '일반',
  },
  {
    id: '3',
    출발지: '서울시 마포구',
    도착지: '광주시 서구',
    고객명: '박민수',
    상태: '대기',
    예상시간: '3시간 45분',
    거리: '285km',
    우선순위: '일반',
  },
];

export default function DeliveryLocationScreen() {
  const [검색어, set검색어] = useState('');
  const [선택된필터, set선택된필터] = useState<'전체' | '대기' | '진행중' | '완료'>('전체');

  const 필터링된데이터 = 샘플배송데이터.filter(배송 => {
    const 검색조건 =
      배송.고객명.includes(검색어) || 배송.출발지.includes(검색어) || 배송.도착지.includes(검색어);

    const 상태조건 = 선택된필터 === '전체' || 배송.상태 === 선택된필터;

    return 검색조건 && 상태조건;
  });

  const 상태색상 = (상태: string) => {
    switch (상태) {
      case '완료':
        return '#10b981';
      case '진행중':
        return '#f59e0b';
      case '대기':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const 배송아이템렌더 = ({ item }: { item: 배송정보 }) => (
    <TouchableOpacity style={styles.deliveryItem}>
      <View style={styles.deliveryHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.고객명}</Text>
          {item.우선순위 === '긴급' && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>🚨 긴급</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: 상태색상(item.상태) }]}>
          <Text style={styles.statusText}>{item.상태}</Text>
        </View>
      </View>

      <View style={styles.routeInfo}>
        <Text style={styles.routeText}>📍 {item.출발지}</Text>
        <Text style={styles.arrowText}>→</Text>
        <Text style={styles.routeText}>🏁 {item.도착지}</Text>
      </View>

      <View style={styles.deliveryDetails}>
        <Text style={styles.detailText}>⏱️ {item.예상시간}</Text>
        <Text style={styles.detailText}>📏 {item.거리}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>길찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.callButton]}>
          <Text style={styles.actionButtonText}>연락</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="고객명, 출발지, 도착지 검색..."
          value={검색어}
          onChangeText={set검색어}
        />
      </View>

      {/* 필터 탭 */}
      <View style={styles.filterContainer}>
        {['전체', '대기', '진행중', '완료'].map(필터 => (
          <TouchableOpacity
            key={필터}
            style={[styles.filterTab, 선택된필터 === 필터 && styles.activeFilterTab]}
            onPress={() => set선택된필터(필터 as any)}
          >
            <Text style={[styles.filterText, 선택된필터 === 필터 && styles.activeFilterText]}>
              {필터}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 배송 목록 */}
      <FlatList
        data={필터링된데이터}
        renderItem={배송아이템렌더}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeFilterTab: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  deliveryItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  urgentBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    color: '#dc2626',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  arrowText: {
    fontSize: 16,
    color: '#6b7280',
    marginHorizontal: 8,
  },
  deliveryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 0.48,
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
