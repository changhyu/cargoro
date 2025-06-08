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
import { useSession } from '../../providers/auth-provider';

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
  const { user, signOut } = useSession();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert('프로필 수정', '프로필 수정 기능은 준비 중입니다.');
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
          <TouchableOpacity style={styles.editImageButton} onPress={handleEditProfile}>
            <Icon name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{user?.name || '기술자'}</Text>
        <Text style={styles.profileRole}>
          {user?.role === 'master_technician'
            ? '마스터 기술자'
            : user?.role === 'senior_technician'
              ? '시니어 기술자'
              : '기술자'}
        </Text>
        <Text style={styles.profileWorkshop}>{user?.workshopName || 'CarGoro 정비소'}</Text>

        {/* 기술자 정보 */}
        <View style={styles.technicianInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>사원번호</Text>
            <Text style={styles.infoValue}>{user?.employeeId || 'EMP001'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>전문분야</Text>
            <Text style={styles.infoValue}>{user?.specialties?.length || 0}개</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>자격증</Text>
            <Text style={styles.infoValue}>{user?.certifications?.length || 0}개</Text>
          </View>
        </View>
      </View>

      {/* 계정 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정 정보</Text>
        <ProfileMenuItem icon="mail" title="이메일" value={user?.email || '-'} />
        <ProfileMenuItem icon="phone" title="전화번호" value={user?.phone || '-'} />
      </View>

      {/* 전문분야 및 자격증 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>전문분야 및 자격증</Text>
        <ProfileMenuItem
          icon="tool"
          title="전문분야"
          subtitle={user?.specialties?.join(', ') || '등록된 전문분야가 없습니다'}
          onPress={() => Alert.alert('전문분야', user?.specialties?.join('\n') || '없음')}
        />
        <ProfileMenuItem
          icon="award"
          title="자격증"
          subtitle={user?.certifications?.join(', ') || '등록된 자격증이 없습니다'}
          onPress={() => Alert.alert('자격증', user?.certifications?.join('\n') || '없음')}
        />
      </View>

      {/* 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설정</Text>
        <ProfileMenuItem
          icon="bell"
          title="알림"
          subtitle="작업 배정, 긴급 호출 등"
          showArrow={false}
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <ProfileMenuItem
          icon="map-pin"
          title="위치 서비스"
          subtitle="작업장 내 위치 추적"
          showArrow={false}
          rightComponent={
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <ProfileMenuItem
          icon="moon"
          title="다크 모드"
          subtitle="야간 작업 시 눈 보호"
          onPress={() => Alert.alert('다크 모드', '다크 모드 설정은 준비 중입니다.')}
        />
      </View>

      {/* 도움말 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>도움말</Text>
        <ProfileMenuItem
          icon="book"
          title="사용 가이드"
          subtitle="앱 사용법 안내"
          onPress={() => Alert.alert('사용 가이드', '사용 가이드를 확인하시겠습니까?')}
        />
        <ProfileMenuItem
          icon="help-circle"
          title="고객 지원"
          subtitle="문의 및 도움말"
          onPress={() => Alert.alert('고객 지원', '지원팀: support@cargoro.com')}
        />
        <ProfileMenuItem
          icon="info"
          title="앱 정보"
          value="v1.0.0"
          onPress={() => Alert.alert('앱 정보', 'CarGoro Technician\n버전: 1.0.0\n© 2025 CarGoro')}
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
    backgroundColor: '#10B981',
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
  profileRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  profileWorkshop: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoDivider: {
    width: 1,
    height: 30,
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
    height: 40,
  },
});
