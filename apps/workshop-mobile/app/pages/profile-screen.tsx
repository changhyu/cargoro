import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../navigation';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // 프로필 데이터 (실제 구현에서는 API 또는 상태 관리 라이브러리에서 가져옴)
  const profile = {
    name: '김정비',
    role: '정비사',
    email: 'mechanic@workshop.com',
    phone: '010-1234-5678',
    department: '엔진/트랜스미션 팀',
    joinDate: '2020-05-15',
    skills: ['엔진 정비', '변속기 수리', '전자 시스템 진단'],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImage}>
          <Icon name="account" size={60} color="#fff" />
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.role}>{profile.role}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>기본 정보</Text>

        <View style={styles.infoRow}>
          <Icon name="email" size={20} color="#3498db" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>이메일:</Text>
          <Text style={styles.infoValue}>{profile.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color="#3498db" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>전화번호:</Text>
          <Text style={styles.infoValue}>{profile.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="domain" size={20} color="#3498db" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>부서:</Text>
          <Text style={styles.infoValue}>{profile.department}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="calendar" size={20} color="#3498db" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>입사일:</Text>
          <Text style={styles.infoValue}>{profile.joinDate}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>전문 분야</Text>
        {profile.skills.map((skill, index) => (
          <View key={index} style={styles.skillItem}>
            <Icon name="check-circle" size={18} color="#27ae60" style={styles.skillIcon} />
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Icon name="cog" size={20} color="#fff" />
        <Text style={styles.settingsButtonText}>설정</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    paddingVertical: 30,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  role: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: '#7f8c8d',
    width: 70,
  },
  infoValue: {
    fontSize: 15,
    color: '#2c3e50',
    flex: 1,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillIcon: {
    marginRight: 10,
  },
  skillText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  settingsButton: {
    backgroundColor: '#34495e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ProfileScreen;
