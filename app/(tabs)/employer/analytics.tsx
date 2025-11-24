import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../lib/auth-context';
import { getEmployerAnalytics } from '../../../lib/services/employer-services';
import { withEmployerProtection } from '../../../lib/employer-protection';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplicationsThisWeek: number;
  applicationsByStatus: {
    pending: number;
    shortlisted: number;
    rejected: number;
    hired: number;
  };
  jobPerformance: {
    jobId: string;
    title: string;
    views: number;
    applications: number;
    conversionRate: number;
  }[];
  applicationsTrend: {
    date: string;
    count: number;
  }[];
}

function AnalyticsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '3 Months' },
    { key: '1y', label: '1 Year' },
  ];

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      console.log('Loading analytics for employer:', currentUser?.uid, 'period:', selectedPeriod);
      
      // Use real Firebase service to fetch analytics data
      const analyticsData = await getEmployerAnalytics(selectedPeriod);
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A389" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load analytics</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Period Filter */}
      <View style={styles.periodFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.periodFilters}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodFilter,
                  selectedPeriod === period.key && styles.periodFilterActive
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.periodFilterText,
                  selectedPeriod === period.key && styles.periodFilterTextActive
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#00A389']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Overview Cards */}
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statCardContent}>
                  <Icon name="work" size={24} color="#00A389" />
                  <View style={styles.statInfo}>
                    <Text style={styles.statValue}>{analytics.totalJobs}</Text>
                    <Text style={styles.statLabel}>Total Jobs</Text>
                  </View>
                </View>
                <Text style={styles.statSubtext}>
                  {analytics.activeJobs} active
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statCardContent}>
                  <Icon name="people" size={24} color="#3B82F6" />
                  <View style={styles.statInfo}>
                    <Text style={styles.statValue}>{analytics.totalApplications}</Text>
                    <Text style={styles.statLabel}>Applications</Text>
                  </View>
                </View>
                <Text style={[styles.statSubtext, { color: '#10B981' }]}>
                  +{analytics.newApplicationsThisWeek} this week
                </Text>
              </View>
            </View>
          </View>

          {/* Application Status Distribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Application Status</Text>
            <View style={styles.statusGrid}>
              {Object.entries(analytics.applicationsByStatus).map(([status, count]) => {
                const statusConfig = {
                  pending: { color: '#F59E0B', label: 'Pending', icon: 'hourglass-empty' },
                  shortlisted: { color: '#10B981', label: 'Shortlisted', icon: 'star' },
                  rejected: { color: '#EF4444', label: 'Rejected', icon: 'close' },
                  hired: { color: '#8B5CF6', label: 'Hired', icon: 'check-circle' },
                }[status] || { color: '#6B7280', label: status, icon: 'help' };

                return (
                  <View key={status} style={styles.statusCard}>
                    <Icon name={statusConfig.icon} size={20} color={statusConfig.color} />
                    <Text style={styles.statusCount}>{count}</Text>
                    <Text style={styles.statusLabel}>{statusConfig.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Job Performance */}
          {analytics.jobPerformance.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Performance</Text>
              <View style={styles.performanceCards}>
                {analytics.jobPerformance.map((job) => (
                  <View key={job.jobId} style={styles.performanceCard}>
                    <Text style={styles.performanceJobTitle}>{job.title}</Text>
                    
                    <View style={styles.performanceMetrics}>
                      <View style={styles.performanceMetric}>
                        <Icon name="people" size={16} color="#6B7280" />
                        <Text style={styles.performanceMetricText}>
                          {job.applications} {job.applications === 1 ? 'application' : 'applications'}
                        </Text>
                      </View>
                      
                      <View style={styles.performanceMetric}>
                        <Icon name="trending-up" size={16} color="#6B7280" />
                        <Text style={styles.performanceMetricText}>
                          {job.conversionRate.toFixed(1)}% of total
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Applications Trend (Simple Bar Chart) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Applications Trend</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chart}>
                {analytics.applicationsTrend.map((data, index) => {
                  const maxCount = Math.max(...analytics.applicationsTrend.map(d => d.count));
                  const height = (data.count / maxCount) * 120;
                  
                  return (
                    <View key={index} style={styles.chartBar}>
                      <View 
                        style={[
                          styles.chartBarFill, 
                          { height: height, backgroundColor: '#00A389' }
                        ]} 
                      />
                      <Text style={styles.chartBarValue}>{data.count}</Text>
                      <Text style={styles.chartBarLabel}>
                        {new Date(data.date).getDate()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightsContainer}>
              {/* Best performing job */}
              {analytics.jobPerformance.length > 0 && (
                <View style={styles.insightCard}>
                  <Icon name="lightbulb" size={20} color="#F59E0B" />
                  <Text style={styles.insightText}>
                    Your "{analytics.jobPerformance[0].title}" job has received {analytics.jobPerformance[0].applications} {analytics.jobPerformance[0].applications === 1 ? 'application' : 'applications'}
                  </Text>
                </View>
              )}
              
              {/* New applications trend */}
              {analytics.newApplicationsThisWeek > 0 && (
                <View style={styles.insightCard}>
                  <Icon name="trending-up" size={20} color="#10B981" />
                  <Text style={styles.insightText}>
                    You received {analytics.newApplicationsThisWeek} new {analytics.newApplicationsThisWeek === 1 ? 'application' : 'applications'} this week
                  </Text>
                </View>
              )}
              
              {/* Pending applications */}
              {analytics.applicationsByStatus.pending > 0 && (
                <View style={styles.insightCard}>
                  <Icon name="schedule" size={20} color="#3B82F6" />
                  <Text style={styles.insightText}>
                    You have {analytics.applicationsByStatus.pending} pending {analytics.applicationsByStatus.pending === 1 ? 'application' : 'applications'} that need review
                  </Text>
                </View>
              )}

              {/* Shortlisted applications */}
              {analytics.applicationsByStatus.shortlisted > 0 && (
                <View style={styles.insightCard}>
                  <Icon name="star" size={20} color="#10B981" />
                  <Text style={styles.insightText}>
                    {analytics.applicationsByStatus.shortlisted} {analytics.applicationsByStatus.shortlisted === 1 ? 'candidate' : 'candidates'} shortlisted for next round
                  </Text>
                </View>
              )}

              {/* Hired count */}
              {analytics.applicationsByStatus.hired > 0 && (
                <View style={styles.insightCard}>
                  <Icon name="check-circle" size={20} color="#8B5CF6" />
                  <Text style={styles.insightText}>
                    Successfully hired {analytics.applicationsByStatus.hired} {analytics.applicationsByStatus.hired === 1 ? 'candidate' : 'candidates'}
                  </Text>
                </View>
              )}

              {/* No data state */}
              {analytics.totalApplications === 0 && (
                <View style={styles.insightCard}>
                  <Icon name="info" size={20} color="#6B7280" />
                  <Text style={styles.insightText}>
                    No applications yet. Keep your jobs active to attract candidates!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  periodFilterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  periodFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  periodFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  periodFilterActive: {
    backgroundColor: '#00A389',
    borderColor: '#00A389',
  },
  periodFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  periodFilterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Account for tab bar height + extra space
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00A389',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statInfo: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: (width - 64) / 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  performanceCards: {
    gap: 12,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  performanceJobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  performanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  performanceMetricText: {
    fontSize: 13,
    color: '#6B7280',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartBarValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  chartBarLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default withEmployerProtection(AnalyticsScreen);