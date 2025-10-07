import { ResumeData, ResumeListItem, PersonalDetails, Experience, Education, Skill, Project } from './resumeAPI';

export class ResumeUtils {
  /**
   * Generate a unique resume title
   */
  static generateResumeTitle(personalDetails?: PersonalDetails, existingTitles?: string[]): string {
    if (personalDetails?.firstName && personalDetails?.lastName) {
      const baseTitle = `${personalDetails.firstName} ${personalDetails.lastName} Resume`;
      return this.makeTitleUnique(baseTitle, existingTitles || []);
    }
    return this.makeTitleUnique('Untitled Resume', existingTitles || []);
  }

  /**
   * Make title unique by adding number suffix
   */
  private static makeTitleUnique(title: string, existingTitles: string[]): string {
    if (!existingTitles.includes(title)) {
      return title;
    }

    let counter = 1;
    let newTitle = `${title} (${counter})`;
    
    while (existingTitles.includes(newTitle)) {
      counter++;
      newTitle = `${title} (${counter})`;
    }
    
    return newTitle;
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format date range
   */
  static formatDateRange(startDate: string, endDate: string, currentlyWorking?: boolean): string {
    const start = this.formatDate(startDate);
    const end = currentlyWorking ? 'Present' : this.formatDate(endDate);
    return `${start} - ${end}`;
  }

  /**
   * Calculate years of experience
   */
  static calculateExperienceYears(experiences: Experience[]): number {
    if (!experiences || experiences.length === 0) return 0;

    let totalMonths = 0;
    const currentDate = new Date();

    experiences.forEach(exp => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.currentlyWorking ? currentDate : new Date(exp.endDate);
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      
      totalMonths += Math.max(0, months);
    });

    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get experience level based on years
   */
  static getExperienceLevel(years: number): string {
    if (years < 1) return 'Entry Level';
    if (years < 3) return 'Junior';
    if (years < 5) return 'Mid-Level';
    if (years < 10) return 'Senior';
    return 'Expert';
  }

  /**
   * Extract skills from text
   */
  static extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java',
      'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'HTML', 'CSS',
      'SASS', 'SCSS', 'Bootstrap', 'Tailwind', 'jQuery', 'Express', 'Django', 'Flask',
      'Spring', 'Laravel', 'Rails', 'ASP.NET', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis',
      'Firebase', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab',
      'CI/CD', 'Jenkins', 'Agile', 'Scrum', 'DevOps', 'Machine Learning', 'AI', 'Data Science',
      'SQL', 'NoSQL', 'REST API', 'GraphQL', 'Microservices', 'Cloud Computing'
    ];

    const foundSkills: string[] = [];
    const textLower = text.toLowerCase();

    commonSkills.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  /**
   * Generate resume preview text
   */
  static generatePreviewText(resume: ResumeData): string {
    const parts: string[] = [];

    // Personal info
    if (resume.personal) {
      const { firstName, lastName, jobTitle, email, phone } = resume.personal;
      if (firstName && lastName) {
        parts.push(`${firstName} ${lastName}`);
      }
      if (jobTitle) {
        parts.push(jobTitle);
      }
      if (email) {
        parts.push(email);
      }
      if (phone) {
        parts.push(phone);
      }
    }

    // Summary
    if (resume.summary) {
      parts.push(resume.summary.substring(0, 100) + '...');
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
      const exp = resume.experience[0];
      if (exp.title && exp.companyName) {
        parts.push(`${exp.title} at ${exp.companyName}`);
      }
    }

    return parts.join(' • ');
  }

