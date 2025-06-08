import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingsScreen = () => {
  const navigation = useNavigation();

  // 설정 상태 관리 (실제로는 컨텍스트나 리덕스 등에서 관리할 수 있음)
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          // 로그아웃 로직 구현
          // eslint-disable-next-line no-console
          console.log('로그아웃 처리');
          // 인증 상태 클리어 후 로그인 화면으로 이동
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>일반</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Icon name="bell-outline" size={22} color="#3498db" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>알림</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#ccc', true: '#81b0ff' }}
            thumbColor={notifications ? '#3498db' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Icon name="theme-light-dark" size={22} color="#3498db" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>다크 모드</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#ccc', true: '#81b0ff' }}
            thumbColor={darkMode ? '#3498db' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Icon name="sync" size={22} color="#3498db" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>자동 동기화</Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: '#ccc', true: '#81b0ff' }}
            thumbColor={autoSync ? '#3498db' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>보안</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Icon name="fingerprint" size={22} color="#3498db" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>생체 인증 로그인</Text>
          </View>
          <Switch
            value={biometricLogin}
            onValueChange={setBiometricLogin}
            trackColor={{ false: '#ccc', true: '#81b0ff' }}
            thumbColor={biometricLogin ? '#3498db' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Icon name="lock-reset" size={22} color="#3498db" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>비밀번호 변경</Text>
          </View>
          <Icon name="chevron-right" size={22} color="#95a5a6" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Icon name="information-outline" size={22} color="#3498db" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>앱 정보</Text>
          </View>
          <Icon name="chevron-right" size={22} color="#95a5a6" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Icon
              name="file-document-outline"
              size={22}
              color="#3498db"
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>개인정보 처리방침</Text>
          </View>
          <Icon name="chevron-right" size={22} color="#95a5a6" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Icon name="help-circle-outline" size={22} color="#3498db" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>도움말</Text>
          </View>
          <Icon name="chevron-right" size={22} color="#95a5a6" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>버전 1.0.0</Text>
    </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#2c3e50',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    margin: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 14,
    marginBottom: 24,
  },
});

export default SettingsScreen;
