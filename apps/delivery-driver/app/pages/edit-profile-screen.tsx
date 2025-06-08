import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useUserStore, { User } from '../state/user-store';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const user = useUserStore(state => state.user);
  const updateProfile = useUserStore(state => state.actions.updateProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 프로필 수정 필드 상태
  const [profileData, setProfileData] = useState<Partial<User>>({
    name: '',
    phone: '',
    profileImage: null,
    licenseNumber: '',
    vehicleCapacity: '',
  });

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage || null,
        licenseNumber: user.licenseNumber || '',
        vehicleCapacity: user.vehicleCapacity || '',
      });
    }
  }, [user]);

  // 이미지 선택 핸들러
  const handleImagePick = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('권한 필요', '프로필 이미지를 변경하려면 갤러리 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileData(prev => ({
          ...prev,
          profileImage: (result.assets as any)[0].uri,
        }));
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  // 필드 변경 핸들러
  const handleChange = (field: keyof User, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 프로필 저장 핸들러
  const handleSave = async () => {
    if (!profileData.name || !profileData.phone) {
      Alert.alert('필수 정보', '이름과 연락처는 필수 입력 사항입니다.');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(profileData);
      Alert.alert('완료', '프로필이 성공적으로 업데이트되었습니다.');
      navigation.goBack();
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      Alert.alert('오류', '프로필을 업데이트하는 중 문제가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>프로필 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? '저장 중...' : '저장'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 프로필 이미지 섹션 */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            {profileData.profileImage ? (
              <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="account" size={64} color="#bdc3c7" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
              <Icon name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>프로필 사진 변경</Text>
        </View>

        {/* 개인 정보 섹션 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>개인 정보</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>이름 *</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={value => handleChange('name', value)}
              placeholder="이름을 입력하세요"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>전화번호 *</Text>
            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={value => handleChange('phone', value)}
              placeholder="010-0000-0000"
              placeholderTextColor="#95a5a6"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>이메일</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{user?.email || '-'}</Text>
            </View>
            <Text style={styles.helperText}>이메일은 변경할 수 없습니다.</Text>
          </View>
        </View>

        {/* 운전자 정보 섹션 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>운전자 정보</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>운전면허 번호</Text>
            <TextInput
              style={styles.input}
              value={profileData.licenseNumber}
              onChangeText={value => handleChange('licenseNumber', value)}
              placeholder="면허 번호를 입력하세요"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>차량 운반 가능 크기</Text>
            <TextInput
              style={styles.input}
              value={profileData.vehicleCapacity}
              onChangeText={value => handleChange('vehicleCapacity', value)}
              placeholder="소형, 중형, 대형 등"
              placeholderTextColor="#95a5a6"
            />
          </View>
        </View>

        {/* 계정 정보 섹션 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>계정 정보</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>가입일</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{user?.memberSince || '-'}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>완료한 배송</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{user?.deliveriesCompleted || '0'}건</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>평점</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{user?.rating || '-'} / 5.0</Text>
            </View>
          </View>
        </View>

        {/* 비밀번호 변경 버튼 */}
        <TouchableOpacity
          style={styles.passwordChangeButton}
          onPress={() => Alert.alert('알림', '비밀번호 변경 이메일이 발송되었습니다.')}
        >
          <Icon name="lock-reset" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.passwordChangeButtonText}>비밀번호 변경하기</Text>
        </TouchableOpacity>

        {/* 여백 */}
        <View style={{ height: 30 }} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#7f8c8d',
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  changePhotoText: {
    color: '#3498db',
    fontSize: 14,
    marginTop: 8,
  },
  sectionContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#2c3e50',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  disabledText: {
    color: '#7f8c8d',
  },
  helperText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 15,
    color: '#2c3e50',
  },
  passwordChangeButton: {
    backgroundColor: '#34495e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  passwordChangeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default EditProfileScreen;