  /**
   * Sort experiences by date (most recent first)
   */
  static sortExperiencesByDate(experiences: Experience[]): Experience[] {
    return [...experiences].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Sort education by date (most recent first)
   */
  static sortEducationByDate(education: Education[]): Education[] {
    return [...education].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Get resume statistics
   */
  static getResumeStats(resume: ResumeData): {
    wordCount: number;
    characterCount: number;
    sectionCount: number;
    experienceYears: number;
    skillCount: number;
    projectCount: number;
  } {
    let wordCount = 0;
    let characterCount = 0;

    // Count words and characters in text fields
    const textFields = [
      resume.summary,
      ...(resume.experience?.map(exp => exp.workSummary) || []),
      ...(resume.education?.map(edu => edu.description) || []),
      ...(resume.projects?.map(proj => proj.projectSummary) || [])
    ];

    textFields.forEach(text => {
      if (text) {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount += words.length;
        characterCount += text.length;
      }
    });

    const sectionCount = [
      resume.personal,
      resume.summary,
      resume.experience?.length ? 1 : 0,
      resume.education?.length ? 1 : 0,
      resume.skills?.length ? 1 : 0,
      resume.projects?.length ? 1 : 0
    ].filter(Boolean).length;

    return {
      wordCount,
      characterCount,
      sectionCount,
      experienceYears: this.calculateExperienceYears(resume.experience || []),
      skillCount: resume.skills?.length || 0,
      projectCount: resume.projects?.length || 0
    };
  }

  /**
   * Generate resume keywords for search
   */
  static generateKeywords(resume: ResumeData): string[] {
    const keywords: string[] = [];

    // Personal details
    if (resume.personal?.jobTitle) {
      keywords.push(resume.personal.jobTitle);
    }

    // Skills
    if (resume.skills) {
      resume.skills.forEach(skill => {
        if (skill.name) {
          keywords.push(skill.name);
        }
      });
    }

    // Experience
    if (resume.experience) {
      resume.experience.forEach(exp => {
        if (exp.title) keywords.push(exp.title);
        if (exp.companyName) keywords.push(exp.companyName);
        if (exp.workSummary) {
          keywords.push(...this.extractSkillsFromText(exp.workSummary));
        }
      });
    }

    // Projects
    if (resume.projects) {
      resume.projects.forEach(proj => {
        if (proj.projectName) keywords.push(proj.projectName);
        if (proj.techStack) {
          keywords.push(...proj.techStack.split(',').map(tech => tech.trim()));
        }
      });
    }

    // Remove duplicates and empty strings
    return [...new Set(keywords)].filter(keyword => keyword.length > 0);
  }

  /**
   * Validate and clean resume data
   */
  static cleanResumeData(resume: Partial<ResumeData>): Partial<ResumeData> {
    const cleaned = { ...resume };

    // Clean personal details
    if (cleaned.personal) {
      cleaned.personal = {
        ...cleaned.personal,
        firstName: cleaned.personal.firstName?.trim() || '',
        lastName: cleaned.personal.lastName?.trim() || '',
        jobTitle: cleaned.personal.jobTitle?.trim() || '',
        email: cleaned.personal.email?.trim().toLowerCase() || '',
        phone: cleaned.personal.phone?.trim() || '',
        address: cleaned.personal.address?.trim() || '',
      };
    }

    // Clean summary
    if (cleaned.summary) {
      cleaned.summary = cleaned.summary.trim();
    }

    // Clean experience
    if (cleaned.experience) {
      cleaned.experience = cleaned.experience.map(exp => ({
        ...exp,
        title: exp.title?.trim() || '',
        companyName: exp.companyName?.trim() || '',
        city: exp.city?.trim() || '',
        state: exp.state?.trim() || '',
        workSummary: exp.workSummary?.trim() || '',
      }));
    }

    // Clean education
    if (cleaned.education) {
      cleaned.education = cleaned.education.map(edu => ({
        ...edu,
        universityName: edu.universityName?.trim() || '',
        degree: edu.degree?.trim() || '',
        major: edu.major?.trim() || '',
        grade: edu.grade?.trim() || '',
        description: edu.description?.trim() || '',
      }));
    }

    // Clean skills
    if (cleaned.skills) {
      cleaned.skills = cleaned.skills
        .map(skill => ({
          ...skill,
          name: skill.name?.trim() || '',
        }))
        .filter(skill => skill.name.length > 0);
    }

    // Clean projects
    if (cleaned.projects) {
      cleaned.projects = cleaned.projects.map(proj => ({
        ...proj,
        projectName: proj.projectName?.trim() || '',
        techStack: proj.techStack?.trim() || '',
        projectSummary: proj.projectSummary?.trim() || '',
      }));
    }

    return cleaned;
  }

  /**
   * Export resume as different formats
   */
  static exportResume(resume: ResumeData, format: 'json' | 'txt' | 'md'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(resume, null, 2);
      
      case 'txt':
        return this.generateTextResume(resume);
      
      case 'md':
        return this.generateMarkdownResume(resume);
      
      default:
        return JSON.stringify(resume, null, 2);
    }
  }

  /**
   * Generate text format resume
   */
  private static generateTextResume(resume: ResumeData): string {
    let text = '';
    
    // Header
    if (resume.personal) {
      const { firstName, lastName, jobTitle, email, phone, address } = resume.personal;
      text += `${firstName} ${lastName}\n`;
      if (jobTitle) text += `${jobTitle}\n`;
      if (email) text += `Email: ${email}\n`;
      if (phone) text += `Phone: ${phone}\n`;
      if (address) text += `Address: ${address}\n`;
      text += '\n';
    }

    // Summary
    if (resume.summary) {
      text += `SUMMARY\n${resume.summary}\n\n`;
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
      text += 'EXPERIENCE\n';
      resume.experience.forEach(exp => {
        text += `${exp.title} at ${exp.companyName}\n`;
        text += `${exp.city}, ${exp.state}\n`;
        text += `${this.formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}\n`;
        if (exp.workSummary) {
          text += `${exp.workSummary}\n`;
        }
        text += '\n';
      });
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      text += 'EDUCATION\n';
      resume.education.forEach(edu => {
        text += `${edu.degree} in ${edu.major}\n`;
        text += `${edu.universityName}\n`;
        text += `${this.formatDateRange(edu.startDate, edu.endDate)}\n`;
        if (edu.grade) {
          text += `Grade: ${edu.grade} ${edu.gradeType}\n`;
        }
        if (edu.description) {
          text += `${edu.description}\n`;
        }
        text += '\n';
      });
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      text += 'SKILLS\n';
      text += resume.skills.map(skill => skill.name).join(', ') + '\n\n';
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      text += 'PROJECTS\n';
      resume.projects.forEach(proj => {
        text += `${proj.projectName}\n`;
        if (proj.techStack) {
          text += `Tech Stack: ${proj.techStack}\n`;
        }
        if (proj.projectSummary) {
          text += `${proj.projectSummary}\n`;
        }
        text += '\n';
      });
    }

    return text;
  }

  /**
   * Generate markdown format resume
   */
  private static generateMarkdownResume(resume: ResumeData): string {
    let md = '';
    
    // Header
    if (resume.personal) {
      const { firstName, lastName, jobTitle, email, phone, address } = resume.personal;
      md += `# ${firstName} ${lastName}\n\n`;
      if (jobTitle) md += `**${jobTitle}**\n\n`;
      if (email) md += `📧 ${email}\n`;
      if (phone) md += `📱 ${phone}\n`;
      if (address) md += `📍 ${address}\n`;
      md += '\n';
    }

    // Summary
    if (resume.summary) {
      md += `## Summary\n\n${resume.summary}\n\n`;
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
      md += '## Experience\n\n';
      resume.experience.forEach(exp => {
        md += `### ${exp.title} at ${exp.companyName}\n`;
        md += `*${exp.city}, ${exp.state}* | ${this.formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}\n\n`;
        if (exp.workSummary) {
          md += `${exp.workSummary}\n\n`;
        }
      });
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      md += '## Education\n\n';
      resume.education.forEach(edu => {
        md += `### ${edu.degree} in ${edu.major}\n`;
        md += `**${edu.universityName}** | ${this.formatDateRange(edu.startDate, edu.endDate)}\n`;
        if (edu.grade) {
          md += `Grade: ${edu.grade} ${edu.gradeType}\n`;
        }
        if (edu.description) {
          md += `\n${edu.description}\n`;
        }
        md += '\n';
      });
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      md += '## Skills\n\n';
      md += resume.skills.map(skill => `- ${skill.name}`).join('\n') + '\n\n';
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      md += '## Projects\n\n';
      resume.projects.forEach(proj => {
        md += `### ${proj.projectName}\n`;
        if (proj.techStack) {
          md += `**Tech Stack:** ${proj.techStack}\n\n`;
        }
        if (proj.projectSummary) {
          md += `${proj.projectSummary}\n\n`;
        }
      });
    }

    return md;
  }
}

export default ResumeUtils;
