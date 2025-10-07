import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Share
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ResumeData } from '@/lib/resume';

// Types
export interface ResumePDFExportProps {
  resumeData: ResumeData;
  onExport?: (format: 'pdf' | 'docx' | 'txt') => void;
  style?: any;
}

// Main Resume PDF Export Component
const ResumePDFExport: React.FC<ResumePDFExportProps> = ({
  resumeData,
  onExport,
  style
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Handle export
  const handleExport = useCallback(async (format: 'pdf' | 'docx' | 'txt') => {
    if (onExport) {
      onExport(format);
    } else {
      setIsExporting(true);
      try {
        // Generate text content
        const textContent = generateTextContent();
        
        if (format === 'txt') {
          // Share as text
          await Share.share({
            message: textContent,
            title: `${resumeData.personal?.firstName} ${resumeData.personal?.lastName} - Resume`
          });
        } else {
          // For PDF and DOCX, show alert for now
          Alert.alert(
            'Export Feature',
            `${format.toUpperCase()} export will be implemented soon! For now, you can share as text.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Share as Text', 
                onPress: async () => {
                  await Share.share({
                    message: textContent,
                    title: `${resumeData.personal?.firstName} ${resumeData.personal?.lastName} - Resume`
                  });
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Export error:', error);
        Alert.alert('Error', 'Failed to export resume');
      } finally {
        setIsExporting(false);
      }
    }
  }, [onExport, resumeData]);

  // Generate text content
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
      text += `${resumeData.summary}\n\n`;
    }

    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      text += 'EXPERIENCE\n';
      resumeData.experience.forEach((exp) => {
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

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Export Resume</Text>
      <Text style={styles.subtitle}>Choose your preferred format</Text>
      
      <View style={styles.exportOptions}>
        <TouchableOpacity
          style={[styles.exportButton, styles.pdfButton]}
          onPress={() => handleExport('pdf')}
          disabled={isExporting}
        >
          <Icon name="file-pdf-box" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>PDF</Text>
          <Text style={styles.exportButtonSubtext}>Portable Document</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, styles.docxButton]}
          onPress={() => handleExport('docx')}
          disabled={isExporting}
        >
          <Icon name="file-word-box" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>DOCX</Text>
          <Text style={styles.exportButtonSubtext}>Microsoft Word</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, styles.txtButton]}
          onPress={() => handleExport('txt')}
          disabled={isExporting}
        >
          <Icon name="file-document-outline" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>TXT</Text>
          <Text style={styles.exportButtonSubtext}>Plain Text</Text>
        </TouchableOpacity>
      </View>

      {isExporting && (
        <View style={styles.exportingOverlay}>
          <Text style={styles.exportingText}>Exporting...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  exportOptions: {
    gap: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  pdfButton: {
    backgroundColor: '#dc3545',
  },
  docxButton: {
    backgroundColor: '#2b579a',
  },
  txtButton: {
    backgroundColor: '#6c757d',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  exportButtonSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  exportingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  exportingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default ResumePDFExport;
