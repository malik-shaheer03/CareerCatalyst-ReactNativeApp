import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Share
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useResume } from '@/lib/resume';
import { ResumePreview } from '@/components/resume/preview';
import { 
  PersonalDetails, 
  Summary, 
  Experience, 
  Education, 
  Skills, 
  Projects 
} from '@/components/resume/form-components';
import { ResumeData } from '@/lib/resume';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Section configuration
const SECTIONS = [
  { id: 'personal', title: 'Personal Details', icon: 'account', required: false },
  { id: 'summary', title: 'Professional Summary', icon: 'text', required: false },
  { id: 'experience', title: 'Work Experience', icon: 'briefcase', required: false },
  { id: 'education', title: 'Education', icon: 'school', required: false },
  { id: 'skills', title: 'Skills', icon: 'code-tags', required: false },
  { id: 'projects', title: 'Projects', icon: 'folder-multiple', required: false }
];

// Main Resume Builder Screen
const ResumeBuilderScreen: React.FC = () => {
  const router = useRouter();
  const { state, actions } = useResume();
  const { currentResume, isLoading, error } = state;

  // State management
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personal']));
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isCreatingResume, setIsCreatingResume] = useState(false);

  // Debug state changes
  useEffect(() => {
    console.log('Resume Builder State:', {
      currentResume: !!currentResume,
      currentResumeId: state.currentResumeId,
      isLoading,
      resumeId: currentResume?.id
    });
  }, [currentResume, state.currentResumeId, isLoading]);

  // Initialize resume if none exists
  useEffect(() => {
    // Only create a new resume if we don't have one and we're not loading and not already creating
    if (!currentResume && !isLoading && !state.currentResumeId && !isCreatingResume) {
      console.log('No resume found, creating new one...');
      setIsCreatingResume(true);
      
      const initialResume: Partial<ResumeData> = {
        title: 'My Resume',
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
      };
      
      actions.createResume(initialResume)
        .then(() => {
          console.log('Initial resume created successfully');
        })
        .catch(error => {
          console.error('Failed to create initial resume:', error);
        })
        .finally(() => {
          setIsCreatingResume(false);
        });
    } else if (state.currentResumeId && !currentResume && !isLoading) {
      // If we have a resume ID but no current resume, load it
      console.log('Loading resume with ID:', state.currentResumeId);
      actions.loadResume(state.currentResumeId).catch(error => {
        console.error('Failed to load resume:', error);
      });
    }
  }, [currentResume, isLoading, state.currentResumeId, isCreatingResume, actions.createResume, actions.loadResume]);

  // Handle swipe gesture for navigation
  const handleTouchStart = useCallback((e: any) => {
    setTouchStart(e.nativeEvent.pageX);
  }, []);

  const handleTouchEnd = useCallback((e: any) => {
    if (!touchStart) return;
    
    const touchEnd = e.nativeEvent.pageX;
    const diff = touchStart - touchEnd;
    
    // Swipe left (go back) - threshold of 50 pixels
    if (diff > 50) {
      router.push('/(tabs)/resume-dashboard');
    }
    
    setTouchStart(null);
  }, [touchStart, router]);

  // Handle section toggle
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
    setActiveSection(sectionId);
  }, []);

  // Handle section edit
  const handleEditSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    setExpandedSections(prev => new Set([...prev, sectionId]));
    setShowPreview(false); // Close preview to show the form
  }, []);

  // Generate text version of resume
  const generateTextResume = useCallback((resume: ResumeData) => {
    let text = '';
    
    // Personal details
    text += `${resume.personal.firstName} ${resume.personal.lastName}\n`;
    text += `${resume.personal.jobTitle}\n`;
    text += `${resume.personal.email} | ${resume.personal.phone}\n`;
    text += `${resume.personal.address}\n\n`;
    
    // Summary
    if (resume.summary) {
      text += `SUMMARY\n${resume.summary}\n\n`;
    }
    
    // Experience
    if (resume.experience && resume.experience.length > 0) {
      text += `EXPERIENCE\n`;
      resume.experience.forEach(exp => {
        text += `${exp.title} at ${exp.companyName}\n`;
        text += `${exp.city}, ${exp.state} | ${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate}\n`;
        text += `${exp.workSummary}\n\n`;
      });
    }
    
    // Education
    if (resume.education && resume.education.length > 0) {
      text += `EDUCATION\n`;
      resume.education.forEach(edu => {
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
      text += `SKILLS\n`;
      const skillsByCategory = resume.skills.reduce((acc, skill) => {
        const category = skill.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
      }, {} as Record<string, string[]>);
      
      Object.entries(skillsByCategory).forEach(([category, skills]) => {
        text += `${category}: ${skills.join(', ')}\n`;
      });
      text += '\n';
    }
    
    // Projects
    if (resume.projects && resume.projects.length > 0) {
      text += `PROJECTS\n`;
      resume.projects.forEach(project => {
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

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      console.log('Starting PDF generation from resume builder...');
      await generateATSPDF(currentResume!, 'Resume');
      console.log('PDF generation completed from resume builder');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export resume. Please try again.');
    }
  }, [currentResume]);

  // Generate ATS-optimized PDF
  const generateATSPDF = useCallback(async (resume: any, title: string) => {
    try {
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
          Alert.alert('Success', 'PDF print dialog opened! Use "Save as PDF" in the print dialog to download.');
          
          // Close the window after a delay
          setTimeout(() => {
            printWindow.close();
          }, 2000);
        }, 500);
      };
      
    } catch (error) {
      console.error('PDF generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [generateTextResume]);

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

  // Handle save
  const handleSave = useCallback(async () => {
    // Prevent multiple simultaneous save operations
    if (isSaving || isCreatingResume) {
      console.log('Save already in progress, ignoring duplicate request');
      return;
    }

    if (!currentResume) {
      console.log('Save failed: No currentResume available');
      Alert.alert('Error', 'No resume data available. Please try again.');
      return;
    }

    try {
      setIsSaving(true);
      
      // Always try to create a new resume if we don't have a valid currentResumeId
      // or if the currentResume doesn't have an ID
      console.log('Save decision check:', {
        stateCurrentResumeId: state.currentResumeId,
        stateCurrentResumeIdExists: !!state.currentResumeId,
        currentResumeIdExists: !!currentResume.id,
        currentResumeId: currentResume.id,
        currentResumeExists: !!currentResume,
        currentResumeTitle: currentResume.title
      });
      
      if (!state.currentResumeId || !currentResume.id) {
        console.log('Creating new resume with current data...');
        setIsCreatingResume(true);
        const newResume = await actions.createResume(currentResume);
        console.log('New resume created:', newResume.id);
        Alert.alert('Success', 'Resume created and saved successfully!');
      } else {
        console.log('Updating existing resume...', { 
          resumeId: state.currentResumeId,
          currentResumeId: currentResume.id 
        });
        try {
          const savedResume = await actions.updateResume(currentResume);
          console.log('Resume updated successfully:', savedResume);
          Alert.alert('Success', 'Resume updated successfully!');
        } catch (updateError) {
          console.log('Update failed, creating new resume instead...', updateError);
          // If update fails, create a new resume
          setIsCreatingResume(true);
          const newResume = await actions.createResume(currentResume);
          console.log('New resume created after update failure:', newResume.id);
          Alert.alert('Success', 'Resume created and saved successfully!');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to save resume: ${errorMessage}`);
    } finally {
      setIsSaving(false);
      setIsCreatingResume(false);
    }
  }, [currentResume, state.currentResumeId, isSaving, isCreatingResume, actions.updateResume, actions.createResume]);

  // Handle section update
  const handleSectionUpdate = useCallback((sectionId: string, data: any) => {
    if (!currentResume) return;

    const updatedResume = { ...currentResume };
    switch (sectionId) {
      case 'personal':
        updatedResume.personal = { ...updatedResume.personal, ...data };
        break;
      case 'summary':
        updatedResume.summary = data;
        break;
      case 'experience':
        updatedResume.experience = data;
        break;
      case 'education':
        updatedResume.education = data;
        break;
      case 'skills':
        updatedResume.skills = data;
        break;
      case 'projects':
        updatedResume.projects = data;
        break;
    }
    
    // Update the context state immediately for real-time UI updates
    // This will trigger the auto-save functionality
    actions.updateResumeLocal(updatedResume);
  }, [currentResume, actions.updateResumeLocal]);

  // Get section completion status
  const getSectionStatus = useCallback((sectionId: string) => {
    if (!currentResume) return { completed: false, hasContent: false };

    switch (sectionId) {
      case 'personal':
        const personal = currentResume.personal;
        const personalCompleted = !!(personal?.firstName && personal?.lastName && personal?.email && personal?.phone && personal?.address);
        return { completed: personalCompleted, hasContent: !!(personal?.firstName || personal?.lastName) };
      
      case 'summary':
        const summaryCompleted = !!(currentResume.summary && currentResume.summary.length >= 50);
        return { completed: summaryCompleted, hasContent: !!currentResume.summary };
      
      case 'experience':
        const experienceCompleted = !!(currentResume.experience && currentResume.experience.length > 0);
        return { completed: experienceCompleted, hasContent: experienceCompleted };
      
      case 'education':
        const educationCompleted = !!(currentResume.education && currentResume.education.length > 0);
        return { completed: educationCompleted, hasContent: educationCompleted };
      
      case 'skills':
        const skillsCompleted = !!(currentResume.skills && currentResume.skills.length > 0);
        return { completed: skillsCompleted, hasContent: skillsCompleted };
      
      case 'projects':
        const projectsCompleted = !!(currentResume.projects && currentResume.projects.length > 0);
        return { completed: projectsCompleted, hasContent: projectsCompleted };
      
      default:
        return { completed: false, hasContent: false };
    }
  }, [currentResume]);

  // Get overall completion percentage
  const getCompletionPercentage = useCallback(() => {
    if (!currentResume) return 0;

    // Calculate completion based on all sections since all are optional
    const totalSections = SECTIONS.length;
    const completedSections = SECTIONS.filter(section => {
      const status = getSectionStatus(section.id);
      return status.completed;
    });

    // Avoid division by zero
    if (totalSections === 0) return 0;

    return Math.round((completedSections.length / totalSections) * 100);
  }, [currentResume, getSectionStatus]);

  // Render section header
  const renderSectionHeader = (section: typeof SECTIONS[0]) => {
    const isExpanded = expandedSections.has(section.id);
    const status = getSectionStatus(section.id);
    const completionPercentage = getCompletionPercentage();

    return (
      <TouchableOpacity
        key={section.id}
        style={[
          styles.sectionHeader,
          isExpanded && styles.sectionHeaderExpanded,
          status.completed && styles.sectionHeaderCompleted
        ]}
        onPress={() => toggleSection(section.id)}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={[
            styles.sectionIcon,
            status.completed && styles.sectionIconCompleted
          ]}>
            <Icon 
              name={section.icon as any} 
              size={20} 
              color={status.completed ? '#fff' : '#004D40'} 
            />
          </View>
          <View style={styles.sectionInfo}>
            <Text style={[
              styles.sectionTitle,
              status.completed && styles.sectionTitleCompleted
            ]}>
              {section.title}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {status.completed ? 'Completed' : status.hasContent ? 'In Progress' : 'Not Started'}
            </Text>
          </View>
        </View>
        
        <View style={styles.sectionHeaderRight}>
          {status.completed && (
            <Icon name="check-circle" size={20} color="#4CAF50" />
          )}
          <Icon 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Render section content
  const renderSectionContent = (sectionId: string) => {
    if (!currentResume || !expandedSections.has(sectionId)) return null;

    const commonProps = {
      onSave: handleSave,
      isSaving,
      disabled: isLoading
    };

    switch (sectionId) {
      case 'personal':
        return (
          <PersonalDetails
            personalDetails={currentResume.personal}
            onUpdate={(data) => handleSectionUpdate('personal', data)}
            {...commonProps}
          />
        );
      
      case 'summary':
        return (
          <Summary
            summary={currentResume.summary}
            onUpdate={(data) => handleSectionUpdate('summary', data)}
            resumeInfo={currentResume}
            {...commonProps}
          />
        );
      
      case 'experience':
        return (
          <Experience
            experience={currentResume.experience}
            onUpdate={(data) => handleSectionUpdate('experience', data)}
            resumeInfo={currentResume}
            {...commonProps}
          />
        );
      
      case 'education':
        return (
          <Education
            education={currentResume.education}
            onUpdate={(data) => handleSectionUpdate('education', data)}
            {...commonProps}
          />
        );
      
      case 'skills':
        return (
          <Skills
            skills={currentResume.skills}
            onUpdate={(data) => handleSectionUpdate('skills', data)}
            resumeInfo={currentResume}
            {...commonProps}
          />
        );
      
      case 'projects':
        return (
          <Projects
            projects={currentResume.projects}
            onUpdate={(data) => handleSectionUpdate('projects', data)}
            resumeInfo={currentResume}
            {...commonProps}
          />
        );
      
      default:
        return null;
    }
  };

  if (isLoading && !currentResume) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004D40" />
        <Text style={styles.loadingText}>Loading resume builder...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#ff6b35" />
        <Text style={styles.errorTitle}>Error Loading Resume</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/resume-dashboard');
            }
          }}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <LinearGradient
        colors={['#004D40', '#00695C']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.headerTitle}>Resume Builder</Text>
              <Text style={styles.headerSubtitle}>
                {getCompletionPercentage()}% Complete
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/(tabs)/resume-dashboard')}
            >
              <Icon name="arrow-left" size={16} color="#fff" />
              <Text style={styles.backButtonText}>
                Back
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => setShowPreview(!showPreview)}
            >
              <Icon name={showPreview ? "pencil" : "eye"} size={16} color="#004D40" />
              <Text style={styles.previewButtonText}>
                {showPreview ? 'Edit' : 'Preview'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {showPreview ? (
          <View style={styles.previewContainer}>
            <ResumePreview
              resumeData={currentResume!}
              onEdit={handleEditSection}
              onExport={handleExport}
              isEditing={true}
              style={styles.preview}
            />
          </View>
        ) : (
          <ScrollView style={styles.sectionsContainer} showsVerticalScrollIndicator={false}>
            {SECTIONS.map(section => (
              <View key={section.id} style={styles.section}>
                {renderSectionHeader(section)}
                {renderSectionContent(section.id)}
              </View>
            ))}
            
            {/* Completion Summary */}
            <View style={styles.completionSummary}>
              <Text style={styles.completionTitle}>Resume Progress</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getCompletionPercentage()}%` }
                  ]} 
                />
              </View>
              <Text style={styles.completionText}>
                {getCompletionPercentage()}% Complete
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 120, // Add extra padding for tab bar
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  headerRight: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 3,
    minWidth: 70,
    justifyContent: 'center',
  },
  previewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004D40',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 3,
    minWidth: 70,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 100, // Add extra padding for tab bar
  },
  preview: {
    flex: 1,
  },
  sectionsContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 150, // Increased padding to show Resume Progress section
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeaderExpanded: {
    borderBottomColor: '#004D40',
  },
  sectionHeaderCompleted: {
    backgroundColor: '#E8F5E8',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIconCompleted: {
    backgroundColor: '#4CAF50',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  sectionTitleCompleted: {
    color: '#2E7D32',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionSummary: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20, // Add bottom margin to ensure visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#004D40',
    borderRadius: 4,
  },
  completionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ResumeBuilderScreen;
