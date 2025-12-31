import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { db } from '../../../lib/firebase';
import {
  changeJobStatus,
  getEmployerJobs,
  type JobData
} from '../../../lib/services/employer-services';
import { useToast } from '../../../lib/ToastContext';

function ManageJobsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    // Set up real-time listener for employer's jobs
    const setupRealTimeListener = () => {
      console.log('🔥 Setting up real-time job listener for employer:', currentUser.uid);
      
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('employerId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        jobsQuery,
        (snapshot) => {
          console.log('📱 Real-time update received:', snapshot.size, 'jobs');
          
          // Log document changes for debugging
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              console.log('➕ Job added:', change.doc.id);
            }
            if (change.type === 'modified') {
              console.log('🔄 Job modified:', change.doc.id);
            }
            if (change.type === 'removed') {
              console.log('🗑️ Job removed from real-time listener:', change.doc.id);
            }
          });
          
          const jobsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as JobData[];

          // Sort by postedAt client-side (most recent first)
          jobsData.sort((a, b) => {
            const dateA = new Date(a.postedAt || 0);
            const dateB = new Date(b.postedAt || 0);
            return dateB.getTime() - dateA.getTime();
          });

          console.log('📊 Setting jobs state with:', jobsData.length, 'jobs');
          setJobs(jobsData);
          setLoading(false);
        },
        (error) => {
          console.error('❌ Error in real-time listener:', error);
          showError('Failed to load jobs in real-time');
          setLoading(false);
        }
      );

      return unsubscribe;
    };

    const unsubscribe = setupRealTimeListener();

    // Cleanup listener on unmount
    return () => {
      console.log('🧹 Cleaning up real-time listener');
      unsubscribe();
    };
  }, [currentUser]);

  const loadJobs = async () => {
    try {
      console.log('🔄 Manual refresh - Loading jobs for employer:', currentUser?.uid);
      
      const employerJobs = await getEmployerJobs();
      setJobs(employerJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      showError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const handleJobAction = (jobId: string, action: 'view' | 'edit' | 'pause' | 'activate' | 'delete') => {
    console.log('🎯 handleJobAction called with:', { jobId, action });
    
    switch (action) {
      case 'view':
        handleViewJob(jobId);
        break;
      case 'edit':
        handleEditJob(jobId);
        break;
      case 'pause':
        handleStatusChange(jobId, 'paused');
        break;
      case 'activate':
        handleStatusChange(jobId, 'active');
        break;
      case 'delete':
        console.log('🗑️ Routing to handleDeleteJob for jobId:', jobId);
        handleDeleteJob(jobId);
        break;
    }
  };

  const handleViewJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      // Navigate to job details screen
      router.push({
        pathname: '/(tabs)/job-details',
        params: {
          jobId: job.id,
          jobData: JSON.stringify({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            experience: job.experience,
            salary: job.salary,
            description: job.description,
            requirements: typeof job.requirements === 'string' 
              ? job.requirements.split(',').map(r => r.trim()).filter(Boolean)
              : job.requirements || [],
            benefits: typeof job.benefits === 'string' 
              ? job.benefits.split(',').map(b => b.trim()).filter(Boolean)
              : job.benefits || [],
            postedDate: new Date(job.postedAt || Date.now()),
            employerId: job.employerId,
            status: job.status,
          }),
        },
      });
    }
  };

  const handleEditJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      // Navigate to edit job screen
      router.push({
        pathname: '/(tabs)/employer/post-job',
        params: {
          editJobId: jobId,
          editJobData: JSON.stringify(job),
        },
      });
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: 'active' | 'paused' | 'closed') => {
    try {
      console.log(`🔄 Changing job ${jobId} status to ${newStatus}`);
      
      await changeJobStatus(jobId, newStatus);
      
      showSuccess(`Job ${newStatus === 'active' ? 'activated' : newStatus === 'paused' ? 'paused' : 'closed'} successfully`);
    } catch (error) {
      console.error('Error updating job status:', error);
      showError(error instanceof Error ? error.message : 'Failed to update job status');
    }
  };

  const handleDeleteJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    console.log('🗑️ handleDeleteJob called with jobId:', jobId, 'job found:', !!job);
    
    console.log('🚨 About to show confirmation for job:', job?.title);
    
    // Create a more attractive custom confirmation
    const deleteConfirmation = () => {
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999999;
          animation: fadeIn 0.3s ease-out;
          padding: 20px;
          box-sizing: border-box;
        ">
          <div style="
            background: white;
            border-radius: 20px;
            padding: 40px 32px 32px 32px;
            max-width: 480px;
            width: 100%;
            max-height: 90vh;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.85) translateY(30px);
            animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            position: relative;
          ">
            <!-- Icon Container -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #FEF2F2, #FDE2E2);
                border-radius: 50%;
                margin: 0 auto 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 4px solid #FECACA;
              ">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444"/>
                </svg>
              </div>
              
              <!-- Title and Description -->
              <h2 style="
                margin: 0 0 12px 0;
                font-size: 28px;
                font-weight: 700;
                color: #1E293B;
                line-height: 1.2;
              ">Delete Job Position</h2>
              
              <div style="
                background: #F8FAFC;
                border-radius: 12px;
                padding: 20px;
                margin: 16px 0 24px 0;
                border-left: 4px solid #EF4444;
              ">
                <p style="
                  margin: 0 0 8px 0;
                  font-size: 18px;
                  color: #475569;
                  line-height: 1.4;
                ">Are you sure you want to delete</p>
                <p style="
                  margin: 0 0 12px 0;
                  font-size: 20px;
                  font-weight: 700;
                  color: #1E293B;
                  line-height: 1.3;
                ">"${job?.title}"</p>
                <p style="
                  margin: 0;
                  font-size: 15px;
                  color: #EF4444;
                  font-weight: 600;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="
              display: flex;
              gap: 16px;
              flex-direction: row;
            ">
              <button id="cancelBtn" style="
                flex: 1;
                padding: 16px 24px;
                border: 2px solid #E2E8F0;
                background: white;
                color: #64748B;
                border-radius: 14px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 56px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">Cancel</button>
              
              <button id="deleteBtn" style="
                flex: 1;
                padding: 16px 24px;
                border: none;
                background: linear-gradient(135deg, #EF4444, #DC2626);
                color: white;
                border-radius: 14px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
                min-height: 56px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Delete Job
              </button>
            </div>
          </div>
        </div>
        
        <style>
          @keyframes fadeIn {
            from { 
              opacity: 0; 
            }
            to { 
              opacity: 1; 
            }
          }
          
          @keyframes slideUp {
            from { 
              transform: scale(0.85) translateY(30px);
              opacity: 0;
            }
            to { 
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }
          
          #cancelBtn:hover {
            background: #F8FAFC;
            border-color: #CBD5E1;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          #deleteBtn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
            background: linear-gradient(135deg, #DC2626, #B91C1C);
          }
          
          #cancelBtn:active {
            transform: translateY(0);
          }
          
          #deleteBtn:active {
            transform: translateY(0);
          }
          
          @media (max-width: 600px) {
            div[style*="max-width: 480px"] {
              margin: 20px;
              padding: 32px 24px 24px 24px;
            }
            
            div[style*="flex-direction: row"] {
              flex-direction: column;
            }
          }
        </style>
      `;
      
      document.body.appendChild(modal);
      
      const cancelBtn = modal.querySelector('#cancelBtn');
      const deleteBtn = modal.querySelector('#deleteBtn');
      
      const cleanup = () => {
        modal.style.animation = 'fadeIn 0.2s ease-out reverse';
        setTimeout(() => document.body.removeChild(modal), 200);
      };
      
      cancelBtn?.addEventListener('click', () => {
        console.log('❌ User cancelled delete');
        cleanup();
      });
      
      deleteBtn?.addEventListener('click', async () => {
        console.log('🔥 User confirmed delete, starting deletion process...');
        cleanup();
        
        try {
          console.log(`🔥 Starting delete process for job ${jobId}`);
          console.log('📊 Jobs before delete:', jobs.length);
          
          // Use direct Firebase delete for immediate results
          console.log('🔄 Attempting direct Firebase delete...');
          await deleteDoc(doc(db, 'jobs', jobId));
          console.log('✅ Job deleted successfully from Firebase');
          
          showSuccess('Job deleted successfully');
          console.log('🎉 Success message shown');
        } catch (error: any) {
          console.error('💥 Error deleting job:', error);
          showError(error?.message || 'Failed to delete job');
          console.log('❌ Error message shown');
        }
      });
      
      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          console.log('❌ User cancelled delete (clicked outside)');
          cleanup();
        }
      });
    };
    
    deleteConfirmation();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'paused': return '#F59E0B';
      case 'closed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'closed': return 'Closed';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A389" />
          <Text style={styles.loadingText}>Loading your jobs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header with Gradient */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Your Opportunities</Text>
            <Text style={styles.headerTitle}>Manage Jobs</Text>
          </View>
          <TouchableOpacity 
            style={styles.postButton}
            onPress={() => router.push('/(tabs)/employer/post-job')}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="work-off" size={80} color="#00A389" />
            </View>
            <Text style={styles.emptyTitle}>No Jobs Posted Yet</Text>
            <Text style={styles.emptyDescription}>
              Start building your dream team by posting your first job opening.
            </Text>
            <TouchableOpacity 
              style={styles.postFirstJobButton}
              onPress={() => router.push('/(tabs)/employer/post-job')}
            >
              <Icon name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.postFirstJobText}>Post Your First Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.jobsList}>
            {jobs.map((job) => (
              <View key={job.id} style={styles.jobCard}>
                {/* Status Badge Overlay */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status || 'active') }]}>
                  <Text style={styles.statusText}>{getStatusText(job.status || 'active')}</Text>
                </View>

                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                  <View style={styles.companyRow}>
                    <Icon name="business" size={16} color="#64748B" />
                    <Text style={styles.companyName}>{job.company}</Text>
                  </View>
                </View>

                {/* Job Details Grid */}
                <View style={styles.jobDetailsGrid}>
                  <View style={styles.detailCard}>
                    <Icon name="location-on" size={18} color="#00A389" />
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{job.location}</Text>
                  </View>
                  <View style={styles.detailCard}>
                    <Icon name="work" size={18} color="#3B82F6" />
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{job.type}</Text>
                  </View>
                  <View style={styles.detailCard}>
                    <Icon name="schedule" size={18} color="#F59E0B" />
                    <Text style={styles.detailLabel}>Posted</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{formatDate(job.postedAt)}</Text>
                  </View>
                </View>

                {/* Applications Stats */}
                <View style={styles.statsSection}>
                  <View style={styles.applicationsCount}>
                    <Icon name="people" size={20} color="#FFFFFF" />
                    <Text style={styles.applicationsText}>
                      {(job as any).applicationsCount || 0} Applications
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => handleJobAction(job.id || '', 'view')}
                  >
                    <Icon name="visibility" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryActionText}>View Details</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity
                      style={styles.iconAction}
                      onPress={() => handleJobAction(job.id || '', 'edit')}
                    >
                      <Icon name="edit" size={20} color="#00A389" />
                    </TouchableOpacity>

                    {job.status === 'active' ? (
                      <TouchableOpacity
                        style={styles.iconAction}
                        onPress={() => handleJobAction(job.id || '', 'pause')}
                      >
                        <Icon name="pause-circle" size={20} color="#F59E0B" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.iconAction}
                        onPress={() => handleJobAction(job.id || '', 'activate')}
                      >
                        <Icon name="play-circle" size={20} color="#10B981" />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.iconAction}
                      onPress={() => {
                        console.log('🔴 DELETE BUTTON PRESSED for job:', job.id);
                        handleJobAction(job.id || '', 'delete');
                      }}
                    >
                      <Icon name="delete" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
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
  postButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00A389',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  postFirstJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A389',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  postFirstJobText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  jobsList: {
    gap: 20,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardHeader: {
    marginBottom: 20,
    paddingRight: 90,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    lineHeight: 30,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyName: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  jobDetailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 20,
  },
  applicationsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
    alignSelf: 'flex-start',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applicationsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#00A389',
    borderRadius: 14,
    gap: 10,
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
});

export default withEmployerProtection(ManageJobsScreen);