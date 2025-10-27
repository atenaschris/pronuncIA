import { RNPText } from '@/components/ui/RNPText';
import { useAppTheme } from '@/components/ui/theme';
import { getDateKey, PerformanceLog, summarizeLifetimeFromLog } from '@/lib/helpers/performance-utils';
import { LessonType, useLessonStore } from '@/lib/store/lesson-store';
import React, { useMemo, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { Button, Card, SegmentedButtons, Switch, TextInput, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type RangeKey = 'daily' | 'weekly' | 'monthly' | 'lifetime' | 'custom';

const windowWidth = Dimensions.get('window').width;
// Account for ScrollView padding (16 * 2) and Card.Content padding (16 * 2)
// to avoid charts overflowing horizontally inside cards on small screens.
const chartWidth = Math.max(0, windowWidth - 64);

// Convert hex colors to rgba strings for chart-kit opacity handling
function toRgba(hexOrCss: string, opacity = 1): string {
  if (typeof hexOrCss !== 'string') return '#000000';
  const c = hexOrCss.trim();
  if (c.startsWith('#')) {
    const hex = c.replace('#', '');
    const full = hex.length === 3
      ? hex.split('').map(h => h + h).join('')
      : hex.padEnd(6, '0').slice(0, 6);
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // If already rgb/rgba/hsl or named color, return as-is (opacity ignored)
  return c;
}

function makeDateKeys(range: RangeKey, customFrom?: string, customTo?: string): string[] {
  const today = new Date();
  const keys: string[] = [];
  if (range === 'custom' && customFrom && customTo) {
    let start = new Date(customFrom);
    let end = new Date(customTo);
    // Basic validation: if invalid dates, fall back to last 7 days
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const days = 7;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        keys.push(getDateKey(d));
      }
      return keys;
    }
    // If range reversed, swap
    if (start > end) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay) + 1);
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      keys.push(getDateKey(d));
    }
    return keys;
  }
  const days = range === 'weekly' ? 7 : range === 'monthly' ? 30 : 1;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    keys.push(getDateKey(d));
  }
  return keys;
}

