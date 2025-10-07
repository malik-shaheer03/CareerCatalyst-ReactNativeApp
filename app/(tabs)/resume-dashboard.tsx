import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
  Share
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useResume } from '@/lib/resume';
import { ResumeListItem } from '@/lib/resume';
import { CompactResumePreview } from '@/components/resume/preview';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/lib/ToastContext';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Main Resume Dashboard Screen
const ResumeDashboardScreen: React.FC = () => {
  const router = useRouter();
  const { state, actions } = useResume();
  const { resumeList, isLoading, error } = state;
  const { showSuccess, showError } = useToast();

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'favorites'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeListItem | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Resumes are loaded automatically by the ResumeProvider on mount
  // No need to call loadResumeList here as it's already handled by the context

  // Debug: Monitor resumeList changes
  useEffect(() => {
    console.log('Resume list changed:', {
      length: resumeList?.length || 0,
      resumes: resumeList?.map(r => ({ id: r.id, title: r.title })) || []
    });
  }, [resumeList]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await actions.loadResumeList();
      showSuccess('Resumes refreshed successfully!');
    } catch (error) {
      console.error('Refresh error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh resumes. Please try again.';
      showError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [actions.loadResumeList, showSuccess, showError]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    try {
      await actions.loadResumeList();
      showSuccess('Resumes loaded successfully!');
    } catch (error) {
      console.error('Retry error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load resumes. Please try again.';
      showError(errorMessage);
    }
  }, [actions.loadResumeList, showSuccess, showError]);

  // Handle create new resume
  const handleCreateResume = useCallback(async () => {
    try {
      const newResume = await actions.createResume({
        title: 'New Resume',
        personal: {
          firstName: '',
          lastName: '',
          jobTitle: '',
          email: '',
          phone: '',
          address: '',
          avatar: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: []
      });
      
      if (newResume) {
        router.push('/(tabs)/resume-builder');
      }
    } catch (error) {
      console.error('Create resume error:', error);
      Alert.alert('Error', 'Failed to create new resume. Please try again.');
    }
  }, [router]); // Remove actions.createResume dependency

  // Handle resume selection - navigate to resume builder
  const handleResumeSelect = useCallback(async (resume: ResumeListItem) => {
    try {
      // Load the specific resume into the context
      await actions.loadResume(resume.id);
      // Navigate to the resume builder (same as edit button)
      router.push('/(tabs)/resume-builder');
    } catch (error) {
      console.error('Load resume error:', error);
      Alert.alert('Error', 'Failed to load resume. Please try again.');
    }
  }, [actions, router]);



  // Handle resume delete
  const handleResumeDelete = useCallback((resume: ResumeListItem) => {
    console.log('Delete button clicked for resume:', resume.id, resume.title);
    setResumeToDelete(resume);
    setShowDeleteModal(true);
  }, []);

  // Generate text version of resume
  const generateTextResume = useCallback((resume: any) => {
    let text = '';
    
    // Personal details
    text += `${resume.personal.firstName} ${resume.personal.lastName}\n`;
    text += `${resume.personal.jobTitle}\n`;
    text += `${resume.personal.email} | ${resume.personal.phone}\n`;
    text += `${resume.personal.address}\n\n`;
    
    // Summary
    if (resume.summary) {
      text += `PROFESSIONAL SUMMARY\n${resume.summary}\n\n`;
    }
    
    // Experience
    if (resume.experience && resume.experience.length > 0) {
      text += `PROFESSIONAL EXPERIENCE\n`;
      resume.experience.forEach((exp: any) => {
        text += `${exp.title} at ${exp.companyName}\n`;
        text += `${exp.city}, ${exp.state} | ${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate}\n`;
        text += `${exp.workSummary}\n\n`;
      });
    }
    
    // Education
    if (resume.education && resume.education.length > 0) {
      text += `EDUCATION\n`;
      resume.education.forEach((edu: any) => {
        text += `${edu.degree} in ${edu.major}\n`;
        text += `${edu.universityName} | ${edu.startDate} - ${edu.endDate}\n`;
        if (edu.grade) {
          text += `Grade: ${edu.grade} (${edu.gradeType})\n`;
        }
        if (edu.description) {
          text += `${edu.description}\n`;
        }
        text += '\n';
      });
    }
    
    // Skills
    if (resume.skills && resume.skills.length > 0) {
      text += `TECHNICAL SKILLS\n`;
      const skillsByCategory = resume.skills.reduce((acc: any, skill: any) => {
        const category = skill.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
      }, {});
      
      Object.entries(skillsByCategory).forEach(([category, skills]) => {
        text += `${category}: ${(skills as string[]).join(', ')}\n`;
      });
      text += '\n';
    }
    
    // Projects
    if (resume.projects && resume.projects.length > 0) {
      text += `PROJECTS\n`;
      resume.projects.forEach((project: any) => {
        text += `${project.projectName}\n`;
        text += `Tech Stack: ${project.techStack}\n`;
        text += `${project.projectSummary}\n`;
        if (project.projectUrl) {
          text += `URL: ${project.projectUrl}\n`;
        }
        if (project.githubUrl) {
          text += `GitHub: ${project.githubUrl}\n`;
        }
        text += '\n';
      });
    }
    
    return text;
  }, []);

  // Generate ATS-optimized PDF
  const generateATSPDF = useCallback(async (resume: any, title: string) => {
    try {
      console.log('Starting PDF generation for resume:', resume);
      setIsGeneratingPDF(true);
      
      // Check if we're in a web environment (including React Native Web)
      if (typeof window === 'undefined' || Platform.OS !== 'web') {
        console.log('Mobile environment detected, using share instead');
        // For React Native mobile, use Share API with formatted text
        const textResume = generateTextResume(resume);
        await Share.share({
          message: textResume,
          title: `${resume.personal.firstName} ${resume.personal.lastName} - Resume`,
          url: undefined // This ensures it shares as text, not URL
        });
        return;
      }
      
      console.log('Web environment detected, using print-to-PDF approach');
      
      // Generate HTML content for PDF
      const htmlContent = generateATSHTML(resume, title);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check popup blockers.');
      }
      
      // Write HTML content to the new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      printWindow.onload = () => {
        console.log('Print window loaded, triggering print...');
        
        // Add print styles
        const printStyles = `
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 15px; 
                font-size: 12px;
                line-height: 1.4;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .resume-container { 
                max-width: none; 
                box-shadow: none;
              }
              .section {
                page-break-inside: avoid;
                margin-bottom: 20px;
              }
              .experience-item, .education-item, .project-item {
                page-break-inside: avoid;
                margin-bottom: 12px;
              }
              .header {
                page-break-after: avoid;
              }
            }
          </style>
        `;
        
        printWindow.document.head.innerHTML += printStyles;
        
        // Trigger print dialog
        setTimeout(() => {
          printWindow.print();
          
          // Show success message
          showSuccess('PDF print dialog opened! Use "Save as PDF" in the print dialog to download.');
          
          // Close the window after a delay
          setTimeout(() => {
            printWindow.close();
          }, 2000);
        }, 500);
      };
      
    } catch (error) {
      console.error('PDF generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.';
      showError(errorMessage);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [showError, showSuccess, generateTextResume]);


  // Handle resume download
  const handleResumeDownload = useCallback(async (resume: ResumeListItem) => {
    try {
      console.log('Download button clicked for resume:', resume);
      
      // Use the resume data directly from the list item
      // The ResumeListItem should contain all necessary data for PDF generation
      const resumeData = resume as any; // Cast to any to access all properties
      
      console.log('Using resume data directly:', !!resumeData);
      
      if (!resumeData) {
        console.error('No resume data available');
        Alert.alert('Error', 'Failed to load resume data for download.');
        return;
      }

      console.log('Generating PDF directly...');
      
      // For now, directly generate PDF without showing options dialog
      // This ensures the download works immediately
      try {
        console.log('PDF generation started');
        await generateATSPDF(resumeData, resume.title);
        console.log('PDF generation completed');
      } catch (error) {
        console.error('PDF generation error:', error);
        showError('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to prepare resume for download. Please try again.');
    }
  }, [showSuccess, showError, generateATSPDF, generateTextResume]);

  // Generate ATS-optimized HTML
  const generateATSHTML = useCallback((resume: any, title: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} - Resume</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background: white;
        }
        .resume-container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #004D40;
            padding-bottom: 20px;
        }
        .name {
            font-size: 28px;
            font-weight: bold;
            color: #004D40;
            margin-bottom: 5px;
        }
        .title {
            font-size: 18px;
            color: #666;
            margin-bottom: 15px;
        }
        .contact {
            font-size: 14px;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #004D40;
            text-transform: uppercase;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .experience-item, .education-item, .project-item {
            margin-bottom: 15px;
        }
        .job-title, .degree, .project-name {
            font-weight: bold;
            font-size: 14px;
        }
        .company, .university {
            color: #004D40;
            font-weight: bold;
        }
        .dates, .location {
            color: #666;
            font-size: 12px;
        }
        .description {
            margin-top: 5px;
            font-size: 13px;
            line-height: 1.4;
        }
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .skill-tag {
            background: #f0f0f0;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            color: #333;
        }
        @media print {
            body { 
                margin: 0; 
                padding: 15px; 
                font-size: 12px;
                line-height: 1.4;
            }
            .resume-container { 
                max-width: none; 
                box-shadow: none;
            }
            .section {
                page-break-inside: avoid;
                margin-bottom: 20px;
            }
            .experience-item, .education-item, .project-item {
                page-break-inside: avoid;
                margin-bottom: 12px;
            }
            .header {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <div class="header">
            <div class="name">${resume.personal.firstName} ${resume.personal.lastName}</div>
            <div class="title">${resume.personal.jobTitle}</div>
            <div class="contact">
                ${resume.personal.email} | ${resume.personal.phone} | ${resume.personal.address}
            </div>
        </div>

        ${resume.summary ? `
        <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="description">${resume.summary}</div>
        </div>
        ` : ''}

        ${resume.experience && resume.experience.length > 0 ? `
        <div class="section">
            <div class="section-title">Professional Experience</div>
            ${resume.experience.map((exp: any) => `
                <div class="experience-item">
                    <div class="job-title">${exp.title}</div>
                    <div class="company">${exp.companyName}</div>
                    <div class="dates">${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate} | ${exp.city}, ${exp.state}</div>
                    <div class="description">${exp.workSummary}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${resume.education && resume.education.length > 0 ? `
        <div class="section">
            <div class="section-title">Education</div>
            ${resume.education.map((edu: any) => `
                <div class="education-item">
                    <div class="degree">${edu.degree} in ${edu.major}</div>
                    <div class="university">${edu.universityName}</div>
                    <div class="dates">${edu.startDate} - ${edu.endDate}${edu.grade ? ` | Grade: ${edu.grade} (${edu.gradeType})` : ''}</div>
                    ${edu.description ? `<div class="description">${edu.description}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${resume.skills && resume.skills.length > 0 ? `
        <div class="section">
            <div class="section-title">Technical Skills</div>
            <div class="skills">
                ${resume.skills.map((skill: any) => `
                    <span class="skill-tag">${skill.name}</span>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${resume.projects && resume.projects.length > 0 ? `
        <div class="section">
            <div class="section-title">Projects</div>
            ${resume.projects.map((project: any) => `
                <div class="project-item">
                    <div class="project-name">${project.projectName}</div>
                    <div class="description">
                        <strong>Tech Stack:</strong> ${project.techStack}<br>
                        ${project.projectSummary}
                        ${project.projectUrl ? `<br><strong>URL:</strong> ${project.projectUrl}` : ''}
                        ${project.githubUrl ? `<br><strong>GitHub:</strong> ${project.githubUrl}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;
  }, []);

  // Handle modal confirmation
  const handleConfirmDelete = useCallback(async () => {
    if (!resumeToDelete) return;
    
    try {
      console.log('Attempting to delete resume:', resumeToDelete.id);
      console.log('Current resume list before deletion:', resumeList.length);
      
      await actions.deleteResume(resumeToDelete.id);
      console.log('Resume deleted successfully');
      console.log('Current resume list after deletion:', resumeList.length);
      
      // Close modal
      setShowDeleteModal(false);
      setResumeToDelete(null);
      
      // Show modern success toast
      showSuccess(`"${resumeToDelete.title}" deleted successfully!`);
      
      // Force a re-render to ensure UI updates
      setForceUpdate(prev => prev + 1);
      
      // Force a small delay to ensure state is updated
      setTimeout(() => {
        console.log('Final resume list after timeout:', resumeList.length);
      }, 100);
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = `Failed to delete resume: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      // Close modal
      setShowDeleteModal(false);
      setResumeToDelete(null);
      
      // Show modern error toast
      showError(errorMessage);
    }
  }, [resumeToDelete, actions.deleteResume, showSuccess, showError, resumeList.length]);

  // Handle modal cancellation
  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setResumeToDelete(null);
  }, []);

  // Handle resume duplicate
  const handleResumeDuplicate = useCallback(async (resume: ResumeListItem) => {
    try {
      console.log('Attempting to duplicate resume:', resume.id);
      await actions.duplicateResume(resume.id, `${resume.title} (Copy)`);
      console.log('Resume duplicated successfully');
      
      // Show modern success toast
      showSuccess(`"${resume.title}" duplicated successfully!`);
    } catch (error) {
      console.error('Duplicate error:', error);
      const errorMessage = `Failed to duplicate resume: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      // Show modern error toast
      showError(errorMessage);
    }
  }, [actions.duplicateResume, showSuccess, showError]);

  // Filter and sort resumes
  const getFilteredResumes = useCallback(() => {
    console.log('getFilteredResumes called with resumeList length:', resumeList?.length || 0);
    let filtered = [...(resumeList || [])];

    // Apply filter
    switch (filterBy) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(resume => 
          new Date(resume.lastUpdated) > oneWeekAgo
        );
        break;
      case 'favorites':
        // This would filter by favorites if we had that field
        break;
      default:
        break;
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

    console.log('getFilteredResumes returning filtered length:', filtered.length);
    return filtered;
  }, [resumeList, filterBy, sortBy]);

  // Format date with real-time information
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Show more granular time information
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.ceil(diffDays / 365)} year${Math.ceil(diffDays / 365) > 1 ? 's' : ''} ago`;
  }, []);

  // Render resume card
  const renderResumeCard = (resume: ResumeListItem) => (
    <TouchableOpacity
      key={resume.id}
      style={styles.resumeCard}
      onPress={() => handleResumeSelect(resume)}
    >
      <View style={styles.resumeCardHeader}>
        <View style={styles.resumeInfo}>
          <Text style={styles.resumeTitle} numberOfLines={1}>
            {resume.personal.jobTitle || 'Untitled Resume'}
          </Text>
          <Text style={styles.resumeSubtitle}>
            {resume.personal.firstName} {resume.personal.lastName}
          </Text>
        </View>
        
        <View style={styles.resumeActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleResumeDuplicate(resume);
            }}
          >
            <Icon name="content-copy" size={16} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton, isGeneratingPDF && styles.actionButtonDisabled]}
            onPress={(e) => {
              e.stopPropagation();
              handleResumeDownload(resume);
            }}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator size="small" color="#004D40" />
            ) : (
              <Icon name="download" size={16} color="#004D40" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={(e) => {
              console.log('Delete button pressed!');
              e.stopPropagation();
              handleResumeDelete(resume);
            }}
          >
            <Icon name="delete" size={16} color="#ff6b35" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.resumeCardFooter}>
        <Text style={styles.resumeDate}>
          Updated {formatDate(resume.lastUpdated)}
        </Text>
        <View style={styles.resumeStatus}>
          <Icon name="circle" size={8} color="#4CAF50" />
          <Text style={styles.resumeStatusText}>Saved</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="file-document-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Resumes Yet</Text>
      <Text style={styles.emptyStateText}>
        Create your first resume to get started with your job search
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateResume}
      >
        <Icon name="plus" size={20} color="#004D40" />
        <Text style={styles.createButtonText}>Create Resume</Text>
      </TouchableOpacity>
    </View>
  );

  // Render filter and sort controls
  const renderControls = () => (
    <View style={styles.controlsContainer}>
      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <Text style={styles.controlsLabel}>Filter:</Text>
        <View style={styles.filterButtons}>
          {(['all', 'recent', 'favorites'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                filterBy === filter && styles.filterButtonActive
              ]}
              onPress={() => setFilterBy(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                filterBy === filter && styles.filterButtonTextActive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sort buttons */}
      <View style={styles.sortContainer}>
        <Text style={styles.controlsLabel}>Sort:</Text>
        <View style={styles.sortButtons}>
          {(['date', 'name'] as const).map((sort) => (
            <TouchableOpacity
              key={sort}
              style={[
                styles.sortButton,
                sortBy === sort && styles.sortButtonActive
              ]}
              onPress={() => setSortBy(sort)}
            >
              <Icon 
                name={sort === 'date' ? 'sort-calendar-descending' : 'sort-alphabetical-ascending'} 
                size={16} 
                color={sortBy === sort ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.sortButtonText,
                sortBy === sort && styles.sortButtonTextActive
              ]}>
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  if (isLoading && (!resumeList || resumeList.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004D40" />
        <Text style={styles.loadingText}>Loading resumes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#ff6b35" />
        <Text style={styles.errorTitle}>Error Loading Resumes</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredResumes = getFilteredResumes();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#004D40', '#00695C']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Resumes</Text>
            <Text style={styles.headerSubtitle}>
              {filteredResumes.length} resume{filteredResumes.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateResume}
          >
            <Icon name="plus" size={20} color="#004D40" />
            <Text style={styles.createButtonText}>New Resume</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {filteredResumes.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {renderControls()}
            
            <ScrollView
              style={styles.resumesList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#004D40']}
                  tintColor="#004D40"
                />
              }
            >
              {filteredResumes.map(renderResumeCard)}
            </ScrollView>
          </>
        )}
      </View>


      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Resume"
        message={resumeToDelete ? `Are you sure you want to delete "${resumeToDelete.personal.jobTitle || 'Untitled Resume'}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#ff6b35"
        type="delete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingBottom: 100, // Add extra padding for tab bar
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#004D40',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0F2F1',
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004D40',
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Add extra padding for tab bar
  },
  controlsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContainer: {
    marginBottom: 12,
  },
  controlsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  filterButtonActive: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  sortButtonActive: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  resumesList: {
    flex: 1,
    padding: 16,
    paddingBottom: 100, // Add extra padding for tab bar
  },
  resumeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resumeInfo: {
    flex: 1,
    marginRight: 12,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004D40',
    marginBottom: 4,
  },
  resumeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  resumeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    backgroundColor: '#e8f5e8',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  resumeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumeDate: {
    fontSize: 12,
    color: '#999',
  },
  resumeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resumeStatusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingBottom: 140, // Add extra padding for tab bar
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
});

export default ResumeDashboardScreen;
