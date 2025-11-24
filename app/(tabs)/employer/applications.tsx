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
  Linking,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import EmailCompositionModal from '../../../components/EmailCompositionModal';
import { 
  getEmployerApplications, 
  updateApplicationStatus,
  deleteApplication,
  getEmployerJobs,
  type Application 
} from '../../../lib/services/employer-services';
import { withEmployerProtection } from '../../../lib/employer-protection';
import { useToast } from '../../../lib/ToastContext';
import { doc, getDoc, collection } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const { width } = Dimensions.get('window');

interface ApplicationDisplay extends Application {
  jobTitle: string;
  candidateName: string;
}

function ApplicationsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<ApplicationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDisplay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState<{
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
  } | null>(null);

  const statusFilters = [
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'shortlisted', label: 'Shortlisted', count: 0 },
    { key: 'rejected', label: 'Rejected', count: 0 },
    { key: 'hired', label: 'Hired', count: 0 },
  ];

  useEffect(() => {
    loadApplications();
  }, []);

  const { showSuccess, showError } = useToast();

  const loadApplications = async () => {
    try {
      console.log('Loading applications for employer:', currentUser?.uid);
      
      // Fetch applications and jobs in parallel
      const [employerApplications, employerJobs] = await Promise.all([
        getEmployerApplications(),
        getEmployerJobs()
      ]);
      
      // Create a map of job IDs to job titles
      const jobTitlesMap = new Map(
        employerJobs.map(job => [job.id, job.title])
      );
      
      // Transform to display format with real job titles
      const displayApplications: ApplicationDisplay[] = employerApplications.map(app => ({
        ...app,
        jobTitle: jobTitlesMap.get(app.jobId) || 'Unknown Position',
        candidateName: app.email?.split('@')[0] || 'Candidate',
      }));
      
      setApplications(displayApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
      showError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    try {
      if (!newStatus) return;
      
      await updateApplicationStatus(applicationId, newStatus);
      
      setApplications(prevApplications =>
        prevApplications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      showSuccess(`Application ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating application status:', error);
      showError(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleContactCandidate = (candidateEmail: string, candidateName: string, jobTitle: string) => {
    // Get company name from current user profile or use a default
    const companyName = currentUser?.displayName || 'Our Company';
    
    setEmailModalData({
      candidateEmail,
      candidateName,
      jobTitle,
      companyName,
    });
    setShowEmailModal(true);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoadingProfile(true);
      const profileRef = doc(collection(db, 'employees', userId, 'employee data'), 'profile');
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        setUserProfile(profileSnap.data());
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenModal = async (application: ApplicationDisplay) => {
    setSelectedApplication(application);
    setModalVisible(true);
    await fetchUserProfile(application.userId);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedApplication(null);
    setUserProfile(null);
  };

  const handleModalStatusChange = async (newStatus: Application['status']) => {
    if (!selectedApplication) return;
    
    await handleStatusChange(selectedApplication.id, newStatus);
    setModalVisible(false);
    setSelectedApplication(null);
  };

  const handleDeleteApplication = () => {
    if (!selectedApplication) return;
    
    Alert.alert(
      'Delete Application',
      `Are you sure you want to permanently delete ${selectedApplication.candidateName}'s application? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteApplication(selectedApplication.id);
              
              // Remove from local state
              setApplications(prevApplications =>
                prevApplications.filter(app => app.id !== selectedApplication.id)
              );
              
              showSuccess('Application deleted successfully');
              setModalVisible(false);
              setSelectedApplication(null);
            } catch (error) {
              console.error('Error deleting application:', error);
              showError(error instanceof Error ? error.message : 'Failed to delete application');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'shortlisted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'hired': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'shortlisted': return 'Shortlisted';
      case 'rejected': return 'Rejected';
      case 'hired': return 'Hired';
      default: return 'Unknown';
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 24) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredApplications = applications.filter(app => app.status === filterStatus);

  // Update filter counts
  const updatedFilters = statusFilters.map(filter => ({
    ...filter,
    count: applications.filter(app => app.status === filter.key).length
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A389" />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Applications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <View style={styles.filterTabs}>
            {updatedFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  filterStatus === filter.key && styles.filterTabActive
                ]}
                onPress={() => setFilterStatus(filter.key)}
              >
                <Text style={[
                  styles.filterTabText,
                  filterStatus === filter.key && styles.filterTabTextActive
                ]}>
                  {filter.label}
                </Text>
                <View style={[
                  styles.countBadge,
                  filterStatus === filter.key && styles.countBadgeActive
                ]}>
                  <Text style={[
                    styles.countBadgeText,
                    filterStatus === filter.key && styles.countBadgeTextActive
                  ]}>
                    {filter.count}
                  </Text>
                </View>
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
        {filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="account-off" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Applications</Text>
            <Text style={styles.emptyDescription}>
              {filterStatus === 'all' 
                ? 'No applications received yet'
                : `No ${filterStatus} applications`}
            </Text>
          </View>
        ) : (
          <View style={styles.applicationsList}>
            {filteredApplications.map((application) => (
              <TouchableOpacity 
                key={application.id} 
                style={styles.applicationCard}
                onPress={() => handleOpenModal(application)}
                activeOpacity={0.7}
              >
                {/* Candidate Info */}
                <View style={styles.cardHeader}>
                  <View style={styles.candidateAvatar}>
                    <Icon name="account" size={28} color="#00A389" />
                  </View>
                  <View style={styles.candidateInfo}>
                    <Text style={styles.candidateName}>{application.candidateName}</Text>
                    <Text style={styles.jobTitle}>{application.jobTitle}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status || 'pending') }]}>
                    <Text style={styles.statusText}>{getStatusText(application.status || 'pending')}</Text>
                  </View>
                </View>

                {/* Contact Info */}
                <View style={styles.contactInfo}>
                  <View style={styles.infoRow}>
                    <Icon name="email" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{application.email}</Text>
                  </View>
                  {application.phone && (
                    <View style={styles.infoRow}>
                      <Icon name="phone" size={16} color="#6B7280" />
                      <Text style={styles.infoText}>{application.phone}</Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Icon name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>
                      Applied {application.appliedAt ? getTimeAgo(new Date(application.appliedAt.seconds * 1000)) : 'Recently'}
                    </Text>
                  </View>
                </View>

                {/* Cover Letter */}
                {application.coverLetter && (
                  <View style={styles.coverLetterSection}>
                    <Text style={styles.coverLetterLabel}>Cover Letter</Text>
                    <Text style={styles.coverLetterText} numberOfLines={3}>
                      {application.coverLetter}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Application Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={handleCloseModal}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Application Details</Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {loadingProfile ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#00A389" />
                  <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
              ) : selectedApplication && (
                <>
                  {/* Candidate Profile Section */}
                  <View style={styles.modalSection}>
                    <View style={styles.modalSectionHeader}>
                      <Icon name="account" size={24} color="#00A389" />
                      <Text style={styles.modalSectionTitle}>Candidate Profile</Text>
                    </View>
                    <View style={styles.profileCard}>
                      <View style={styles.profileAvatar}>
                        <Icon name="account" size={48} color="#00A389" />
                      </View>
                      <Text style={styles.profileName}>{selectedApplication.candidateName}</Text>
                      <View style={styles.profileDetails}>
                        <View style={styles.profileDetailRow}>
                          <Icon name="email" size={18} color="#6B7280" />
                          <Text style={styles.profileDetailText}>{selectedApplication.email}</Text>
                        </View>
                        {selectedApplication.phone && (
                          <View style={styles.profileDetailRow}>
                            <Icon name="phone" size={18} color="#6B7280" />
                            <Text style={styles.profileDetailText}>{selectedApplication.phone}</Text>
                          </View>
                        )}
                        {userProfile?.location && (
                          <View style={styles.profileDetailRow}>
                            <Icon name="map-marker" size={18} color="#6B7280" />
                            <Text style={styles.profileDetailText}>{userProfile.location}</Text>
                          </View>
                        )}
                        {userProfile?.linkedIn && (
                          <View style={styles.profileDetailRow}>
                            <Icon name="linkedin" size={18} color="#6B7280" />
                            <Text style={styles.profileDetailText}>{userProfile.linkedIn}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Skills Section */}
                  {userProfile?.skills && userProfile.skills.length > 0 && (
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <Icon name="star-circle" size={24} color="#00A389" />
                        <Text style={styles.modalSectionTitle}>Skills</Text>
                      </View>
                      <View style={styles.skillsContainer}>
                        {userProfile.skills.map((skill: string, index: number) => (
                          <View key={index} style={styles.skillChip}>
                            <Text style={styles.skillText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Work Experience Section */}
                  {userProfile?.experience && userProfile.experience.length > 0 && (
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <Icon name="briefcase" size={24} color="#00A389" />
                        <Text style={styles.modalSectionTitle}>Work Experience</Text>
                      </View>
                      {userProfile.experience.map((exp: any, index: number) => (
                        <View key={index} style={styles.experienceCard}>
                          <Text style={styles.experiencePosition}>{exp.position}</Text>
                          <Text style={styles.experienceCompany}>{exp.company}</Text>
                          <View style={styles.experienceMetaRow}>
                            <Icon name="map-marker" size={14} color="#6B7280" />
                            <Text style={styles.experienceMeta}>{exp.location}</Text>
                          </View>
                          <View style={styles.experienceMetaRow}>
                            <Icon name="calendar" size={14} color="#6B7280" />
                            <Text style={styles.experienceMeta}>
                              {exp.startDate} - {exp.endDate}
                            </Text>
                          </View>
                          {exp.description && (
                            <Text style={styles.experienceDescription}>{exp.description}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Education Section */}
                  {userProfile?.education && userProfile.education.length > 0 && (
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <Icon name="school" size={24} color="#00A389" />
                        <Text style={styles.modalSectionTitle}>Education</Text>
                      </View>
                      {userProfile.education.map((edu: any, index: number) => (
                        <View key={index} style={styles.educationCard}>
                          <Text style={styles.educationInstitution}>{edu.institution}</Text>
                          <Text style={styles.educationDegree}>{edu.degree}</Text>
                          <Text style={styles.educationField}>{edu.field}</Text>
                          <View style={styles.educationMetaRow}>
                            <Icon name="calendar" size={14} color="#6B7280" />
                            <Text style={styles.educationMeta}>
                              {edu.startDate} - {edu.endDate}
                            </Text>
                          </View>
                          {edu.description && (
                            <Text style={styles.educationDescription}>{edu.description}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Certifications Section */}
                  {userProfile?.certifications && userProfile.certifications.length > 0 && (
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <Icon name="certificate" size={24} color="#00A389" />
                        <Text style={styles.modalSectionTitle}>Certifications</Text>
                      </View>
                      {userProfile.certifications.map((cert: any, index: number) => (
                        <View key={index} style={styles.certificationCard}>
                          <Text style={styles.certificationName}>{cert.name}</Text>
                          <Text style={styles.certificationIssuer}>{cert.issuer}</Text>
                          <View style={styles.certificationMetaRow}>
                            <Icon name="calendar" size={14} color="#6B7280" />
                            <Text style={styles.certificationMeta}>Issued: {cert.issueDate}</Text>
                          </View>
                          {cert.expiryDate && (
                            <View style={styles.certificationMetaRow}>
                              <Icon name="calendar-clock" size={14} color="#6B7280" />
                              <Text style={styles.certificationMeta}>Expires: {cert.expiryDate}</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Job Details Section */}
                  <View style={styles.modalSection}>
                    <View style={styles.modalSectionHeader}>
                      <Icon name="briefcase" size={24} color="#00A389" />
                      <Text style={styles.modalSectionTitle}>Job Details</Text>
                    </View>
                    <View style={styles.jobDetailsCard}>
                      <Text style={styles.jobDetailsTitle}>{selectedApplication.jobTitle}</Text>
                      <View style={styles.jobDetailRow}>
                        <Icon name="calendar" size={16} color="#6B7280" />
                        <Text style={styles.jobDetailText}>
                          Applied {selectedApplication.appliedAt ? getTimeAgo(new Date(selectedApplication.appliedAt.seconds * 1000)) : 'Recently'}
                        </Text>
                      </View>
                      <View style={styles.jobDetailRow}>
                        <Icon name="progress-clock" size={16} color="#6B7280" />
                        <Text style={styles.jobDetailText}>
                          Status: {getStatusText(selectedApplication.status || 'pending')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Cover Letter Section */}
                  {selectedApplication.coverLetter && (
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <Icon name="file-document" size={24} color="#00A389" />
                        <Text style={styles.modalSectionTitle}>Cover Letter</Text>
                      </View>
                      <View style={styles.coverLetterCard}>
                        <Text style={styles.coverLetterFullText}>
                          {selectedApplication.coverLetter}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Action Buttons Section */}
                  <View style={styles.modalActionsSection}>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.emailButton]}
                      onPress={() => {
                        handleContactCandidate(
                          selectedApplication.email, 
                          selectedApplication.candidateName,
                          selectedApplication.jobTitle
                        );
                      }}
                    >
                      <Icon name="email" size={20} color="#FFFFFF" />
                      <Text style={styles.modalActionButtonText}>Send Email</Text>
                    </TouchableOpacity>

                    {selectedApplication.status === 'pending' && (
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.shortlistButton]}
                        onPress={() => handleModalStatusChange('shortlisted')}
                      >
                        <Icon name="star" size={20} color="#FFFFFF" />
                        <Text style={styles.modalActionButtonText}>Shortlist</Text>
                      </TouchableOpacity>
                    )}

                    {selectedApplication.status !== 'hired' && (
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.hireButton]}
                        onPress={() => handleModalStatusChange('hired')}
                      >
                        <Icon name="check-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.modalActionButtonText}>Hire</Text>
                      </TouchableOpacity>
                    )}

                    {selectedApplication.status !== 'rejected' && (
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.rejectButtonModal]}
                        onPress={() => handleModalStatusChange('rejected')}
                      >
                        <Icon name="close-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.modalActionButtonText}>Reject</Text>
                      </TouchableOpacity>
                    )}

                    {/* Delete Button */}
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.deleteButton]}
                      onPress={handleDeleteApplication}
                    >
                      <Icon name="delete" size={20} color="#FFFFFF" />
                      <Text style={styles.modalActionButtonText}>Delete Application</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Email Composition Modal */}
      {emailModalData && (
        <EmailCompositionModal
          visible={showEmailModal}
          candidateEmail={emailModalData.candidateEmail}
          candidateName={emailModalData.candidateName}
          jobTitle={emailModalData.jobTitle}
          companyName={emailModalData.companyName}
          onClose={() => {
            setShowEmailModal(false);
            setEmailModalData(null);
          }}
          onSuccess={() => {
            setShowEmailModal(false);
            setEmailModalData(null);
            showSuccess('Email sent successfully!');
          }}
          onError={(error) => {
            showError(error);
          }}
        />
      )}
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 20,
  },
  filterWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterContainer: {
    paddingVertical: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabActive: {
    backgroundColor: '#00A389',
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  countBadgeTextActive: {
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  applicationsList: {
    padding: 20,
    gap: 16,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  candidateAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: '#00A389',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  coverLetterSection: {
    marginBottom: 16,
  },
  coverLetterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverLetterText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    flex: 1,
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  profileDetails: {
    width: '100%',
    gap: 12,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileDetailText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  jobDetailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  jobDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00A389',
    marginBottom: 4,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobDetailText: {
    fontSize: 14,
    color: '#374151',
  },
  coverLetterCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  coverLetterFullText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  modalActionsSection: {
    padding: 20,
    gap: 12,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emailButton: {
    backgroundColor: '#00A389',
  },
  shortlistButton: {
    backgroundColor: '#10B981',
  },
  hireButton: {
    backgroundColor: '#8B5CF6',
  },
  rejectButtonModal: {
    backgroundColor: '#EF4444',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#B91C1C',
  },
  // Skills Styles
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00A389',
  },
  skillText: {
    fontSize: 13,
    color: '#00A389',
    fontWeight: '500',
  },
  // Experience Styles
  experienceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#00A389',
  },
  experiencePosition: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 15,
    fontWeight: '500',
    color: '#00A389',
    marginBottom: 8,
  },
  experienceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  experienceMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  experienceDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
  },
  // Education Styles
  educationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  educationInstitution: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  educationDegree: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3B82F6',
    marginBottom: 2,
  },
  educationField: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  educationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  educationMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  educationDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
  },
  // Certification Styles
  certificationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  certificationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  certificationIssuer: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 8,
  },
  certificationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  certificationMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default withEmployerProtection(ApplicationsScreen);