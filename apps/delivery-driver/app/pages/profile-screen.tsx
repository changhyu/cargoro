import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import useUserStore from '../state/user-store';

interface ProfileMenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  showArrow = true,
  rightComponent,
}) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={20} color="#6B7280" />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuItemValue}>{value}</Text>}
        {rightComponent}
        {showArrow && onPress && <Icon name="chevron-right" size={20} color="#9CA3AF" />}
      </View>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = useUserStore(state => state.user);
  const toggleAvailability = useUserStore(state => state.actions.toggleAvailability);
  const logout = useUserStore(state => state.actions.logout);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);

  const handleToggleAvailability = async (value: boolean) => {
    setIsAvailable(value);
    await toggleAvailability(value);
    Alert.alert(
      '상태 변경',
      value ? '배송 가능 상태로 변경되었습니다.' : '배송 불가능 상태로 변경되었습니다.'
    );
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // 로그인 화면으로 이동
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 프로필 헤더 */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Icon name="user" size={40} color="#9CA3AF" />
            </View>
          )}
          <TouchableOpacity style={styles.editImageButton}>
            <Icon name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{user?.name || '기사님'}</Text>
        <Text style={styles.profileEmail}>{user?.email || ''}</Text>

        {/* 평점 및 배송 완료 수 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Icon name="star" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{user?.rating || '0.0'}</Text>
            <Text style={styles.statLabel}>평점</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Icon name="truck" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{user?.deliveriesCompleted || 0}</Text>
            <Text style={styles.statLabel}>완료 배송</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Icon name="calendar" size={16} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{user?.memberSince || '-'}</Text>
            <Text style={styles.statLabel}>가입</Text>
          </View>
        </View>
      </View>

      {/* 근무 상태 토글 */}
      <View style={styles.section}>
        <ProfileMenuItem
          icon="power"
          title="근무 상태"
          subtitle={isAvailable ? '배송 가능' : '배송 불가능'}
          showArrow={false}
          rightComponent={
            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>

      {/* 계정 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정 정보</Text>
        <ProfileMenuItem
          icon="phone"
          title="전화번호"
          value={user?.phone || '-'}
          onPress={() => navigation.navigate('EditProfile', { field: 'phone' })}
        />
        <ProfileMenuItem
          icon="credit-card"
          title="운전면허"
          value={user?.licenseNumber || '-'}
          onPress={() => navigation.navigate('EditProfile', { field: 'license' })}
        />
        <ProfileMenuItem
          icon="truck"
          title="차량 규모"
          value={user?.vehicleCapacity || '-'}
          onPress={() => navigation.navigate('EditProfile', { field: 'vehicle' })}
        />
      </View>

      {/* 업무 관련 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>업무 관리</Text>
        <ProfileMenuItem
          icon="calendar"
          title="일정 관리"
          subtitle="배송 일정 확인 및 관리"
          onPress={() => navigation.navigate('Schedule')}
        />
        <ProfileMenuItem
          icon="clock"
          title="배송 이력"
          subtitle="과거 배송 내역 조회"
          onPress={() => navigation.navigate('DeliveryHistory')}
        />
        <ProfileMenuItem
          icon="dollar-sign"
          title="수익 관리"
          subtitle="수익 내역 및 정산"
          onPress={() => navigation.navigate('PaymentHistory')}
        />
      </View>

      {/* 앱 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 설정</Text>
        <ProfileMenuItem
          icon="bell"
          title="알림 설정"
          subtitle="푸시 알림 관리"
          onPress={() => navigation.navigate('Settings', { section: 'notifications' })}
        />
        <ProfileMenuItem
          icon="map"
          title="내비게이션 설정"
          subtitle="선호하는 내비게이션 앱"
          onPress={() => navigation.navigate('Settings', { section: 'navigation' })}
        />
        <ProfileMenuItem
          icon="shield"
          title="개인정보 처리방침"
          onPress={() => navigation.navigate('Settings', { section: 'privacy' })}
        />
      </View>

      {/* 지원 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>도움말</Text>
        <ProfileMenuItem
          icon="help-circle"
          title="고객 지원"
          subtitle="문의 및 도움말"
          onPress={() => navigation.navigate('Support')}
        />
        <ProfileMenuItem
          icon="info"
          title="앱 정보"
          value={`v1.0.0`}
          onPress={() => navigation.navigate('Settings', { section: 'about' })}
        />
      </View>

      {/* 로그아웃 버튼 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statIconContainer: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});
