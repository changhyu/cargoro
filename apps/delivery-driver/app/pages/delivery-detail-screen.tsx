import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useDeliveryStore } from '../state/delivery-store';
import * as ImagePicker from 'expo-image-picker';

interface PhotoSectionProps {
  title: string;
  photos: string[];
  onAddPhoto: () => void;
  maxPhotos?: number;
}

const PhotoSection: React.FC<PhotoSectionProps> = ({
  title,
  photos,
  onAddPhoto,
  maxPhotos = 3,
}) => {
  return (
    <View style={styles.photoSection}>
      <Text style={styles.photoSectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.photoContainer}>
          {photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.photo} />
          ))}
          {photos.length < maxPhotos && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={onAddPhoto}>
              <Icon name="camera" size={24} color="#6B7280" />
              <Text style={styles.addPhotoText}>사진 추가</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default function DeliveryDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const {
    currentDelivery,
    fetchDeliveryById,
    startDelivery,
    completeDelivery,
    cancelDelivery,
    uploadPickupPhotos,
    uploadDeliveryPhotos,
    isLoading,
  } = useDeliveryStore();

  const [pickupPhotos, setPickupPhotos] = useState<string[]>([]);
  const [deliveryPhotos, setDeliveryPhotos] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    fetchDeliveryById(id);
  }, [id]);

  useEffect(() => {
    if (currentDelivery) {
      setPickupPhotos(currentDelivery.pickupPhotos || []);
      setDeliveryPhotos(currentDelivery.deliveryPhotos || []);
    }
  }, [currentDelivery]);

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('오류', '전화를 걸 수 없습니다.');
        }
      })
      .catch(err => console.error('전화 걸기 오류:', err));
  };

  const handleNavigation = (latitude: number, longitude: number, address: string) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(address);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleStartDelivery = async () => {
    Alert.alert('배송 시작', '배송을 시작하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '시작',
        onPress: async () => {
          await startDelivery(id);
          Alert.alert('알림', '배송이 시작되었습니다.');
        },
      },
    ]);
  };

  const handleCompleteDelivery = async () => {
    if (deliveryPhotos.length === 0) {
      Alert.alert('오류', '배송 완료 사진을 먼저 촬영해주세요.');
      return;
    }

    Alert.alert('배송 완료', '배송을 완료하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: async () => {
          setIsCompleting(true);
          await completeDelivery(id, {
            photos: deliveryPhotos,
            signature: '', // TODO: 서명 기능 추가
            notes: '',
          });
          setIsCompleting(false);
          Alert.alert('알림', '배송이 완료되었습니다.');
          navigation.goBack();
        },
      },
    ]);
  };

  const handleCancelDelivery = async () => {
    Alert.alert('배송 취소', '정말 배송을 취소하시겠습니까?', [
      { text: '아니오', style: 'cancel' },
      {
        text: '예',
        style: 'destructive',
        onPress: async () => {
          // TODO: 취소 사유 입력 모달 추가
          await cancelDelivery(id, '고객 요청');
          Alert.alert('알림', '배송이 취소되었습니다.');
          navigation.goBack();
        },
      },
    ]);
  };

  const pickImage = async (type: 'pickup' | 'delivery') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto = result.assets[0].uri;

      if (type === 'pickup') {
        const updatedPhotos = [...pickupPhotos, newPhoto];
        setPickupPhotos(updatedPhotos);
        await uploadPickupPhotos(id, updatedPhotos);
      } else {
        const updatedPhotos = [...deliveryPhotos, newPhoto];
        setDeliveryPhotos(updatedPhotos);
        await uploadDeliveryPhotos(id, updatedPhotos);
      }
    }
  };

  const takePhoto = async (type: 'pickup' | 'delivery') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 촬영하려면 카메라 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto = result.assets[0].uri;

      if (type === 'pickup') {
        const updatedPhotos = [...pickupPhotos, newPhoto];
        setPickupPhotos(updatedPhotos);
        await uploadPickupPhotos(id, updatedPhotos);
      } else {
        const updatedPhotos = [...deliveryPhotos, newPhoto];
        setDeliveryPhotos(updatedPhotos);
        await uploadDeliveryPhotos(id, updatedPhotos);
      }
    }
  };

  const handleAddPhoto = (type: 'pickup' | 'delivery') => {
    Alert.alert('사진 추가', '사진을 어떻게 추가하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '갤러리에서 선택', onPress: () => pickImage(type) },
      { text: '카메라로 촬영', onPress: () => takePhoto(type) },
    ]);
  };

  if (isLoading || !currentDelivery) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>배송 정보를 불러오는 중...</Text>
      </View>
    );
  }

  const getStatusColor = () => {
    switch (currentDelivery.status) {
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (currentDelivery.status) {
      case 'pending':
        return '대기중';
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 상태 배너 */}
      <View style={[styles.statusBanner, { backgroundColor: getStatusColor() }]}>
        <Icon name="truck" size={24} color="#FFFFFF" />
        <Text style={styles.statusBannerText}>{getStatusText()}</Text>
      </View>

      {/* 고객 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>고객 정보</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>이름</Text>
          <Text style={styles.value}>{currentDelivery.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>연락처</Text>
          <TouchableOpacity
            style={styles.phoneButton}
            onPress={() => handleCall(currentDelivery.customerPhone)}
          >
            <Text style={styles.phoneText}>{currentDelivery.customerPhone}</Text>
            <Icon name="phone" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 차량 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>차량 정보</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>차량 번호</Text>
          <Text style={styles.value}>{currentDelivery.vehicleNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>차종</Text>
          <Text style={styles.value}>{currentDelivery.vehicleModel}</Text>
        </View>
      </View>

      {/* 픽업 위치 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>픽업 위치</Text>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() =>
              handleNavigation(
                currentDelivery.pickupLatitude,
                currentDelivery.pickupLongitude,
                currentDelivery.pickupAddress
              )
            }
          >
            <Icon name="navigation" size={16} color="#3B82F6" />
            <Text style={styles.navButtonText}>내비게이션</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.address}>{currentDelivery.pickupAddress}</Text>
      </View>

      {/* 배송 위치 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>배송 위치</Text>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() =>
              handleNavigation(
                currentDelivery.deliveryLatitude,
                currentDelivery.deliveryLongitude,
                currentDelivery.deliveryAddress
              )
            }
          >
            <Icon name="navigation" size={16} color="#3B82F6" />
            <Text style={styles.navButtonText}>내비게이션</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.address}>{currentDelivery.deliveryAddress}</Text>
      </View>

      {/* 배송 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>배송 정보</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>예상 거리</Text>
          <Text style={styles.value}>{currentDelivery.distance} km</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>예상 시간</Text>
          <Text style={styles.value}>{currentDelivery.estimatedTime}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>배송료</Text>
          <Text style={styles.value}>{currentDelivery.price.toLocaleString()}원</Text>
        </View>
      </View>

      {/* 메모 */}
      {currentDelivery.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <Text style={styles.notes}>{currentDelivery.notes}</Text>
        </View>
      )}

      {/* 픽업 사진 */}
      {currentDelivery.status !== 'pending' && (
        <PhotoSection
          title="픽업 사진"
          photos={pickupPhotos}
          onAddPhoto={() => handleAddPhoto('pickup')}
        />
      )}

      {/* 배송 완료 사진 */}
      {currentDelivery.status === 'in_progress' && (
        <PhotoSection
          title="배송 완료 사진"
          photos={deliveryPhotos}
          onAddPhoto={() => handleAddPhoto('delivery')}
        />
      )}

      {/* 액션 버튼 */}
      <View style={styles.actionButtons}>
        {currentDelivery.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={handleStartDelivery}
            >
              <Icon name="play" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>배송 시작</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelDelivery}
            >
              <Icon name="x" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>배송 취소</Text>
            </TouchableOpacity>
          </>
        )}

        {currentDelivery.status === 'in_progress' && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.completeButton,
              isCompleting && styles.disabledButton,
            ]}
            onPress={handleCompleteDelivery}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="check" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>배송 완료</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  statusBannerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginRight: 4,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  navButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  notes: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  photoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  photoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  photoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: '#3B82F6',
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    opacity: 0.6,
  },
  bottomSpacing: {
    height: 40,
  },
});
