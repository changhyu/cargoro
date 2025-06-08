import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// FAQ 타입 정의
interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'payment' | 'delivery' | 'app';
}

// 연락처 타입 정의
interface ContactInfo {
  type: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  value: string;
}

// 임시 FAQ 데이터
const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq1',
    question: '배송 중 차량 문제가 발생하면 어떻게 해야 하나요?',
    answer:
      '긴급 상황 발생 시 앱 내 [문제 보고] 버튼을 통해 즉시 운영팀에 보고해 주세요. 또는 고객센터(1544-0000)로 연락하시면 신속하게 지원해 드립니다.',
    category: 'delivery',
  },
  {
    id: 'faq2',
    question: '정산은 언제 이루어지나요?',
    answer:
      '정산은 매주 월요일에 이루어지며, 전주 일요일까지의 배송건에 대해 정산됩니다. 입금은 월요일 오후 6시 이전에 완료됩니다.',
    category: 'payment',
  },
  {
    id: 'faq3',
    question: '배송 완료 후 고객이 차량 상태에 대해 이의를 제기하면 어떻게 해야 하나요?',
    answer:
      '배송 전후 차량 상태 사진을 꼭 촬영해 주세요. 이의 제기 시 앱에서 제공하는 증빙 자료 제출 기능을 통해 사진을 등록하고 상황을 설명해 주시면 운영팀에서 조치해 드립니다.',
    category: 'delivery',
  },
  {
    id: 'faq4',
    question: '앱이 자꾸 종료되거나 오류가 발생합니다.',
    answer:
      '앱 설정에서 캐시를 삭제하거나, 앱을 재설치해 보세요. 문제가 지속되면 기기 정보와 함께 고객센터에 문의해 주세요.',
    category: 'app',
  },
  {
    id: 'faq5',
    question: '배송 가능 지역은 어디인가요?',
    answer:
      '현재 서울, 경기, 인천 지역에서 서비스를 제공하고 있습니다. 특정 지역 확인은 앱 내 [배송 가능 지역] 메뉴에서 확인하실 수 있습니다.',
    category: 'general',
  },
  {
    id: 'faq6',
    question: '출발지에 도착했는데 차량이 없으면 어떻게 해야 하나요?',
    answer:
      '앱에서 도착 알림을 보낸 후 10분간 대기해 주세요. 이후에도 고객이 나타나지 않으면 고객센터로 연락하여 상황을 알려주시기 바랍니다.',
    category: 'delivery',
  },
];

// 연락처 정보
const CONTACT_INFO: ContactInfo[] = [
  {
    type: 'phone',
    icon: 'phone',
    title: '고객센터',
    description: '평일 9:00 - 18:00 (공휴일 제외)',
    action: '전화하기',
    value: '1544-0000',
  },
  {
    type: 'email',
    icon: 'email',
    title: '이메일 문의',
    description: '24시간 접수 가능, 영업일 기준 1일 내 답변',
    action: '이메일 보내기',
    value: 'driver.support@cargoro.com',
  },
  {
    type: 'chat',
    icon: 'chat',
    title: '실시간 채팅',
    description: '평일 9:00 - 22:00, 주말/공휴일 9:00 - 18:00',
    action: '채팅 시작하기',
    value: 'chat',
  },
];

const SupportScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'report'>('faq');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'general' | 'payment' | 'delivery' | 'app'
  >('all');
  const [isLoading, setIsLoading] = useState(false);

  // 문의하기 폼 상태
  const [inquiryForm, setInquiryForm] = useState({
    title: '',
    description: '',
    category: '배송 관련',
  });

  // 문의 카테고리 목록
  const inquiryCategories = ['배송 관련', '정산 관련', '앱 오류', '계정 관련', '기타'];

  // FAQ 항목 토글
  const toggleFaqItem = (id: string) => {
    if (expandedFaqId === id) {
      setExpandedFaqId(null);
    } else {
      setExpandedFaqId(id);
    }
  };

  // 필터링된 FAQ 목록
  const filteredFaqs = FAQ_DATA.filter(
    faq => activeCategory === 'all' || faq.category === activeCategory
  );

  // 문의하기 폼 제출
  const handleSubmitInquiry = async () => {
    if (!inquiryForm.title.trim() || !inquiryForm.description.trim()) {
      Alert.alert('필수 정보', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 실제 구현 시 API 호출로 대체
      // await api-client.post('/support/inquiry', inquiryForm);

      // 임시 처리
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        '문의가 접수되었습니다',
        '담당자 확인 후 영업일 기준 1일 이내에 답변 드리겠습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setInquiryForm({
                title: '',
                description: '',
                category: '배송 관련',
              });
              setActiveTab('contact');
            },
          },
        ]
      );
    } catch (error) {
      console.error('문의 제출 오류:', error);
      Alert.alert('오류', '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 연락 방법 실행
  const handleContact = (contact: ContactInfo) => {
    switch (contact.type) {
      case 'phone':
        Linking.openURL(`tel:${contact.value}`);
        break;
      case 'email':
        Linking.openURL(
          `mailto:${contact.value}?subject=배송기사 문의&body=안녕하세요, 카고로 배송기사 앱 관련 문의입니다.`
        );
        break;
      case 'chat':
        Alert.alert('알림', '채팅 상담이 곧 시작됩니다.');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>고객센터</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'faq' && styles.activeTabButton]}
          onPress={() => setActiveTab('faq')}
        >
          <Icon
            name="frequently-asked-questions"
            size={20}
            color={activeTab === 'faq' ? '#3498db' : '#7f8c8d'}
          />
          <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
            자주 묻는 질문
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'contact' && styles.activeTabButton]}
          onPress={() => setActiveTab('contact')}
        >
          <Icon name="headset" size={20} color={activeTab === 'contact' ? '#3498db' : '#7f8c8d'} />
          <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
            연락처
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'report' && styles.activeTabButton]}
          onPress={() => setActiveTab('report')}
        >
          <Icon
            name="message-text"
            size={20}
            color={activeTab === 'report' ? '#3498db' : '#7f8c8d'}
          />
          <Text style={[styles.tabText, activeTab === 'report' && styles.activeTabText]}>
            문의하기
          </Text>
        </TouchableOpacity>
      </View>

      {/* FAQ 내용 */}
      {activeTab === 'faq' && (
        <View style={styles.contentContainer}>
          {/* FAQ 카테고리 필터 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                activeCategory === 'all' && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory('all')}
            >
              <Text
                style={[styles.categoryText, activeCategory === 'all' && styles.activeCategoryText]}
              >
                전체
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryButton,
                activeCategory === 'general' && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory('general')}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === 'general' && styles.activeCategoryText,
                ]}
              >
                일반
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryButton,
                activeCategory === 'payment' && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory('payment')}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === 'payment' && styles.activeCategoryText,
                ]}
              >
                정산
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryButton,
                activeCategory === 'delivery' && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory('delivery')}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === 'delivery' && styles.activeCategoryText,
                ]}
              >
                배송
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryButton,
                activeCategory === 'app' && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory('app')}
            >
              <Text
                style={[styles.categoryText, activeCategory === 'app' && styles.activeCategoryText]}
              >
                앱 사용
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* FAQ 목록 */}
          <ScrollView style={styles.faqListContainer}>
            {filteredFaqs.map(faq => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqItem}
                onPress={() => toggleFaqItem(faq.id)}
              >
                <View style={styles.faqQuestionContainer}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Icon
                    name={expandedFaqId === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#7f8c8d"
                  />
                </View>

                {expandedFaqId === faq.id && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {filteredFaqs.length === 0 && (
              <View style={styles.emptyFaqContainer}>
                <Icon name="help-circle" size={48} color="#bdc3c7" />
                <Text style={styles.emptyFaqText}>해당 카테고리에 등록된 FAQ가 없습니다.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* 연락처 내용 */}
      {activeTab === 'contact' && (
        <View style={styles.contentContainer}>
          <Text style={styles.contactTitle}>문제가 발생하셨나요?</Text>
          <Text style={styles.contactSubtitle}>아래 연락처로 문의해 주세요.</Text>

          {CONTACT_INFO.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactCard}
              onPress={() => handleContact(contact)}
            >
              <View style={styles.contactIconContainer}>
                <Icon name={contact.icon} size={24} color="#3498db" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.title}</Text>
                <Text style={styles.contactDescription}>{contact.description}</Text>
                <Text style={styles.contactValue}>{contact.value}</Text>
              </View>
              <TouchableOpacity
                style={styles.contactActionButton}
                onPress={() => handleContact(contact)}
              >
                <Text style={styles.contactActionText}>{contact.action}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <View style={styles.emergencyContainer}>
            <Icon name="alert" size={22} color="#e74c3c" style={{ marginRight: 8 }} />
            <Text style={styles.emergencyText}>
              긴급 상황 발생 시 24시간 핫라인으로 연락해 주세요:
              <Text style={{ fontWeight: 'bold', color: '#e74c3c' }}> 010-9999-9999</Text>
            </Text>
          </View>
        </View>
      )}

      {/* 문의하기 내용 */}
      {activeTab === 'report' && (
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.formTitle}>문의하기</Text>
          <Text style={styles.formSubtitle}>문의 사항을 상세히 작성해 주세요.</Text>

          <View style={styles.formContainer}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>카테고리 *</Text>
              <View style={styles.categorySelectContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {inquiryCategories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.inquiryCategoryButton,
                        inquiryForm.category === category && styles.activeInquiryCategoryButton,
                      ]}
                      onPress={() => setInquiryForm({ ...inquiryForm, category })}
                    >
                      <Text
                        style={[
                          styles.inquiryCategoryText,
                          inquiryForm.category === category && styles.activeInquiryCategoryText,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>제목 *</Text>
              <TextInput
                style={styles.formInput}
                value={inquiryForm.title}
                onChangeText={text => setInquiryForm({ ...inquiryForm, title: text })}
                placeholder="제목을 입력하세요"
                placeholderTextColor="#95a5a6"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>내용 *</Text>
              <TextInput
                style={styles.formTextarea}
                value={inquiryForm.description}
                onChangeText={text => setInquiryForm({ ...inquiryForm, description: text })}
                placeholder="문의 내용을 상세히 입력해주세요"
                placeholderTextColor="#95a5a6"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmitInquiry}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>문의 제출하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: '#e3f2fd',
  },
  categoryText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  activeCategoryText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  faqListContainer: {
    flex: 1,
    padding: 16,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  faqAnswerContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  emptyFaqContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyFaqText: {
    marginTop: 12,
    color: '#7f8c8d',
    fontSize: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 24,
    marginHorizontal: 16,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  contactActionButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  contactActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emergencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f2',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  emergencyText: {
    flex: 1,
    fontSize: 13,
    color: '#34495e',
    lineHeight: 18,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 24,
    marginHorizontal: 16,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#2c3e50',
  },
  formTextarea: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#2c3e50',
    minHeight: 120,
  },
  categorySelectContainer: {
    marginBottom: 8,
  },
  inquiryCategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeInquiryCategoryButton: {
    backgroundColor: '#e3f2fd',
  },
  inquiryCategoryText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  activeInquiryCategoryText: {
    color: '#3498db',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SupportScreen;
