import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { RootStackParamList } from '../navigation';

// SettingSection 컴포넌트 분리
const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

// ToggleSetting 컴포넌트 분리
const ToggleSetting = ({
  icon,
  title,
  description,
  value,
  onValueChange,
}: {
  icon: string;
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => (
  <View style={styles.settingItem}>
    <View style={styles.settingIconContainer}>
      <Icon name={icon} size={22} color="#3498db" />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {description && <Text style={styles.settingDescription}>{description}</Text>}
    </View>
    <Switch
      trackColor={{ false: '#e0e0e0', true: '#bde0fe' }}
      thumbColor={value ? '#3498db' : '#f4f3f4'}
      ios_backgroundColor="#e0e0e0"
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

// LinkSetting 컴포넌트 분리
const LinkSetting = ({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingIconContainer}>
      <Icon name={icon} size={22} color="#3498db" />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
    </View>
    <Icon name="chevron-right" size={22} color="#bdc3c7" />
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Settings'>>();
  const { i18n } = useTranslation();

  // 설정 상태
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 언어 변경
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  // 데이터 초기화
  const handleClearData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 로컬 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: () => {
            // 실제로는 AsyncStorage 등 데이터 초기화 로직 필요
            Alert.alert('알림', '모든 데이터가 초기화되었습니다.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <SettingSection title="일반">
          <ToggleSetting
            icon="bell-outline"
            title="알림"
            description="푸시 알림을 받습니다"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <ToggleSetting
            icon="map-marker-outline"
            title="위치 추적"
            description="탁송 진행 중 위치 추적을 허용합니다"
            value={locationTrackingEnabled}
            onValueChange={setLocationTrackingEnabled}
          />
          <ToggleSetting
            icon="volume-high"
            title="소리"
            description="앱 알림 소리를 켭니다"
            value={soundEnabled}
            onValueChange={setSoundEnabled}
          />
          <ToggleSetting
            icon="theme-light-dark"
            title="다크 모드"
            description="어두운 테마를 사용합니다"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </SettingSection>

        <SettingSection title="언어">
          <TouchableOpacity
            style={[styles.languageOption, i18n.language === 'ko' && styles.languageOptionSelected]}
            onPress={() => handleLanguageChange('ko')}
          >
            <Text
              style={[
                styles.languageOptionText,
                i18n.language === 'ko' && styles.languageOptionTextSelected,
              ]}
            >
              한국어
            </Text>
            {i18n.language === 'ko' && <Icon name="check" size={20} color="#3498db" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageOption, i18n.language === 'en' && styles.languageOptionSelected]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text
              style={[
                styles.languageOptionText,
                i18n.language === 'en' && styles.languageOptionTextSelected,
              ]}
            >
              English
            </Text>
            {i18n.language === 'en' && <Icon name="check" size={20} color="#3498db" />}
          </TouchableOpacity>
        </SettingSection>

        <SettingSection title="계정">
          <LinkSetting
            icon="account-outline"
            title="계정 정보"
            onPress={() => navigation.navigate('Profile')}
          />
          <LinkSetting
            icon="shield-account-outline"
            title="개인정보 보호"
            onPress={() => Alert.alert('알림', '개인정보 보호 설정입니다.')}
          />
          <LinkSetting
            icon="lock-outline"
            title="비밀번호 변경"
            onPress={() => Alert.alert('알림', '비밀번호 변경 화면입니다.')}
          />
        </SettingSection>

        <SettingSection title="앱 정보">
          <LinkSetting
            icon="information-outline"
            title="앱 버전"
            onPress={() => Alert.alert('앱 버전', 'v1.0.0')}
          />
          <LinkSetting
            icon="file-document-outline"
            title="이용약관"
            onPress={() => Alert.alert('알림', '이용약관 화면입니다.')}
          />
          <LinkSetting
            icon="shield-check-outline"
            title="개인정보 처리방침"
            onPress={() => Alert.alert('알림', '개인정보 처리방침 화면입니다.')}
          />
        </SettingSection>

        <SettingSection title="지원">
          <LinkSetting
            icon="lifebuoy"
            title="고객 지원"
            onPress={() => navigation.navigate('Support')}
          />
          <LinkSetting
            icon="forum-outline"
            title="피드백 보내기"
            onPress={() => Alert.alert('알림', '피드백 화면입니다.')}
          />
        </SettingSection>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>위험 구역</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
            <Icon name="delete-outline" size={20} color="#e74c3c" />
            <Text style={styles.dangerButtonText}>데이터 초기화</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>CarGoro 탁송 앱 v1.0.0</Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionContent: {
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 8,
  },
  settingTitle: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  languageOptionSelected: {
    backgroundColor: '#f0f9ff',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  languageOptionTextSelected: {
    fontWeight: '600',
    color: '#3498db',
  },
  dangerZone: {
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdeded',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f9d0d0',
  },
  dangerButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#e74c3c',
  },
  versionInfo: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default SettingsScreen;
