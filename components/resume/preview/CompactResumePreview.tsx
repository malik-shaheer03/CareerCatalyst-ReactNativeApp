import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ResumeData } from '@/lib/resume';
import { FormattedText } from '../TextFormatter';

// Types
export interface CompactResumePreviewProps {
  resumeData: ResumeData;
  onEdit?: (section: string) => void;
  onExport?: () => void;
  onShare?: () => void;
  isEditing?: boolean;
  style?: any;
}

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Main Compact Resume Preview Component
const CompactResumePreview: React.FC<CompactResumePreviewProps> = ({
  resumeData,
  onEdit,
  onExport,
  onShare,
  isEditing = false,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Theme configuration for compact view
  const theme = {
    primaryColor: '#004D40',
    secondaryColor: '#E8F5E8',
    textColor: '#333',
    lightTextColor: '#666',
    backgroundColor: '#fff',
    borderColor: '#e0e0e0'
  };

  // Handle edit section
  const handleEditSection = useCallback((section: string) => {
    if (onEdit) {
      onEdit(section);
    }
  }, [onEdit]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (onExport) {
      onExport();
    } else {
      Alert.alert('Export', 'Export functionality will be implemented soon!');
    }
  }, [onExport]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (onShare) {
      onShare();
    } else {
      try {
        const resumeText = generateResumeText();
        await Share.share({
          message: resumeText,
          title: `${resumeData.personal?.firstName} ${resumeData.personal?.lastName} - Resume`
        });
      } catch (error) {
        console.error('Share error:', error);
        Alert.alert('Error', 'Failed to share resume');
      }
    }
  }, [onShare, resumeData]);

  // Generate plain text resume
  const generateResumeText = useCallback(() => {
    let text = '';
    
    // Personal details
    if (resumeData.personal) {
      text += `${resumeData.personal.firstName || ''} ${resumeData.personal.lastName || ''}\n`;
      text += `${resumeData.personal.jobTitle || ''}\n`;
      text += `${resumeData.personal.email || ''} | ${resumeData.personal.phone || ''}\n`;
      text += `${resumeData.personal.address || ''}\n\n`;
    }

    // Summary
    if (resumeData.summary) {
      text += 'PROFESSIONAL SUMMARY\n';
      text += `${resumeData.summary}\n\n`;
    }

    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      text += 'EXPERIENCE\n';
      resumeData.experience.forEach((exp, index) => {
        text += `${exp.title || ''} at ${exp.companyName || ''}\n`;
        text += `${exp.city || ''}, ${exp.state || ''} | ${exp.startDate || ''} - ${exp.endDate || ''}\n`;
        text += `${exp.workSummary || ''}\n\n`;
      });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      text += 'EDUCATION\n';
      resumeData.education.forEach((edu) => {
        text += `${edu.degree || ''} in ${edu.major || ''}\n`;
        text += `${edu.universityName || ''} | ${edu.startDate || ''} - ${edu.endDate || ''}\n`;
        text += `Grade: ${edu.grade || ''}\n\n`;
      });
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      text += 'SKILLS\n';
      const skillsByCategory = resumeData.skills.reduce((acc, skill) => {
        const category = skill.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
      }, {} as { [key: string]: string[] });

      Object.entries(skillsByCategory).forEach(([category, skills]) => {
        text += `${category}: ${skills.join(', ')}\n`;
      });
      text += '\n';
    }

    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      text += 'PROJECTS\n';
      resumeData.projects.forEach((project) => {
        text += `${project.projectName || ''}\n`;
        text += `Tech Stack: ${project.techStack || ''}\n`;
        text += `${project.projectSummary || ''}\n\n`;
      });
    }

    return text;
  }, [resumeData]);

  // Render personal details section
  const renderPersonalDetails = () => (
    <View style={[styles.section, { borderBottomColor: theme.borderColor }]}>
      <View style={styles.personalHeader}>
        <View style={styles.personalInfo}>
          <Text style={[styles.name, { color: theme.textColor }]}>
            {`${resumeData.personal?.firstName || 'First Name'} ${resumeData.personal?.lastName || 'Last Name'}`}
          </Text>
          <Text style={[styles.jobTitle, { color: theme.primaryColor }]}>
            {resumeData.personal?.jobTitle || 'Your Job Title'}
          </Text>
          <View style={styles.contactInfo}>
            {resumeData.personal?.email && (
              <Text style={[styles.contactText, { color: theme.lightTextColor }]}>
                📧 {resumeData.personal.email}
              </Text>
            )}
            {resumeData.personal?.phone && (
              <Text style={[styles.contactText, { color: theme.lightTextColor }]}>
                📞 {resumeData.personal.phone}
              </Text>
            )}
            {resumeData.personal?.address && (
              <Text style={[styles.contactText, { color: theme.lightTextColor }]}>
                📍 {resumeData.personal.address}
              </Text>
            )}
          </View>
        </View>
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.secondaryColor }]}
            onPress={() => handleEditSection('personal')}
          >
            <Icon name="pencil" size={14} color={theme.primaryColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render summary section
  const renderSummary = () => {
    if (!resumeData.summary) return null;

    return (
      <View style={[styles.section, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.primaryColor }]}>
          SUMMARY
        </Text>
        <FormattedText
          text={resumeData.summary}
          style={[styles.sectionContent, { color: theme.textColor }]}
          numberOfLines={isExpanded ? undefined : 3}
        />
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.secondaryColor }]}
            onPress={() => handleEditSection('summary')}
          >
            <Icon name="pencil" size={14} color={theme.primaryColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render experience section
  const renderExperience = () => {
    if (!resumeData.experience || resumeData.experience.length === 0) return null;

    const displayExperience = isExpanded ? resumeData.experience : resumeData.experience.slice(0, 2);

    return (
      <View style={[styles.section, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.primaryColor }]}>
          EXPERIENCE
        </Text>
        {displayExperience.map((exp, index) => (
          <View key={index} style={styles.experienceItem}>
            <Text style={[styles.experienceTitle, { color: theme.textColor }]}>
              {exp.title}
            </Text>
            <Text style={[styles.experienceCompany, { color: theme.primaryColor }]}>
              {exp.companyName}
            </Text>
            <Text style={[styles.experienceLocation, { color: theme.lightTextColor }]}>
              {exp.city}, {exp.state} | {exp.startDate} - {exp.endDate}
            </Text>
            {exp.workSummary && (
              <FormattedText
                text={exp.workSummary}
                style={[styles.experienceDescription, { color: theme.textColor }]}
                numberOfLines={isExpanded ? undefined : 2}
              />
            )}
          </View>
        ))}
        {resumeData.experience.length > 2 && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={[styles.expandButtonText, { color: theme.primaryColor }]}>
              {isExpanded ? 'Show Less' : `Show ${resumeData.experience.length - 2} More`}
            </Text>
            <Icon 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={theme.primaryColor} 
            />
          </TouchableOpacity>
        )}
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.secondaryColor }]}
            onPress={() => handleEditSection('experience')}
          >
            <Icon name="pencil" size={14} color={theme.primaryColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render education section
  const renderEducation = () => {
    if (!resumeData.education || resumeData.education.length === 0) return null;

    return (
      <View style={[styles.section, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.primaryColor }]}>
          EDUCATION
        </Text>
        {resumeData.education.map((edu, index) => (
          <View key={index} style={styles.educationItem}>
            <Text style={[styles.educationDegree, { color: theme.textColor }]}>
              {edu.degree} in {edu.major}
            </Text>
            <Text style={[styles.educationUniversity, { color: theme.primaryColor }]}>
              {edu.universityName}
            </Text>
            <Text style={[styles.educationDetails, { color: theme.lightTextColor }]}>
              {edu.startDate} - {edu.endDate} | Grade: {edu.grade}
            </Text>
          </View>
        ))}
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.secondaryColor }]}
            onPress={() => handleEditSection('education')}
          >
            <Icon name="pencil" size={14} color={theme.primaryColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render skills section
  const renderSkills = () => {
    if (!resumeData.skills || resumeData.skills.length === 0) return null;

    const displaySkills = isExpanded ? resumeData.skills : resumeData.skills.slice(0, 6);

    return (
      <View style={[styles.section, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.primaryColor }]}>
          SKILLS
        </Text>
        <View style={styles.skillList}>
          {displaySkills.map((skill, index) => (
            <View key={index} style={[styles.skillItem, { backgroundColor: theme.secondaryColor }]}>
              <Text style={[styles.skillName, { color: theme.primaryColor }]}>
                {skill.name}
              </Text>
            </View>
          ))}
        </View>
        {resumeData.skills.length > 6 && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={[styles.expandButtonText, { color: theme.primaryColor }]}>
              {isExpanded ? 'Show Less' : `Show ${resumeData.skills.length - 6} More`}
            </Text>
            <Icon 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={theme.primaryColor} 
            />
          </TouchableOpacity>
        )}
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.secondaryColor }]}
            onPress={() => handleEditSection('skills')}
          >
            <Icon name="pencil" size={14} color={theme.primaryColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render projects section
  const renderProjects = () => {
    if (!resumeData.projects || resumeData.projects.length === 0) return null;

    const displayProjects = isExpanded ? resumeData.projects : resumeData.projects.slice(0, 2);

    return (
      <View style={[styles.section, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.primaryColor }]}>
          PROJECTS
        </Text>
        {displayProjects.map((project, index) => (
          <View key={index} style={styles.projectItem}>
            <Text style={[styles.projectName, { color: theme.textColor }]}>
              {project.projectName}
            </Text>
            <Text style={[styles.projectTech, { color: theme.primaryColor }]}>
              {project.techStack}
            </Text>
            {project.projectSummary && (
              <FormattedText
                text={project.projectSummary}
                style={[styles.projectDescription, { color: theme.textColor }]}
                numberOfLines={isExpanded ? undefined : 2}
              />
            )}
          </View>
        ))}
        {resumeData.projects.length > 2 && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={[styles.expandButtonText, { color: theme.primaryColor }]}>
              {isExpanded ? 'Show Less' : `Show ${resumeData.projects.length - 2} More`}
            </Text>
            <Icon 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={theme.primaryColor} 
            />
          </TouchableOpacity>
        )}
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.secondaryColor }]}
            onPress={() => handleEditSection('projects')}
          >
            <Icon name="pencil" size={14} color={theme.primaryColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }, style]}>
      {/* Header with controls */}
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Preview</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.secondaryColor }]}
            onPress={handleShare}
          >
            <Icon name="share" size={16} color={theme.primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.secondaryColor }]}
            onPress={handleExport}
          >
            <Icon name="download" size={16} color={theme.primaryColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Resume content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPersonalDetails()}
        {renderSummary()}
        {renderExperience()}
        {renderEducation()}
        {renderSkills()}
        {renderProjects()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  section: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  personalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  personalInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactInfo: {
    gap: 2,
  },
  contactText: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 12,
    lineHeight: 16,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  experienceCompany: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  experienceLocation: {
    fontSize: 10,
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 11,
    lineHeight: 14,
  },
  educationItem: {
    marginBottom: 8,
  },
  educationDegree: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  educationUniversity: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  educationDetails: {
    fontSize: 10,
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillName: {
    fontSize: 10,
    fontWeight: '600',
  },
  projectItem: {
    marginBottom: 12,
  },
  projectName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  projectTech: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 11,
    lineHeight: 14,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 6,
    borderRadius: 4,
  },
});

export default CompactResumePreview;
