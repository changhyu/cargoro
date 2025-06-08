import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useStore } from '../../state';
import { getDiagnosticData } from '../../services/diagnostic-service';
import { DiagnosticResult } from '../../types/diagnostic';

/**
 * 차량 진단 화면 컴포넌트
 * OBD2 및 센서 데이터를 활용한 차량 상태 진단 및 분석
 */
export const DiagnosisScreen = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { vehicleId } = useStore(state => state.selectedVehicle);

  useEffect(() => {
    const fetchData = async () => {
      if (!vehicleId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getDiagnosticData(vehicleId);
        setDiagnosticResults(data);
      } catch (err) {
        setError('진단 데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('진단 데이터 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  const startNewDiagnosis = async () => {
    setIsLoading(true);
    // 실제 OBD2 스캔 로직 구현 필요
    setTimeout(() => {
      setIsLoading(false);
      // 테스트 데이터로 대체
      setDiagnosticResults([
        {
          code: 'P0300',
          description: '랜덤/다중 실린더 실화 감지됨',
          severity: 'high',
          recommendedAction: '점화 시스템 점검 필요',
        },
        {
          code: 'P0171',
          description: '연료 시스템 농도 희박 - 뱅크 1',
          severity: 'medium',
          recommendedAction: '연료 시스템 및 센서 점검 필요',
        },
      ]);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>차량 진단</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>진단 데이터를 분석 중입니다...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setError(null)}>
            <Text style={styles.buttonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.resultContainer}>
            {diagnosticResults.length > 0 ? (
              diagnosticResults.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.codeText}>{result.code}</Text>
                    <Text
                      style={[
                        styles.severityBadge,
                        result.severity === 'high'
                          ? styles.highSeverity
                          : result.severity === 'medium'
                            ? styles.mediumSeverity
                            : styles.lowSeverity,
                      ]}
                    >
                      {result.severity === 'high'
                        ? '심각'
                        : result.severity === 'medium'
                          ? '중간'
                          : '낮음'}
                    </Text>
                  </View>
                  <Text style={styles.descriptionText}>{result.description}</Text>
                  <Text style={styles.recommendationText}>{result.recommendedAction}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>진단 결과가 없습니다.</Text>
                <Text style={styles.emptyStateSubText}>
                  새 진단을 시작하거나 과거 진단 기록을 확인하세요.
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.actionButton} onPress={startNewDiagnosis}>
            <Text style={styles.actionButtonText}>새 진단 시작</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    marginBottom: 16,
  },
  resultItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007aff',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  highSeverity: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  },
  mediumSeverity: {
    backgroundColor: '#fff8e1',
    color: '#ff8f00',
  },
  lowSeverity: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  descriptionText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333333',
  },
  recommendationText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyStateSubText: {
    color: '#666666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#007aff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DiagnosisScreen;
