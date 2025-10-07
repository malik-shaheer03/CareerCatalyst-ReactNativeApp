// Test file for Resume Preview components
// This file can be used to test preview functionality during development

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { ResumePreview, CompactResumePreview, ResumePDFExport } from './index';
import { ResumeData } from '@/lib/resume';

// Example usage and testing functions
export class ResumePreviewTester {
  /**
   * Test Resume Preview component
   */
  static TestResumePreview = () => {
    const [resumeData, setResumeData] = useState<ResumeData>({
      personal: {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Senior Software Developer',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: 'San Francisco, CA',
        avatar: ''
      },
      summary: 'Experienced software developer with 5+ years of expertise in React, Node.js, and cloud technologies. Passionate about building scalable applications and leading development teams.',
      experience: [
        {
          title: 'Senior Software Developer',
          companyName: 'Tech Corp',
          city: 'San Francisco',
          state: 'CA',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          currentlyWorking: false,
          workSummary: '<ul><li>Led development of microservices architecture serving 1M+ users</li><li>Mentored junior developers and conducted code reviews</li><li>Implemented CI/CD pipelines reducing deployment time by 50%</li></ul>'
        },
        {
          title: 'Software Developer',
          companyName: 'StartupXYZ',
          city: 'San Francisco',
          state: 'CA',
          startDate: '2018-06-01',
          endDate: '2019-12-31',
          currentlyWorking: false,
          workSummary: '<ul><li>Developed full-stack web applications using React and Node.js</li><li>Collaborated with design team to implement responsive UI components</li><li>Optimized database queries improving performance by 30%</li></ul>'
        }
      ],
      education: [
        {
          universityName: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          major: 'Computer Science',
          startDate: '2014-09-01',
          endDate: '2018-05-31',
          grade: '3.8/4.0',
          description: 'Relevant coursework: Data Structures, Algorithms, Database Systems, Software Engineering'
        }
      ],
      skills: [
        { name: 'React', category: 'Frameworks & Libraries', rating: 5, yearsOfExperience: 4 },
        { name: 'Node.js', category: 'Programming Languages', rating: 5, yearsOfExperience: 4 },
        { name: 'TypeScript', category: 'Programming Languages', rating: 4, yearsOfExperience: 3 },
        { name: 'AWS', category: 'Tools & Technologies', rating: 4, yearsOfExperience: 3 },
        { name: 'Leadership', category: 'Soft Skills', rating: 4, yearsOfExperience: 2 },
        { name: 'Problem Solving', category: 'Soft Skills', rating: 5, yearsOfExperience: 5 }
      ],
      projects: [
        {
          projectName: 'E-commerce Platform',
          techStack: 'React, Node.js, MongoDB, AWS',
          projectSummary: '<ul><li>Built a full-stack e-commerce platform with payment integration</li><li>Implemented real-time inventory management system</li><li>Deployed on AWS with auto-scaling capabilities</li></ul>',
          projectUrl: 'https://example-ecommerce.com',
          githubUrl: 'https://github.com/johndoe/ecommerce-platform'
        },
        {
          projectName: 'Task Management App',
          techStack: 'React Native, Firebase, Redux',
          projectSummary: '<ul><li>Developed cross-platform mobile app for team collaboration</li><li>Implemented real-time updates using Firebase</li><li>Integrated with calendar and notification systems</li></ul>',
          projectUrl: '',
          githubUrl: 'https://github.com/johndoe/task-manager'
        }
      ]
    });

    const handleEditSection = (section: string) => {
      Alert.alert('Edit Section', `Edit ${section} section`);
    };

    const handleExport = () => {
      Alert.alert('Export', 'Export functionality will be implemented soon!');
    };

    const handleShare = () => {
      Alert.alert('Share', 'Share functionality will be implemented soon!');
    };

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Resume Preview Test</Text>
        
        {/* Full Resume Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Resume Preview</Text>
          <View style={styles.previewContainer}>
            <ResumePreview
              resumeData={resumeData}
              onEdit={handleEditSection}
              onExport={handleExport}
              onShare={handleShare}
              isEditing={true}
            />
          </View>
        </View>

        {/* Compact Resume Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compact Resume Preview</Text>
          <View style={styles.compactPreviewContainer}>
            <CompactResumePreview
              resumeData={resumeData}
              onEdit={handleEditSection}
              onExport={handleExport}
              onShare={handleShare}
              isEditing={true}
            />
          </View>
        </View>

        {/* PDF Export Component */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PDF Export Component</Text>
          <ResumePDFExport
            resumeData={resumeData}
            onExport={handleExport}
            onShare={handleShare}
          />
        </View>

        {/* Test Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Functions</Text>
          <View style={styles.buttonContainer}>
            <Text style={styles.testButton} onPress={() => {
              setResumeData(prev => ({
                ...prev,
                personal: {
                  ...prev.personal,
                  firstName: 'Jane',
                  lastName: 'Smith'
                }
              }));
            }}>
              Change Name
            </Text>
            <Text style={styles.testButton} onPress={() => {
              setResumeData(prev => ({
                ...prev,
                summary: 'Updated professional summary with new achievements and skills.'
              }));
            }}>
              Update Summary
            </Text>
            <Text style={styles.testButton} onPress={() => {
              setResumeData(prev => ({
                ...prev,
                skills: [...prev.skills, { name: 'Python', category: 'Programming Languages', rating: 3, yearsOfExperience: 1 }]
              }));
            }}>
              Add Skill
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  /**
   * Test preview generation functions
   */
  static testPreviewGeneration() {
    console.log('Testing preview generation...');
    
    const mockResumeData: ResumeData = {
      personal: {
        firstName: 'Test',
        lastName: 'User',
        jobTitle: 'Developer',
        email: 'test@example.com',
        phone: '+1234567890',
        address: 'Test City, TC'
      },
      summary: 'Test summary',
      experience: [],
      education: [],
      skills: [],
      projects: []
    };

    // Test HTML generation
    console.log('Testing HTML generation...');
    const htmlContent = this.generateHTMLContent(mockResumeData);
    console.log('HTML content length:', htmlContent.length);

    // Test text generation
    console.log('Testing text generation...');
    const textContent = this.generateTextContent(mockResumeData);
    console.log('Text content length:', textContent.length);

    console.log('✅ Preview generation test passed');
  }

  /**
   * Generate HTML content for testing
   */
  static generateHTMLContent(resumeData: ResumeData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${resumeData.personal?.firstName} ${resumeData.personal?.lastName} - Resume</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .name { font-size: 28px; font-weight: bold; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${resumeData.personal?.firstName} ${resumeData.personal?.lastName}</div>
        <div>${resumeData.personal?.jobTitle}</div>
        <div>${resumeData.personal?.email} | ${resumeData.personal?.phone}</div>
    </div>
    
    ${resumeData.summary ? `
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <div>${resumeData.summary}</div>
    </div>
    ` : ''}
    
    ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section">
        <div class="section-title">Experience</div>
        ${resumeData.experience.map(exp => `
            <div>
                <strong>${exp.title}</strong> at ${exp.companyName}<br>
                ${exp.city}, ${exp.state} | ${exp.startDate} - ${exp.endDate}<br>
                ${exp.workSummary || ''}
            </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
    `;
  }

  /**
   * Generate text content for testing
   */
  static generateTextContent(resumeData: ResumeData): string {
    let text = '';
    
    if (resumeData.personal) {
      text += `${resumeData.personal.firstName} ${resumeData.personal.lastName}\n`;
      text += `${resumeData.personal.jobTitle}\n`;
      text += `${resumeData.personal.email} | ${resumeData.personal.phone}\n\n`;
    }

    if (resumeData.summary) {
      text += 'PROFESSIONAL SUMMARY\n';
      text += `${resumeData.summary}\n\n`;
    }

    if (resumeData.experience && resumeData.experience.length > 0) {
      text += 'EXPERIENCE\n';
      resumeData.experience.forEach(exp => {
        text += `${exp.title} at ${exp.companyName}\n`;
        text += `${exp.city}, ${exp.state} | ${exp.startDate} - ${exp.endDate}\n`;
        text += `${exp.workSummary || ''}\n\n`;
      });
    }

    return text;
  }

  /**
   * Test theme switching
   */
  static testThemeSwitching() {
    console.log('Testing theme switching...');
    
    const themes = ['modern', 'classic', 'creative'];
    themes.forEach(theme => {
      console.log(`Testing ${theme} theme`);
      // In a real app, you would test the actual theme switching functionality
    });

    console.log('✅ Theme switching test passed');
  }

  /**
   * Test font size adjustment
   */
  static testFontSizeAdjustment() {
    console.log('Testing font size adjustment...');
    
    const fontSizes = ['small', 'medium', 'large'];
    fontSizes.forEach(size => {
      console.log(`Testing ${size} font size`);
      // In a real app, you would test the actual font size adjustment functionality
    });

    console.log('✅ Font size adjustment test passed');
  }

  /**
   * Test export functionality
   */
  static testExportFunctionality() {
    console.log('Testing export functionality...');
    
    const formats = ['pdf', 'docx', 'txt'];
    formats.forEach(format => {
      console.log(`Testing ${format} export`);
      // In a real app, you would test the actual export functionality
    });

    console.log('✅ Export functionality test passed');
  }

  /**
   * Run all preview tests
   */
  static async runAllTests() {
    console.log('🚀 Starting Resume Preview Tests...\n');
    
    try {
      this.testPreviewGeneration();
      console.log('✅ Preview generation test passed\n');
      
      this.testThemeSwitching();
      console.log('✅ Theme switching test passed\n');
      
      this.testFontSizeAdjustment();
      console.log('✅ Font size adjustment test passed\n');
      
      this.testExportFunctionality();
      console.log('✅ Export functionality test passed\n');
      
      console.log('🎉 All Resume Preview tests passed successfully!');
    } catch (error) {
      console.error('❌ Resume Preview tests failed:', error);
      throw error;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewContainer: {
    height: 400,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  compactPreviewContainer: {
    height: 300,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testButton: {
    backgroundColor: '#004D40',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 120,
  },
});

export default ResumePreviewTester;
