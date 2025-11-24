// lib/services/resume-pdf-service.ts
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { ResumeData } from '@/lib/resume';

/**
 * Generate HTML template for resume PDF
 */
function generateResumeHTML(resume: ResumeData): string {
  const { personal, summary, experience = [], education = [], skills = [], projects = [] } = resume;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #00A389;
        }
        
        .name {
          font-size: 28pt;
          font-weight: bold;
          color: #004D40;
          margin-bottom: 8px;
        }
        
        .job-title {
          font-size: 14pt;
          color: #00A389;
          margin-bottom: 12px;
          font-weight: 500;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
          font-size: 10pt;
          color: #666;
        }
        
        .contact-item {
          display: inline-flex;
          align-items: center;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          color: #004D40;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #00A389;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .summary {
          text-align: justify;
          line-height: 1.8;
          color: #444;
        }
        
        .experience-item, .education-item, .project-item {
          margin-bottom: 18px;
          page-break-inside: avoid;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 6px;
        }
        
        .item-title {
          font-size: 12pt;
          font-weight: bold;
          color: #004D40;
        }
        
        .item-subtitle {
          font-size: 11pt;
          color: #00A389;
          margin-bottom: 4px;
        }
        
        .item-date {
          font-size: 10pt;
          color: #666;
          font-style: italic;
        }
        
        .item-description {
          margin-top: 8px;
          line-height: 1.7;
          color: #555;
          text-align: justify;
        }
        
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .skill-item {
          display: inline-block;
          padding: 6px 14px;
          background: #E0F2F1;
          color: #004D40;
          border-radius: 15px;
          font-size: 10pt;
          font-weight: 500;
        }
        
        .location {
          font-size: 10pt;
          color: #666;
          margin-top: 2px;
        }
        
        ul {
          margin-left: 20px;
          margin-top: 6px;
        }
        
        li {
          margin-bottom: 4px;
          line-height: 1.6;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="name">${personal.firstName || ''} ${personal.lastName || ''}</div>
        ${personal.jobTitle ? `<div class="job-title">${personal.jobTitle}</div>` : ''}
        <div class="contact-info">
          ${personal.email ? `<span class="contact-item">📧 ${personal.email}</span>` : ''}
          ${personal.phone ? `<span class="contact-item">📱 ${personal.phone}</span>` : ''}
          ${personal.address ? `<span class="contact-item">📍 ${personal.address}</span>` : ''}
        </div>
      </div>

      <!-- Professional Summary -->
      ${summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="summary">${summary}</div>
        </div>
      ` : ''}

      <!-- Experience -->
      ${experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Work Experience</div>
          ${experience.map(exp => `
            <div class="experience-item">
              <div class="item-header">
                <div>
                  <div class="item-title">${exp.position || 'Position'}</div>
                  <div class="item-subtitle">${exp.company || 'Company'}</div>
                  ${exp.location ? `<div class="location">${exp.location}</div>` : ''}
                </div>
                <div class="item-date">
                  ${exp.startDate || 'Start'} - ${exp.current ? 'Present' : (exp.endDate || 'End')}
                </div>
              </div>
              ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Education -->
      ${education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${education.map(edu => `
            <div class="education-item">
              <div class="item-header">
                <div>
                  <div class="item-title">${edu.degree || 'Degree'}</div>
                  <div class="item-subtitle">${edu.institution || 'Institution'}</div>
                  ${edu.location ? `<div class="location">${edu.location}</div>` : ''}
                </div>
                <div class="item-date">
                  ${edu.startDate || 'Start'} - ${edu.current ? 'Present' : (edu.endDate || 'End')}
                </div>
              </div>
              ${edu.gpa ? `<div class="location">GPA: ${edu.gpa}</div>` : ''}
              ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Skills -->
      ${skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-container">
            ${skills.map(skill => `
              <span class="skill-item">${typeof skill === 'string' ? skill : skill.name || ''}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Projects -->
      ${projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${projects.map(proj => `
            <div class="project-item">
              <div class="item-header">
                <div>
                  <div class="item-title">${proj.title || 'Project Title'}</div>
                  ${proj.technologies ? `<div class="item-subtitle">${proj.technologies}</div>` : ''}
                </div>
                ${proj.date ? `<div class="item-date">${proj.date}</div>` : ''}
              </div>
              ${proj.description ? `<div class="item-description">${proj.description}</div>` : ''}
              ${proj.link ? `<div class="location">🔗 ${proj.link}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </body>
    </html>
  `;
}

/**
 * Generate PDF from resume data
 * @param resume Resume data object
 * @returns Object with uri and base64 of generated PDF
 */
export async function generateResumePDF(resume: ResumeData): Promise<{
  uri: string;
  base64: string;
}> {
  try {
    const html = generateResumeHTML(resume);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Read as base64 for email
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { uri, base64 };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Share resume PDF using native share dialog
 * @param resume Resume data object
 */
export async function shareResumePDF(resume: ResumeData): Promise<void> {
  try {
    const { uri } = await generateResumePDF(resume);
    
    const fileName = `${resume.personal.firstName}_${resume.personal.lastName}_Resume.pdf`
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '');

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Resume',
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw new Error('Failed to share resume. Please try again.');
  }
}

/**
 * Print resume using device's print dialog
 * @param resume Resume data object
 */
export async function printResume(resume: ResumeData): Promise<void> {
  try {
    const html = generateResumeHTML(resume);
    
    await Print.printAsync({
      html,
    });
  } catch (error) {
    console.error('Error printing resume:', error);
    throw new Error('Failed to print resume. Please try again.');
  }
}

/**
 * Generate filename for resume PDF
 * @param resume Resume data object
 * @returns Sanitized filename
 */
export function generateResumeFilename(resume: ResumeData): string {
  const firstName = resume.personal.firstName || 'Resume';
  const lastName = resume.personal.lastName || '';
  const name = `${firstName}_${lastName}`.trim();
  
  return `${name}_Resume.pdf`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '');
}