function aggregateRange(log: PerformanceLog | undefined, range: RangeKey, customFrom?: string, customTo?: string, smooth?: boolean) {
  const dateKeys = range === 'lifetime' ? Object.keys(log || {}).sort() : makeDateKeys(range, customFrom, customTo);

  const dailyRaw = dateKeys.map((key) => {
    const entry = log?.[key];
    const accuracy = entry && entry.accuracyCount > 0 ? (entry.accuracyTotal / entry.accuracyCount) * 100 : 0;
    const completed = entry?.lessonsCompleted || 0;
    const seen = entry?.lessonsSeen || 0;
    const xp = entry?.xpEarned || 0;
    const freezesUsed = entry?.streakFreezesUsed || 0;
    const vocab = (entry?.vocabularyReviewItems || []).length;
    const pron = (entry?.pronunciationReviewItems || []).length;
    return { key, accuracy, completed, seen, xp, freezesUsed, vocab, pron };
  });

  // Optional moving average smoothing over 7 entries
  const daily = smooth && dailyRaw.length > 0
    ? dailyRaw.map((_, idx) => {
        const start = Math.max(0, idx - 3);
        const end = Math.min(dailyRaw.length - 1, idx + 3);
        const span = end - start + 1;
        const slice = dailyRaw.slice(start, end + 1);
        const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / span;
        return {
          key: dailyRaw[idx].key,
          accuracy: avg(slice.map(s => s.accuracy)),
          completed: avg(slice.map(s => s.completed)),
          seen: avg(slice.map(s => s.seen)),
          xp: avg(slice.map(s => s.xp)),
          freezesUsed: avg(slice.map(s => s.freezesUsed)),
          vocab: avg(slice.map(s => s.vocab)),
          pron: avg(slice.map(s => s.pron)),
        };
      })
    : dailyRaw;

  // Aggregate lesson type distribution across the range
  const byTypeTotals: Record<LessonType, number> = {
    vocabulary: 0,
    listening: 0,
    pronunciation: 0,
    roleplay: 0,
    shadowing: 0,
    voice_journaling: 0,
    word_pairs: 0,
  };

  dateKeys.forEach((key) => {
    const entry = log?.[key];
    if (entry && entry.byType) {
      (Object.keys(byTypeTotals) as LessonType[]).forEach((lt) => {
        byTypeTotals[lt] += entry.byType[lt]?.completed || 0;
      });
    }
  });

  const accuracyAvg = daily.length > 0
    ? daily.reduce((sum, d) => sum + d.accuracy, 0) / daily.length
    : 0;

  const totalCompleted = daily.reduce((sum, d) => sum + d.completed, 0);
  const totalSeen = daily.reduce((sum, d) => sum + d.seen, 0);
  const totalXp = daily.reduce((sum, d) => sum + d.xp, 0);
  const totalVocabBacklog = daily.reduce((sum, d) => sum + d.vocab, 0);
  const totalPronBacklog = daily.reduce((sum, d) => sum + d.pron, 0);

  // Accuracy per type across range
  const typeAccuracy: Record<LessonType, number> = {
    vocabulary: 0,
    listening: 0,
    pronunciation: 0,
    roleplay: 0,
    shadowing: 0,
    voice_journaling: 0,
    word_pairs: 0,
  };
  const typeAccCounts: Record<LessonType, number> = {
    vocabulary: 0,
    listening: 0,
    pronunciation: 0,
    roleplay: 0,
    shadowing: 0,
    voice_journaling: 0,
    word_pairs: 0,
  };
  dateKeys.forEach((key) => {
    const entry = log?.[key];
    if (entry && entry.byType) {
      (Object.keys(typeAccuracy) as LessonType[]).forEach((lt) => {
        const accTot = entry.byType[lt]?.accuracyTotal || 0;
        const accCount = entry.byType[lt]?.accuracyCount || 0;
        typeAccuracy[lt] += accTot;
        typeAccCounts[lt] += accCount;
      });
    }
  });
  (Object.keys(typeAccuracy) as LessonType[]).forEach((lt) => {
    typeAccuracy[lt] = typeAccCounts[lt] > 0 ? (typeAccuracy[lt] / typeAccCounts[lt]) : 0;
  });

  return { daily, byTypeTotals, typeAccuracy, accuracyAvg, totalCompleted, totalSeen, totalXp, totalVocabBacklog, totalPronBacklog, dateKeys };
}

