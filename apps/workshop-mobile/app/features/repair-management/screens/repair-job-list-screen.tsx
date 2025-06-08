import React, { useCallback, useState } from 'react';

import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRepairJobs } from '../hooks/useRepairJobs';
import { RepairJob, RepairStatus } from '../types';

// 작업 상태별 색상 설정
const statusColorMap: Record<RepairStatus | 'all', string> = {
  pending: '#3b82f6', // 파란색
  in_progress: '#f59e0b', // 황색
  completed: '#10b981', // 녹색
  cancelled: '#ef4444', // 빨간색
  waiting_parts: '#8b5cf6', // 보라색
  all: '#e5e7eb', // 회색 (전체 필터용)
};

// 작업 상태별 한글 표시
const statusKoreanMap: Record<RepairStatus, string> = {
  pending: '대기 중',
  in_progress: '진행 중',
  completed: '완료',
  cancelled: '취소됨',
  waiting_parts: '부품 대기',
};

// 작업 상태별 아이콘
const statusIconMap: Record<RepairStatus, React.ReactNode> = {
  pending: <Feather name="clock" size={16} color={statusColorMap.pending} />,
  in_progress: (
    <MaterialCommunityIcons name="wrench" size={16} color={statusColorMap.in_progress} />
  ),
  completed: <Feather name="check-circle" size={16} color={statusColorMap.completed} />,
  cancelled: <Feather name="x-circle" size={16} color={statusColorMap.cancelled} />,
  waiting_parts: (
    <MaterialCommunityIcons name="package-variant" size={16} color={statusColorMap.waiting_parts} />
  ),
};

const RepairJobItem: React.FC<{
  job: RepairJob;
  onPress: (job: RepairJob) => void;
}> = ({ job, onPress }) => {
  const formattedDate = (dateString: string | null) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => onPress(job)}
      activeOpacity={0.7}
      testID={`repair-job-item-${job.id}`}
    >
      <View style={styles.jobHeader}>
        <View style={styles.licensePlateContainer}>
          <Text style={styles.licensePlate}>{job.vehicleInfo.licensePlate}</Text>
          <Text style={styles.vehicleInfo}>
            {job.vehicleInfo.manufacturer} {job.vehicleInfo.model}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColorMap[job.status] + '22' }]}>
          <View style={styles.statusIconContainer}>{statusIconMap[job.status]}</View>
          <Text style={[styles.statusText, { color: statusColorMap[job.status] }]}>
            {statusKoreanMap[job.status]}
          </Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{job.customerInfo.name}</Text>
        <Text style={styles.customerPhone}>{job.customerInfo.phone}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>

      <View style={styles.jobFooter}>
        <View style={styles.footerItem}>
          <Feather name="user" size={14} color="#6b7280" />
          <Text style={styles.footerText}>{job.technicianInfo?.name ?? '미배정'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Feather name="clock" size={14} color="#6b7280" />
          <Text style={styles.footerText}>{job.estimatedHours}시간</Text>
        </View>
        <View style={styles.footerItem}>
          <Feather name="calendar" size={14} color="#6b7280" />
          <Text style={styles.footerText}>{formattedDate(job.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RepairJobListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentFilter, setCurrentFilter] = useState<RepairStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { repairJobs, isLoading, totalJobs, statistics, fetchRepairJobs } = useRepairJobs({
    page,
    pageSize: 10,
    status: currentFilter !== 'all' ? currentFilter : undefined,
  });

  useFocusEffect(
    useCallback(() => {
      fetchRepairJobs();
    }, [fetchRepairJobs])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRepairJobs();
    setRefreshing(false);
  }, [fetchRepairJobs]);

  const handleJobPress = (job: RepairJob) => {
    // @ts-expect-error - 네비게이션 타입이 완전히 정의되지 않음
    navigation.navigate('RepairJobDetail', { jobId: job.id });
  };

  const handleAddPress = () => {
    // @ts-expect-error - 네비게이션 타입이 완전히 정의되지 않음
    navigation.navigate('RepairJobForm');
  };

  const renderFilterButton = (status: RepairStatus | 'all', label: string, count?: number) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentFilter === status && { backgroundColor: statusColorMap[status] || '#e5e7eb' },
      ]}
      onPress={() => {
        setCurrentFilter(status);
        setPage(1);
      }}
      testID={`filter-button-${status}`}
    >
      <Text
        style={[
          styles.filterButtonText,
          currentFilter === status && { color: status === 'all' ? '#1f2937' : '#ffffff' },
        ]}
      >
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>정비 작업 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPress} testID="add-job-button">
          <Feather name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statisticsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalJobs}</Text>
          <Text style={styles.statLabel}>전체</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: statusColorMap.pending }]}>
            {statistics.pending}
          </Text>
          <Text style={styles.statLabel}>대기</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: statusColorMap.in_progress }]}>
            {statistics.inProgress}
          </Text>
          <Text style={styles.statLabel}>진행중</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: statusColorMap.waiting_parts }]}>
            {statistics.waitingParts}
          </Text>
          <Text style={styles.statLabel}>부품대기</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: statusColorMap.completed }]}>
            {statistics.completed}
          </Text>
          <Text style={styles.statLabel}>완료</Text>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('all', '전체')}
          {renderFilterButton('pending', '대기 중', statistics.pending)}
          {renderFilterButton('in_progress', '진행 중', statistics.inProgress)}
          {renderFilterButton('waiting_parts', '부품 대기', statistics.waitingParts)}
          {renderFilterButton('completed', '완료', statistics.completed)}
          {renderFilterButton('cancelled', '취소됨', statistics.cancelled)}
        </ScrollView>
      </View>

      {isLoading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>정비 작업을 불러오는 중...</Text>
        </View>
      ) : null}

      {!isLoading && page === 1 && repairJobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="engineering" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>정비 작업이 없습니다</Text>
        </View>
      ) : null}

      {(!isLoading || page > 1) && repairJobs.length > 0 ? (
        <FlatList
          data={repairJobs}
          renderItem={({ item }) => <RepairJobItem job={item} onPress={handleJobPress} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          onEndReached={() => {
            if (!isLoading) {
              setPage(prev => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          testID="repair-job-list"
          ListFooterComponent={
            isLoading && page > 1 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#3b82f6" />
              </View>
            ) : null
          }
        />
      ) : null}
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
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statisticsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 4,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  jobItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  licensePlateContainer: {
    flex: 1,
  },
  licensePlate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  vehicleInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusIconContainer: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginRight: 8,
  },
  customerPhone: {
    fontSize: 13,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  listContent: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default RepairJobListScreen;
