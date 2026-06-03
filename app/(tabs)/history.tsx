import {
  DailyMealSummary,
  deleteMealsByDate,
  getDailyMealSummaries,
  MacroMetric,
} from '@/storage/meals';
import { colors, globalStyles } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const metricOptions: { key: MacroMetric; label: string; unit: string }[] = [
  { key: 'calories', label: 'Calories', unit: 'cal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

export default function HistoryScreen() {
  const [summaries, setSummaries] = useState<DailyMealSummary[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MacroMetric>('calories');
  const [isMetricMenuOpen, setIsMetricMenuOpen] = useState(false);

  const selectedOption =
    metricOptions.find((option) => option.key === selectedMetric) ??
    metricOptions[0];

  const maxMetricValue = useMemo(
    () =>
      Math.max(
        ...summaries.map((summary) => summary.totals[selectedMetric]),
        1,
      ),
    [selectedMetric, summaries],
  );

  const loadSummaries = async () => {
    const data = await getDailyMealSummaries();
    setSummaries(data);
  };

  const handleDeleteDate = (summary: DailyMealSummary) => {
    Alert.alert(
      'Delete Day',
      `Delete all meals from ${formatDate(summary.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMealsByDate(summary.date);
            await loadSummaries();
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadSummaries();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>History</Text>

      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Daily count</Text>

          <Pressable
            style={styles.metricButton}
            onPress={() => setIsMetricMenuOpen(true)}
          >
            <Text style={styles.metricButtonText}>{selectedOption.label}</Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={colors.text}
            />
          </Pressable>
        </View>

        {summaries.length === 0 ? (
          <Text style={styles.empty}>Past days will appear here.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.barList}
          >
            {summaries.map((summary) => {
              const value = summary.totals[selectedMetric];
              const barHeight = Math.max((value / maxMetricValue) * 130, 8);

              return (
                <View key={summary.date} style={styles.barItem}>
                  <Text style={styles.barValue}>
                    {value}
                    {selectedOption.unit === 'g' ? 'g' : ''}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: barHeight }]} />
                  </View>
                  <Text style={styles.barDate}>
                    {new Date(`${summary.date}T00:00:00`).toLocaleDateString(
                      'en',
                      { month: 'short', day: 'numeric' },
                    )}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      <Text style={styles.sectionTitle}>Past days</Text>

      {summaries.length === 0 ? (
        <Text style={styles.empty}>No previous day records yet.</Text>
      ) : (
        summaries.map((summary) => (
          <View key={summary.date} style={styles.dayCard}>
            <View style={styles.dayCardHeader}>
              <View>
                <Text style={styles.dayDate}>{formatDate(summary.date)}</Text>
                <Text style={styles.mealCount}>
                  {summary.mealCount} meal{summary.mealCount === 1 ? '' : 's'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteDate(summary)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.alert} />
              </TouchableOpacity>
            </View>

            <View style={styles.metricGrid}>
              <MetricPill label="Calories" value={`${summary.totals.calories}`} />
              <MetricPill label="Protein" value={`${summary.totals.protein}g`} />
              <MetricPill label="Carbs" value={`${summary.totals.carbs}g`} />
              <MetricPill label="Fat" value={`${summary.totals.fat}g`} />
            </View>
          </View>
        ))
      )}

      <Modal
        visible={isMetricMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMetricMenuOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsMetricMenuOpen(false)}
        >
          <View style={styles.metricMenu}>
            {metricOptions.map((option) => (
              <Pressable
                key={option.key}
                style={styles.metricOption}
                onPress={() => {
                  setSelectedMetric(option.key);
                  setIsMetricMenuOpen(false);
                }}
              >
                <Text style={styles.metricOptionText}>{option.label}</Text>
                {selectedMetric === option.key && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

type MetricPillProps = {
  label: string;
  value: string;
};

function MetricPill({ label, value }: MetricPillProps) {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chartSection: {
    marginTop: 28,
    marginBottom: 28,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  metricButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  metricButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  barList: {
    alignItems: 'flex-end',
    gap: 14,
    minHeight: 188,
    paddingRight: 4,
  },
  barItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 58,
  },
  barValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  barTrack: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 130,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 30,
  },
  barFill: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: '100%',
  },
  barDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 14,
    padding: 16,
  },
  dayCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dayDate: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  mealCount: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  deleteButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricPill: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    width: '47%',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  modalOverlay: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 110,
  },
  metricMenu: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    minWidth: 180,
    paddingVertical: 6,
  },
  metricOption: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricOptionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
