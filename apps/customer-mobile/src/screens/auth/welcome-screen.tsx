import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import type { AuthScreenNavigationProp } from '../../types/navigation';

const { width: _width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 로고 및 애니메이션 */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Icon name="truck" size={60} color="#6366F1" />
          </View>
          <Text style={styles.appName}>CarGoro</Text>
          <Text style={styles.tagline}>스마트한 차량 관리의 시작</Text>
        </View>

        {/* 특징 소개 */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="calendar" size={24} color="#6366F1" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>간편한 정비 예약</Text>
              <Text style={styles.featureDescription}>
                언제 어디서나 쉽고 빠르게 정비소를 예약하세요
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="map-pin" size={24} color="#10B981" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>실시간 위치 추적</Text>
              <Text style={styles.featureDescription}>
                차량의 정비 진행 상황을 실시간으로 확인하세요
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="clock" size={24} color="#F59E0B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>정비 이력 관리</Text>
              <Text style={styles.featureDescription}>
                모든 정비 기록을 한눈에 확인하고 관리하세요
              </Text>
            </View>
          </View>
        </View>

        {/* 버튼 섹션 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.primaryButtonText}>시작하기</Text>
            <Icon name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>이미 계정이 있으신가요?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  featuresSection: {
    marginTop: 40,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  buttonSection: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
});