export default function AnalyticsScreen() {
  const theme = useAppTheme();
  // Subscribe to individual primitives to avoid new object snapshots
  const performanceLog = useLessonStore((s) => s.performanceLog);
  const lifetimeAccuracyTotal = useLessonStore((s) => s.lifetimeAccuracyTotal);
  const lifetimeAccuracyCount = useLessonStore((s) => s.lifetimeAccuracyCount);
  const lifetimeLessonsCompleted = useLessonStore((s) => s.lifetimeLessonsCompleted);
  const lifetimeLessonsSeen = useLessonStore((s) => s.lifetimeLessonsSeen);
  const getPerformanceMetrics = useLessonStore((s) => s.getPerformanceMetrics);

  const [range, setRange] = useState<RangeKey>('weekly');
  const [smooth, setSmooth] = useState<boolean>(true);
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  const lifetimeAvgAccuracy = useMemo(() => {
    return lifetimeAccuracyCount > 0 ? (lifetimeAccuracyTotal / lifetimeAccuracyCount) * 100 : 0;
  }, [lifetimeAccuracyTotal, lifetimeAccuracyCount]);

  const data = useMemo(() => aggregateRange(performanceLog, range, customFrom, customTo, smooth), [performanceLog, range, customFrom, customTo, smooth]);

  // Lifetime summary for fallback cards
  const lifetimeSummary = useMemo(() => summarizeLifetimeFromLog(performanceLog || {}), [performanceLog]);

  // Today-first metrics snapshot, falling back to lifetime when no daily evidence
  const effectiveMetrics = useMemo(() => getPerformanceMetrics(), [getPerformanceMetrics, performanceLog, lifetimeAccuracyTotal, lifetimeAccuracyCount, lifetimeLessonsCompleted, lifetimeLessonsSeen]);

  // Chart datasets (memoized to stabilize references and avoid redundant work)
  const accuracyTrend = useMemo(() => data.daily.map((d) => d.accuracy), [data]);
  const completedTrend = useMemo(() => data.daily.map((d) => d.completed), [data]);
  const xpTrend = useMemo(() => data.daily.map((d) => d.xp), [data]);
  const freezesTrend = useMemo(() => data.daily.map((d) => d.freezesUsed), [data]);
  const vocabBacklogTrend = useMemo(() => data.daily.map((d) => d.vocab), [data]);
  const pronBacklogTrend = useMemo(() => data.daily.map((d) => d.pron), [data]);
  const typeDistribution = useMemo(() => (
    (Object.keys(data.byTypeTotals) as LessonType[])
      .map((lt) => ({ name: lt, population: data.byTypeTotals[lt], color: undefined, legendFontColor: theme.colors.onSurface, legendFontSize: 12 }))
      .filter((item) => item.population > 0)
  ), [data, theme]);

  // Precompute safe colors for pie slices to avoid undefined access
  const pieSliceColors: string[] = useMemo(() => {
    const c = theme.colors;
    const pick = (key: string, fallback: string) => {
      const v = (theme.colors as any)[key];
      return typeof v === 'string' ? v : fallback;
    };
    return [
      c.primary,
      pick('tertiary', c.secondary),
      c.secondary,
      c.outline,
      c.error,
      pick('inversePrimary', c.primary),
      c.surface,
    ];
  }, [theme]);

  const typeAccuracyBars = useMemo(() => (
    (Object.keys(data.typeAccuracy) as LessonType[])
      .map((lt) => ({ label: lt, value: Number(data.typeAccuracy[lt].toFixed(0)) }))
      .filter((item) => item.value > 0)
  ), [data]);

  const titleLabel = useMemo(() => range.charAt(0).toUpperCase() + range.slice(1), [range]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <RNPText variant="headlineLarge">Analytics</RNPText>
        </View>

        <View style={styles.segmentedWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentedScrollContent}>
            <SegmentedButtons
              value={range}
              onValueChange={(v) => setRange(v as RangeKey)}
              style={styles.segmented}
              buttons={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'lifetime', label: 'Lifetime' },
                { value: 'custom', label: 'Custom' },
              ]}
            />
          </ScrollView>
        </View>

        {range === 'custom' && (
          <Card style={styles.customRangeCard}>
            <Card.Content>
              <RNPText variant="titleMedium">Custom Range</RNPText>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <TextInput
                  label="From (YYYY-MM-DD)"
                  value={customFrom}
                  onChangeText={setCustomFrom}
                  style={{ flex: 1 }}
                  mode="outlined"
                />
                <TextInput
                  label="To (YYYY-MM-DD)"
                  value={customTo}
                  onChangeText={setCustomTo}
                  style={{ flex: 1 }}
                  mode="outlined"
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <RNPText variant="bodyMedium" style={{ marginRight: 8 }}>Smooth</RNPText>
                <Switch value={smooth} onValueChange={setSmooth} />
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Avg Accuracy ({titleLabel})</RNPText>
            <RNPText variant="displaySmall">{range === 'lifetime' ? lifetimeAvgAccuracy.toFixed(0) : data.accuracyAvg.toFixed(0)}%</RNPText>
          </Card.Content>
        </Card>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Lessons Completed ({titleLabel})</RNPText>
            <RNPText variant="displaySmall">{range === 'lifetime' ? (lifetimeLessonsCompleted || lifetimeSummary.lessonsCompleted || 0) : data.totalCompleted}</RNPText>
          </Card.Content>
        </Card>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Lessons Seen ({titleLabel})</RNPText>
            <RNPText variant="displaySmall">{range === 'lifetime' ? (lifetimeLessonsSeen || lifetimeSummary.lessonsSeen || 0) : data.totalSeen}</RNPText>
          </Card.Content>
        </Card>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <RNPText variant="titleMedium">XP Earned ({titleLabel})</RNPText>
            <RNPText variant="displaySmall">{range === 'lifetime' ? (lifetimeSummary.xpEarnedLifetime || 0) : Number(data.totalXp.toFixed(0))}</RNPText>
          </Card.Content>
        </Card>
        </View>

        {/* Today-first snapshot with lifetime fallback */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Performance Snapshot (Today-first)</RNPText>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              <RNPText variant="titleLarge">Completion: {effectiveMetrics.completionRate}%</RNPText>
              <RNPText variant="titleLarge">Accuracy: {effectiveMetrics.averageAccuracy}%</RNPText>
            </View>
            <View style={{ marginTop: 12 }}>
              <RNPText variant="titleMedium">Preferred Lesson Types</RNPText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {effectiveMetrics.preferredLessonTypes.length > 0 ? (
                  effectiveMetrics.preferredLessonTypes.map((t) => (
                    <Chip key={`pref-${t}`} compact>{t}</Chip>
                  ))
                ) : (
                  <RNPText variant="bodyMedium">None yet</RNPText>
                )}
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <RNPText variant="titleMedium">Struggling Areas</RNPText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {effectiveMetrics.strugglingAreas.length > 0 ? (
                  effectiveMetrics.strugglingAreas.map((t) => (
                    <Chip key={`struggle-${t}`} compact mode="outlined">{t}</Chip>
                  ))
                ) : (
                  <RNPText variant="bodyMedium">None yet</RNPText>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Accuracy Trend ({titleLabel})</RNPText>
            <LineChart
              data={{ labels: data.daily.map((d) => d.key.slice(5)), datasets: [{ data: accuracyTrend, color: (opacity = 1) => toRgba(theme.colors.primary, opacity) }] }}
              width={chartWidth}
              height={220}
              yAxisSuffix="%"
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => toRgba(theme.colors.primary, opacity),
                labelColor: (opacity = 1) => toRgba(theme.colors.onSurface, opacity),
                decimalPlaces: 0,
              }}
              bezier
              style={{ marginVertical: 8 }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Lessons Completed ({titleLabel})</RNPText>
            <BarChart
              data={{ labels: data.daily.map((d) => d.key.slice(5)), datasets: [{ data: completedTrend, color: (opacity = 1) => toRgba(theme.colors.primary, opacity) }] }}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => toRgba(theme.colors.primary, opacity),
                labelColor: (opacity = 1) => toRgba(theme.colors.onSurface, opacity),
                decimalPlaces: 0,
              }}
              style={{ marginVertical: 8 }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <RNPText variant="titleMedium">XP Trend ({titleLabel})</RNPText>
            <LineChart
              data={{ labels: data.daily.map((d) => d.key.slice(5)), datasets: [{ data: xpTrend, color: (opacity = 1) => toRgba(theme.colors.secondary, opacity) }] }}
              width={chartWidth}
              height={220}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => toRgba(theme.colors.secondary, opacity),
                labelColor: (opacity = 1) => toRgba(theme.colors.onSurface, opacity),
                decimalPlaces: 0,
              }}
              bezier
              style={{ marginVertical: 8 }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Freeze Usage ({titleLabel})</RNPText>
            <BarChart
              data={{ labels: data.daily.map((d) => d.key.slice(5)), datasets: [{ data: freezesTrend, color: (opacity = 1) => toRgba(theme.colors.secondary, opacity) }] }}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => toRgba(theme.colors.secondary, opacity),
                labelColor: (opacity = 1) => toRgba(theme.colors.onSurface, opacity),
                decimalPlaces: 0,
              }}
              style={{ marginVertical: 8 }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Review Backlog ({titleLabel})</RNPText>
            <LineChart
              data={{
                labels: data.daily.map((d) => d.key.slice(5)),
                datasets: [
                  { data: vocabBacklogTrend, color: (opacity = 1) => toRgba(theme.colors.primary, opacity) },
                  { data: pronBacklogTrend, color: (opacity = 1) => toRgba(theme.colors.error, opacity) },
                ],
                legend: ['Vocabulary', 'Pronunciation'],
              }}
              width={chartWidth}
              height={220}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => toRgba(theme.colors.primary, opacity),
                labelColor: (opacity = 1) => toRgba(theme.colors.onSurface, opacity),
                decimalPlaces: 0,
              }}
              bezier
              style={{ marginVertical: 8 }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Lesson Type Distribution ({titleLabel})</RNPText>
            {typeDistribution.length > 0 ? (
              <PieChart
                data={typeDistribution.map((slice, idx) => ({
                  ...slice,
                  color: pieSliceColors[idx % pieSliceColors.length],
                }))}
                width={chartWidth}
                height={220}
                accessor={"population"}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => toRgba(theme.colors.primary, opacity),
                  labelColor: (opacity = 1) => toRgba(theme.colors.onSurface, opacity),
                  decimalPlaces: 0,
                }}
                backgroundColor={"transparent"}
                paddingLeft={"8"}
                center={[0, 0]}
              />
            ) : (
              <RNPText variant="bodyMedium" style={{ marginTop: 8 }}>No activity in this range yet.</RNPText>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <RNPText variant="titleMedium">Accuracy by Lesson Type ({titleLabel})</RNPText>
            {typeAccuracyBars.length > 0 ? (
              <BarChart
                data={{
                  labels: typeAccuracyBars.map(b => b.label),
                  datasets: [{ data: typeAccuracyBars.map(b => b.value), color: (opacity = 1) => toRgba(((theme.colors as any).tertiary as string) || theme.colors.primary, opacity) }],
                }}
                width={chartWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => toRgba(((theme.colors as any).tertiary as string) || theme.colors.primary, opacity),
                  labelColor: (opacity = 1) => toRgba(theme.colors.onSurface, opacity),
                  decimalPlaces: 0,
                }}
                style={{ marginVertical: 8 }}
              />
            ) : (
              <RNPText variant="bodyMedium" style={{ marginTop: 8 }}>No accuracy data yet.</RNPText>
            )}
          </Card.Content>
        </Card>

        {Platform.OS === 'web' && (
          <View style={{ marginVertical: 8 }}>
            <Button mode="outlined" onPress={() => {
              // Simple CSV export for web via clipboard
              const rows = [['Date','Accuracy','Completed','Seen','XP','FreezesUsed','VocabBacklog','PronBacklog']].concat(
                data.daily.map(d => [d.key, d.accuracy.toFixed(0), d.completed.toFixed(0), d.seen.toFixed(0), d.xp.toFixed(0), d.freezesUsed?.toFixed(0) ?? '0', d.vocab.toFixed(0), d.pron.toFixed(0)])
              );
              const csv = rows.map(r => r.join(',')).join('\n');
              try {
                // @ts-ignore
                navigator.clipboard.writeText(csv);
                alert('CSV copied to clipboard');
              } catch (e) {
                console.log('Clipboard not available', e);
              }
            }}>Copy CSV</Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  segmented: {
    marginVertical: 8,
  },
  segmentedWrapper: {
    width: '100%',
  },
  segmentedScrollContent: {
    paddingHorizontal: 0,
  },
  customRangeCard: {
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'column',
    gap: 12,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: '48%',
  },
  chartCard: {
    width: '100%',
  },
});