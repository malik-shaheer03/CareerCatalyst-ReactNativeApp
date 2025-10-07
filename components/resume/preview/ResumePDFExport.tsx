import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ResumeData } from '@/lib/resume';

// Types
export interface ResumePDFExportProps {
  resumeData: ResumeData;
  onExport?: (format: 'pdf' | 'docx' | 'txt') => Promise<void>;
  onShare?: (content: string) => Promise<void>;
  disabled?: boolean;
  style?: any;
}

// Main Resume PDF Export Component
const ResumePDFExport: React.FC<ResumePDFExportProps> = ({
  resumeData,
  onExport,
  onShare,
  disabled = false,
  style
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf');

  // Generate HTML content for PDF
  const generateHTMLContent = useCallback(() => {
    const theme = {
      primaryColor: '#004D40',
      textColor: '#333',
      lightTextColor: '#666',
      backgroundColor: '#fff'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${resumeData.personal?.firstName || ''} ${resumeData.personal?.lastName || ''} - Resume</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: ${theme.textColor};
            background-color: ${theme.backgroundColor};
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid ${theme.primaryColor};
            padding-bottom: 20px;
        }
        .name {
            font-size: 28px;
            font-weight: bold;
            color: ${theme.textColor};
            margin-bottom: 5px;
        }
        .job-title {
            font-size: 18px;
            color: ${theme.primaryColor};
            margin-bottom: 15px;
        }
        .contact-info {
            font-size: 14px;
            color: ${theme.lightTextColor};
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: ${theme.primaryColor};
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            border-bottom: 1px solid ${theme.primaryColor};
            padding-bottom: 5px;
        }
        .experience-item, .education-item, .project-item {
            margin-bottom: 20px;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5px;
        }
        .item-title {
            font-weight: bold;
            font-size: 14px;
        }
        .item-company, .item-university {
            font-weight: bold;
            color: ${theme.primaryColor};
            font-size: 14px;
        }
        .item-location, .item-dates {
            font-size: 12px;
            color: ${theme.lightTextColor};
            margin-bottom: 8px;
        }
        .item-description {
            font-size: 13px;
            line-height: 1.5;
        }
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .skill-item {
            background-color: #f0f0f0;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            color: ${theme.primaryColor};
        }
        .skill-category {
            margin-bottom: 10px;
        }
        .skill-category-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 5px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${resumeData.personal?.firstName || ''} ${resumeData.personal?.lastName || ''}</div>
        <div class="job-title">${resumeData.personal?.jobTitle || ''}</div>
        <div class="contact-info">
            ${resumeData.personal?.email ? `📧 ${resumeData.personal.email}` : ''}
            ${resumeData.personal?.phone ? ` | 📞 ${resumeData.personal.phone}` : ''}
            ${resumeData.personal?.address ? ` | 📍 ${resumeData.personal.address}` : ''}
        </div>
    </div>

    ${resumeData.summary ? `
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="item-description">${resumeData.summary.replace(/<[^>]*>/g, '')}</div>
    </div>
    ` : ''}

    ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section">
        <div class="section-title">Experience</div>
        ${resumeData.experience.map(exp => `
            <div class="experience-item">
                <div class="item-header">
                    <div class="item-title">${exp.title || ''}</div>
                    <div class="item-company">${exp.companyName || ''}</div>
                </div>
                <div class="item-location">${exp.city || ''}, ${exp.state || ''} | ${exp.startDate || ''} - ${exp.endDate || ''}</div>
                <div class="item-description">${exp.workSummary ? exp.workSummary.replace(/<[^>]*>/g, '') : ''}</div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section">
        <div class="section-title">Education</div>
        ${resumeData.education.map(edu => `
            <div class="education-item">
                <div class="item-title">${edu.degree || ''} in ${edu.major || ''}</div>
                <div class="item-university">${edu.universityName || ''}</div>
                <div class="item-dates">${edu.startDate || ''} - ${edu.endDate || ''} | Grade: ${edu.grade || ''}</div>
                ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${resumeData.skills && resumeData.skills.length > 0 ? `
    <div class="section">
        <div class="section-title">Skills</div>
        ${Object.entries(resumeData.skills.reduce((acc, skill) => {
            const category = skill.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(skill.name);
            return acc;
        }, {} as { [key: string]: string[] })).map(([category, skills]) => `
            <div class="skill-category">
                <div class="skill-category-title">${category}</div>
                <div class="skills-list">
                    ${skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
                </div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${resumeData.projects && resumeData.projects.length > 0 ? `
    <div class="section">
        <div class="section-title">Projects</div>
        ${resumeData.projects.map(project => `
            <div class="project-item">
                <div class="item-title">${project.projectName || ''}</div>
                <div class="item-location">Tech Stack: ${project.techStack || ''}</div>
                <div class="item-description">${project.projectSummary ? project.projectSummary.replace(/<[^>]*>/g, '') : ''}</div>
                ${project.projectUrl || project.githubUrl ? `
                    <div class="item-location">
                        ${project.projectUrl ? '🔗 Live Demo' : ''}
                        ${project.projectUrl && project.githubUrl ? ' | ' : ''}
                        ${project.githubUrl ? '📁 GitHub' : ''}
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
    `;
  }, [resumeData]);

  // Generate plain text content
  const generateTextContent = useCallback(() => {
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
      text += `${resumeData.summary.replace(/<[^>]*>/g, '')}\n\n`;
    }

    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      text += 'EXPERIENCE\n';
      resumeData.experience.forEach((exp) => {
        text += `${exp.title || ''} at ${exp.companyName || ''}\n`;
        text += `${exp.city || ''}, ${exp.state || ''} | ${exp.startDate || ''} - ${exp.endDate || ''}\n`;
        text += `${exp.workSummary ? exp.workSummary.replace(/<[^>]*>/g, '') : ''}\n\n`;
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
        text += `${project.projectSummary ? project.projectSummary.replace(/<[^>]*>/g, '') : ''}\n\n`;
      });
    }

    return text;
  }, [resumeData]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      
      if (onExport) {
        await onExport(exportFormat);
      } else {
        // Fallback export functionality
        const content = exportFormat === 'txt' ? generateTextContent() : generateHTMLContent();
        
        if (Platform.OS === 'web') {
          // For web, create a downloadable file
          const blob = new Blob([content], { 
            type: exportFormat === 'txt' ? 'text/plain' : 'text/html' 
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `resume.${exportFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          // For mobile, show content in alert (in real app, you'd use a proper sharing mechanism)
          Alert.alert('Export', `Content exported as ${exportFormat.toUpperCase()}`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export resume. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat, onExport, generateTextContent, generateHTMLContent]);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      const content = generateTextContent();
      
      if (onShare) {
        await onShare(content);
      } else {
        // Fallback share functionality
        if (Platform.OS === 'web') {
          await navigator.share({
            title: `${resumeData.personal?.firstName} ${resumeData.personal?.lastName} - Resume`,
            text: content
          });
        } else {
          Alert.alert('Share', 'Share functionality will be implemented with proper native sharing.');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share resume. Please try again.');
    }
  }, [onShare, generateTextContent, resumeData]);

  return (
    <View style={[styles.container, style]}>
      {/* Format Selection */}
      <View style={styles.formatSelector}>
        <Text style={styles.formatLabel}>Export Format:</Text>
        <View style={styles.formatButtons}>
          {(['pdf', 'docx', 'txt'] as const).map((format) => (
            <TouchableOpacity
              key={format}
              style={[
                styles.formatButton,
                exportFormat === format && styles.formatButtonSelected
              ]}
              onPress={() => setExportFormat(format)}
              disabled={disabled}
            >
              <Text style={[
                styles.formatButtonText,
                exportFormat === format && styles.formatButtonTextSelected
              ]}>
                {format.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={handleExport}
          disabled={disabled || isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="download" size={20} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>
            {isExporting ? 'Exporting...' : 'Export Resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={disabled}
        >
          <Icon name="share" size={20} color="#004D40" />
          <Text style={[styles.actionButtonText, styles.shareButtonText]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Export Info */}
      <View style={styles.infoContainer}>
        <Icon name="information" size={16} color="#666" />
        <Text style={styles.infoText}>
          {exportFormat === 'pdf' && 'PDF format provides the best formatting and is widely accepted by employers.'}
          {exportFormat === 'docx' && 'DOCX format is compatible with Microsoft Word and most word processors.'}
          {exportFormat === 'txt' && 'TXT format is a plain text version that can be easily copied and pasted.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
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
  formatSelector: {
    marginBottom: 16,
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  formatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  formatButtonSelected: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  formatButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  formatButtonTextSelected: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#004D40',
  },
  shareButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#004D40',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  shareButtonText: {
    color: '#004D40',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default ResumePDFExport;
