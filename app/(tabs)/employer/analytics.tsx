import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../lib/auth-context';
import { withEmployerProtection } from '../../../lib/employer-protection';
import { getEmployerAnalytics } from '../../../lib/services/employer-services';

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
      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Performance</Text>
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
          <Icon name="insights" size={32} color="#00A389" />
        </View>
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
            tintColor="#00A389"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Overview Cards with Gradient */}
          <View style={styles.overviewSection}>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.gradientCard1]}>
                <Icon name="work" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>{analytics.totalJobs}</Text>
                <Text style={styles.statLabel}>Total Jobs</Text>
                <Text style={styles.statSubtext}>
                  {analytics.activeJobs} active
                </Text>
              </View>

              <View style={[styles.statCard, styles.gradientCard2]}>
                <Icon name="people" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>{analytics.totalApplications}</Text>
                <Text style={styles.statLabel}>Applications</Text>
                <Text style={styles.statSubtext}>
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
                  pending: { color: '#F59E0B', label: 'Pending', icon: 'hourglass-empty', bg: '#FFF7ED' },
                  shortlisted: { color: '#10B981', label: 'Shortlisted', icon: 'star', bg: '#ECFDF5' },
                  rejected: { color: '#EF4444', label: 'Rejected', icon: 'close', bg: '#FEF2F2' },
                  hired: { color: '#8B5CF6', label: 'Hired', icon: 'check-circle', bg: '#F5F3FF' },
                }[status] || { color: '#6B7280', label: status, icon: 'help', bg: '#F3F4F6' };

                return (
                  <View key={status} style={[styles.statusCard, { backgroundColor: statusConfig.bg }]}>
                    <View style={[styles.statusIconContainer, { backgroundColor: statusConfig.color }]}>
                      <Icon name={statusConfig.icon} size={24} color="#FFFFFF" />
                    </View>
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
                {analytics.jobPerformance.map((job, index) => (
                  <View key={job.jobId} style={styles.performanceCard}>
                    <View style={styles.performanceHeader}>
                      <Text style={styles.performanceJobTitle} numberOfLines={2}>{job.title}</Text>
                      <View style={styles.performanceBadge}>
                        <Text style={styles.performanceBadgeText}>#{index + 1}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.performanceMetrics}>
                      <View style={styles.performanceMetric}>
                        <View style={styles.metricIconContainer}>
                          <Icon name="people" size={18} color="#3B82F6" />
                        </View>
                        <View>
                          <Text style={styles.metricValue}>{job.applications}</Text>
                          <Text style={styles.metricLabel}>
                            {job.applications === 1 ? 'Application' : 'Applications'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.performanceMetric}>
                        <View style={styles.metricIconContainer}>
                          <Icon name="trending-up" size={18} color="#10B981" />
                        </View>
                        <View>
                          <Text style={styles.metricValue}>{job.conversionRate.toFixed(1)}%</Text>
                          <Text style={styles.metricLabel}>Of Total</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Applications Trend Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Applications Trend</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chart}>
                {analytics.applicationsTrend.map((data, index) => {
                  const maxCount = Math.max(...analytics.applicationsTrend.map(d => d.count));
                  const height = maxCount > 0 ? (data.count / maxCount) * 120 : 0;
                  
                  return (
                    <View key={index} style={styles.chartBar}>
                      <View style={styles.chartBarContainer}>
                        <View 
                          style={[
                            styles.chartBarFill, 
                            { height: height || 4 }
                          ]} 
                        />
                      </View>
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
              {analytics.jobPerformance.length > 0 && (
                <View style={styles.insightCard}>
                  <View style={styles.insightIconContainer}>
                    <Icon name="lightbulb" size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.insightText}>
                    Your "{analytics.jobPerformance[0].title}" job has received {analytics.jobPerformance[0].applications} {analytics.jobPerformance[0].applications === 1 ? 'application' : 'applications'}
                  </Text>
                </View>
              )}
              
              {analytics.newApplicationsThisWeek > 0 && (
                <View style={styles.insightCard}>
                  <View style={styles.insightIconContainer}>
                    <Icon name="trending-up" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.insightText}>
                    You received {analytics.newApplicationsThisWeek} new {analytics.newApplicationsThisWeek === 1 ? 'application' : 'applications'} this week
                  </Text>
                </View>
              )}
              
              {analytics.applicationsByStatus.pending > 0 && (
                <View style={styles.insightCard}>
                  <View style={styles.insightIconContainer}>
                    <Icon name="schedule" size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.insightText}>
                    You have {analytics.applicationsByStatus.pending} pending {analytics.applicationsByStatus.pending === 1 ? 'application' : 'applications'} that need review
                  </Text>
                </View>
              )}

              {analytics.applicationsByStatus.shortlisted > 0 && (
                <View style={styles.insightCard}>
                  <View style={styles.insightIconContainer}>
                    <Icon name="star" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.insightText}>
                    {analytics.applicationsByStatus.shortlisted} {analytics.applicationsByStatus.shortlisted === 1 ? 'candidate' : 'candidates'} shortlisted for next round
                  </Text>
                </View>
              )}

              {analytics.applicationsByStatus.hired > 0 && (
                <View style={styles.insightCard}>
                  <View style={styles.insightIconContainer}>
                    <Icon name="check-circle" size={24} color="#8B5CF6" />
                  </View>
                  <Text style={styles.insightText}>
                    Successfully hired {analytics.applicationsByStatus.hired} {analytics.applicationsByStatus.hired === 1 ? 'candidate' : 'candidates'}
                  </Text>
                </View>
              )}

              {analytics.totalApplications === 0 && (
                <View style={styles.insightCard}>
                  <View style={styles.insightIconContainer}>
                    <Icon name="info" size={24} color="#6B7280" />
                  </View>
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
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  periodFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  periodFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  periodFilter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  periodFilterActive: {
    backgroundColor: '#00A389',
    borderColor: '#00A389',
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  periodFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  periodFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#00A389',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  overviewSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientCard1: {
    backgroundColor: '#00A389',
  },
  gradientCard2: {
    backgroundColor: '#3B82F6',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  statSubtext: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
    opacity: 0.85,
  },
  section: {
    marginBottom: 28,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    width: (width - 64) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statusCount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 6,
  },
  statusLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  performanceCards: {
    gap: 16,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  performanceJobTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  performanceBadge: {
    backgroundColor: '#00A389',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  performanceBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  performanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  performanceMetric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  chartBarContainer: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 120,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#00A389',
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  chartBarValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
  },
  chartBarLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
  },
  insightsContainer: {
    gap: 14,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '600',
  },
});

export default withEmployerProtection(AnalyticsScreen);