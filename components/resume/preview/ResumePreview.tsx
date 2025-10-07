import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ResumeData } from '@/lib/resume';
import { FormattedText } from '../TextFormatter';

// Types
export interface ResumePreviewProps {
  resumeData: ResumeData;
  onEdit?: (section: string) => void;
  onExport?: () => void;
  isEditing?: boolean;
  style?: any;
}

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Main Resume Preview Component
const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData,
  onEdit,
  onExport,
  isEditing = false,
  style
}) => {

  // Default theme
  const currentTheme = {
    primaryColor: '#004D40',
    secondaryColor: '#E8F5E8',
    textColor: '#333',
    lightTextColor: '#666',
    backgroundColor: '#fff',
    borderColor: '#e0e0e0'
  };

  // Default font sizes
  const currentFontSize = {
    base: 14,
    heading: 22,
    subheading: 16,
    small: 12
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
    <View style={[styles.section, { borderBottomColor: currentTheme.borderColor }]}>
      <View style={styles.personalHeader}>
        <View style={styles.personalInfo}>
          <Text style={[styles.name, { color: currentTheme.textColor, fontSize: currentFontSize.heading }]}>
            {resumeData.personal?.firstName || 'First Name'} {resumeData.personal?.lastName || 'Last Name'}
          </Text>
          <Text style={[styles.jobTitle, { color: currentTheme.primaryColor, fontSize: currentFontSize.subheading }]}>
            {resumeData.personal?.jobTitle || 'Your Job Title'}
          </Text>
          <View style={styles.contactInfo}>
            {resumeData.personal?.email && (
              <View style={styles.contactItem}>
                <Icon name="email" size={14} color={currentTheme.lightTextColor} />
                <Text style={[styles.contactText, { color: currentTheme.lightTextColor, fontSize: currentFontSize.base }]}>
                  {resumeData.personal.email}
                </Text>
              </View>
            )}
            {resumeData.personal?.phone && (
              <View style={styles.contactItem}>
                <Icon name="phone" size={14} color={currentTheme.lightTextColor} />
                <Text style={[styles.contactText, { color: currentTheme.lightTextColor, fontSize: currentFontSize.base }]}>
                  {resumeData.personal.phone}
                </Text>
              </View>
            )}
            {resumeData.personal?.address && (
              <View style={styles.contactItem}>
                <Icon name="map-marker" size={14} color={currentTheme.lightTextColor} />
                <Text style={[styles.contactText, { color: currentTheme.lightTextColor, fontSize: currentFontSize.base }]}>
                  {resumeData.personal.address}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {isEditing && (
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: currentTheme.secondaryColor }]}
          onPress={() => handleEditSection('personal')}
        >
          <Icon name="pencil" size={16} color={currentTheme.primaryColor} />
          <Text style={[styles.editButtonText, { color: currentTheme.primaryColor }]}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render summary section
  const renderSummary = () => {
    if (!resumeData.summary) return null;

    return (
      <View style={[styles.section, { borderBottomColor: currentTheme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, fontSize: currentFontSize.subheading }]}>
          PROFESSIONAL SUMMARY
        </Text>
        <FormattedText
          text={resumeData.summary}
          style={[styles.sectionContent, { color: currentTheme.textColor, fontSize: currentFontSize.base }]}
        />
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: currentTheme.secondaryColor }]}
            onPress={() => handleEditSection('summary')}
          >
            <Icon name="pencil" size={16} color={currentTheme.primaryColor} />
            <Text style={[styles.editButtonText, { color: currentTheme.primaryColor }]}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render experience section
  const renderExperience = () => {
    if (!resumeData.experience || resumeData.experience.length === 0) return null;

    return (
      <View style={[styles.section, { borderBottomColor: currentTheme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, fontSize: currentFontSize.subheading }]}>
          EXPERIENCE
        </Text>
        {resumeData.experience.map((exp, index) => (
          <View key={index} style={styles.experienceItem}>
            <View style={styles.experienceHeader}>
              <Text style={[styles.experienceTitle, { color: currentTheme.textColor, fontSize: currentFontSize.base }]}>
                {exp.title}
              </Text>
              <Text style={[styles.experienceCompany, { color: currentTheme.primaryColor, fontSize: currentFontSize.base }]}>
                {exp.companyName}
              </Text>
            </View>
            <Text style={[styles.experienceLocation, { color: currentTheme.lightTextColor, fontSize: currentFontSize.small }]}>
              {exp.city}, {exp.state} | {exp.startDate} - {exp.endDate}
            </Text>
            {exp.workSummary && (
              <FormattedText
                text={exp.workSummary}
                style={[styles.experienceDescription, { color: currentTheme.textColor, fontSize: currentFontSize.base }]}
              />
            )}
          </View>
        ))}
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: currentTheme.secondaryColor }]}
            onPress={() => handleEditSection('experience')}
          >
            <Icon name="pencil" size={16} color={currentTheme.primaryColor} />
            <Text style={[styles.editButtonText, { color: currentTheme.primaryColor }]}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render education section
  const renderEducation = () => {
    if (!resumeData.education || resumeData.education.length === 0) return null;

    return (
      <View style={[styles.section, { borderBottomColor: currentTheme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, fontSize: currentFontSize.subheading }]}>
          EDUCATION
        </Text>
        {resumeData.education.map((edu, index) => (
          <View key={index} style={styles.educationItem}>
            <Text style={[styles.educationDegree, { color: currentTheme.textColor, fontSize: currentFontSize.base }]}>
              {edu.degree} in {edu.major}
            </Text>
            <Text style={[styles.educationUniversity, { color: currentTheme.primaryColor, fontSize: currentFontSize.base }]}>
              {edu.universityName}
            </Text>
            <Text style={[styles.educationDetails, { color: currentTheme.lightTextColor, fontSize: currentFontSize.small }]}>
              {edu.startDate} - {edu.endDate} | Grade: {edu.grade}
            </Text>
            {edu.description && (
              <Text style={[styles.educationDescription, { color: currentTheme.textColor, fontSize: currentFontSize.base }]}>
                {edu.description}
              </Text>
            )}
          </View>
        ))}
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: currentTheme.secondaryColor }]}
            onPress={() => handleEditSection('education')}
          >
            <Icon name="pencil" size={16} color={currentTheme.primaryColor} />
            <Text style={[styles.editButtonText, { color: currentTheme.primaryColor }]}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render skills section
  const renderSkills = () => {
    if (!resumeData.skills || resumeData.skills.length === 0) return null;

    const skillsByCategory = resumeData.skills.reduce((acc, skill) => {
      const category = skill.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {} as { [key: string]: (typeof resumeData.skills)[0][] });

    return (
      <View style={[styles.section, { borderBottomColor: currentTheme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, fontSize: currentFontSize.subheading }]}>
          SKILLS
        </Text>
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <View key={category} style={styles.skillCategory}>
            <Text style={[styles.skillCategoryTitle, { color: currentTheme.textColor, fontSize: currentFontSize.base }]}>
              {category}
            </Text>
            <View style={styles.skillList}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={[styles.skillName, { color: currentTheme.textColor, fontSize: currentFontSize.base }]}>
                    {skill.name}
                  </Text>
                  {skill.rating && (
                    <View style={styles.skillRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name={star <= (skill.rating || 0) ? 'star' : 'star-outline'}
                          size={12}
                          color={star <= (skill.rating || 0) ? '#ffc107' : currentTheme.lightTextColor}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: currentTheme.secondaryColor }]}
            onPress={() => handleEditSection('skills')}
          >
            <Icon name="pencil" size={16} color={currentTheme.primaryColor} />
            <Text style={[styles.editButtonText, { color: currentTheme.primaryColor }]}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render projects section
  const renderProjects = () => {
    if (!resumeData.projects || resumeData.projects.length === 0) return null;

    return (
      <View style={[styles.section, { borderBottomColor: currentTheme.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, fontSize: currentFontSize.subheading }]}>
          PROJECTS
        </Text>
        {resumeData.projects.map((project, index) => (
          <View key={index} style={styles.projectItem}>
            <Text style={[styles.projectName, { color: currentTheme.textColor, fontSize: currentFontSize.base }]}>
              {project.projectName}
            </Text>
            <Text style={[styles.projectTech, { color: currentTheme.primaryColor, fontSize: currentFontSize.small }]}>
              {project.techStack}
            </Text>
            {project.projectSummary && (
              <FormattedText
                text={project.projectSummary}
                style={[styles.projectDescription, { color: currentTheme.textColor, fontSize: currentFontSize.base }]}
              />
            )}
            {((project as any).projectUrl || (project as any).githubUrl) && (
              <View style={styles.projectLinks}>
                {(project as any).projectUrl && (
                  <Text style={[styles.projectLink, { color: currentTheme.primaryColor, fontSize: currentFontSize.small }]}>
                    🔗 Live Demo
                  </Text>
                )}
                {(project as any).githubUrl && (
                  <Text style={[styles.projectLink, { color: currentTheme.primaryColor, fontSize: currentFontSize.small }]}>
                    📁 GitHub
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
        {isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: currentTheme.secondaryColor }]}
            onPress={() => handleEditSection('projects')}
          >
            <Icon name="pencil" size={16} color={currentTheme.primaryColor} />
            <Text style={[styles.editButtonText, { color: currentTheme.primaryColor }]}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }, style]}>
      {/* Header with download button */}
      <View style={[styles.header, { borderBottomColor: currentTheme.borderColor }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: currentTheme.textColor }]}>Resume Preview</Text>
          <TouchableOpacity
            style={[styles.downloadButton, { backgroundColor: currentTheme.primaryColor }]}
            onPress={handleExport}
          >
            <Icon name="download" size={16} color="#fff" />
            <Text style={styles.downloadButtonText}>Download PDF</Text>
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
    padding: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  contactInfo: {
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    lineHeight: 20,
  },
  experienceItem: {
    marginBottom: 16,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  experienceTitle: {
    fontWeight: '600',
    flex: 1,
  },
  experienceCompany: {
    fontWeight: '600',
  },
  experienceLocation: {
    marginBottom: 8,
  },
  experienceDescription: {
    lineHeight: 18,
  },
  educationItem: {
    marginBottom: 12,
  },
  educationDegree: {
    fontWeight: '600',
    marginBottom: 2,
  },
  educationUniversity: {
    fontWeight: '600',
    marginBottom: 2,
  },
  educationDetails: {
    marginBottom: 4,
  },
  educationDescription: {
    lineHeight: 18,
  },
  skillCategory: {
    marginBottom: 12,
  },
  skillCategoryTitle: {
    fontWeight: '600',
    marginBottom: 6,
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skillName: {
    fontSize: 12,
  },
  skillRating: {
    flexDirection: 'row',
    gap: 1,
  },
  projectItem: {
    marginBottom: 16,
  },
  projectName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  projectTech: {
    marginBottom: 8,
    fontStyle: 'italic',
  },
  projectDescription: {
    lineHeight: 18,
    marginBottom: 8,
  },
  projectLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  projectLink: {
    textDecorationLine: 'underline',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ResumePreview;
