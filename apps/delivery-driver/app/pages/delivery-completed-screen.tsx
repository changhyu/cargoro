import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../navigation/index'; // Adjust the import path as needed

type DeliveryCompletedScreenRouteProp = RouteProp<RootStackParamList, 'DeliveryCompleted'>;

const getRatingLabel = (rating: number): string => {
  switch (rating) {
    case 1:
      return '매우 불만족';
    case 2:
      return '불만족';
    case 3:
      return '보통';
    case 4:
      return '만족';
    case 5:
      return '매우 만족';
    default:
      return '';
  }
};

const DeliveryCompletedScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DeliveryCompletedScreenRouteProp>();
  const deliveryId = route.params?.deliveryId; // Safely access deliveryId

  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 실제로는 deliveryId를 사용하여 완료된 배송 정보를 가져와야 함
    console.log(`Loading completed delivery: ${deliveryId}`);
  }, [deliveryId]);

  // 별점 선택 처리
  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
  };

  // 완료 처리
  const handleComplete = () => {
    if (rating === 0) {
      Alert.alert('알림', '배송 만족도를 평가해주세요.');
      return;
    }

    setIsSubmitting(true);

    // 실제로는 API 호출하여 평가 제출
    setTimeout(() => {
      setIsSubmitting(false);

      // 완료 후 홈으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as keyof RootStackParamList }],
      });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>탁송 완료</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={80} color="#27ae60" />
          </View>
          <Text style={styles.successTitle}>탁송이 완료되었습니다!</Text>
          <Text style={styles.successMessage}>
            탁송이 성공적으로 완료되었습니다. 고객의 차량을 안전하게 전달해주셔서 감사합니다.
          </Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>이번 탁송은 어떠셨나요?</Text>
          <Text style={styles.ratingSubtitle}>서비스 개선을 위해 탁송 경험을 평가해주세요.</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRatingSelect(star)}
                style={styles.starButton}
              >
                <Icon
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={36}
                  color={rating >= star ? '#f39c12' : '#bdc3c7'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.completeButton, isSubmitting && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={isSubmitting}
        >
          <Text style={styles.completeButtonText}>{isSubmitting ? '제출 중...' : '완료'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
  },
  successContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  ratingContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  completeButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DeliveryCompletedScreen;
