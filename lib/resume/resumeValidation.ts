import { ResumeData, PersonalDetails, Experience, Education, Skill, Project } from './resumeAPI';

export interface ValidationError {
  field: string;
  message: string;
  section?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  completenessScore: number;
}

export class ResumeValidationService {
  /**
   * Validate complete resume data
   */
  static validateResume(resumeData: Partial<ResumeData>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let completenessScore = 0;
    const maxScore = 100;

    // Validate personal details
    const personalValidation = this.validatePersonalDetails(resumeData.personal);
    errors.push(...personalValidation.errors);
    warnings.push(...personalValidation.warnings);
    completenessScore += personalValidation.score;

    // Validate summary
    const summaryValidation = this.validateSummary(resumeData.summary);
    errors.push(...summaryValidation.errors);
    warnings.push(...summaryValidation.warnings);
    completenessScore += summaryValidation.score;

    // Validate experience
    const experienceValidation = this.validateExperience(resumeData.experience);
    errors.push(...experienceValidation.errors);
    warnings.push(...experienceValidation.warnings);
    completenessScore += experienceValidation.score;

    // Validate education
    const educationValidation = this.validateEducation(resumeData.education);
    errors.push(...educationValidation.errors);
    warnings.push(...educationValidation.warnings);
    completenessScore += educationValidation.score;

    // Validate skills
    const skillsValidation = this.validateSkills(resumeData.skills);
    errors.push(...skillsValidation.errors);
    warnings.push(...skillsValidation.warnings);
    completenessScore += skillsValidation.score;

    // Validate projects
    const projectsValidation = this.validateProjects(resumeData.projects);
    errors.push(...projectsValidation.errors);
    warnings.push(...projectsValidation.warnings);
    completenessScore += projectsValidation.score;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completenessScore: Math.round(completenessScore),
    };
  }

  /**
   * Validate personal details
   */
  static validatePersonalDetails(personal?: Partial<PersonalDetails>): {
    errors: ValidationError[];
    warnings: ValidationError[];
    score: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let score = 0;

    if (!personal) {
      errors.push({
        field: 'personal',
        message: 'Personal details section is missing',
        section: 'personal'
      });
      return { errors, warnings, score };
    }

    // Required fields
    const requiredFields = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' },
    ];

    requiredFields.forEach(({ key, label }) => {
      if (!personal[key as keyof PersonalDetails]?.trim()) {
        errors.push({
          field: key,
          message: `${label} is required`,
          section: 'personal'
        });
      } else {
        score += 2; // 2 points per required field
      }
    });

    // Job title validation
    if (!personal.jobTitle?.trim()) {
      warnings.push({
        field: 'jobTitle',
        message: 'Job title is recommended',
        section: 'personal'
      });
    } else {
      score += 2;
    }

    // Email format validation
    if (personal.email && !this.isValidEmail(personal.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        section: 'personal'
      });
    }

    // Phone format validation
    if (personal.phone && !this.isValidPhone(personal.phone)) {
      warnings.push({
        field: 'phone',
        message: 'Please enter a valid phone number',
        section: 'personal'
      });
    }

    return { errors, warnings, score };
  }

  /**
   * Validate summary
   */
  static validateSummary(summary?: string): {
    errors: ValidationError[];
    warnings: ValidationError[];
    score: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let score = 0;

    if (!summary?.trim()) {
      errors.push({
        field: 'summary',
        message: 'Professional summary is required',
        section: 'summary'
      });
    } else {
      score += 15; // 15 points for summary
      
      if (summary.trim().length < 50) {
        warnings.push({
          field: 'summary',
          message: 'Summary should be at least 50 characters long',
          section: 'summary'
        });
      } else if (summary.trim().length > 500) {
        warnings.push({
          field: 'summary',
          message: 'Summary should be less than 500 characters',
          section: 'summary'
        });
      }
    }

    return { errors, warnings, score };
  }

  /**
   * Validate experience
   */
  static validateExperience(experience?: Experience[]): {
    errors: ValidationError[];
    warnings: ValidationError[];
    score: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let score = 0;

    if (!experience || experience.length === 0) {
      warnings.push({
        field: 'experience',
        message: 'Work experience is recommended',
        section: 'experience'
      });
      return { errors, warnings, score };
    }

    score += 10; // Base score for having experience

    experience.forEach((exp, index) => {
      const requiredFields = [
        { key: 'title', label: 'Job Title' },
        { key: 'companyName', label: 'Company Name' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
      ];

      requiredFields.forEach(({ key, label }) => {
        if (!exp[key as keyof Experience]?.toString().trim()) {
          errors.push({
            field: key,
            message: `${label} is required for experience ${index + 1}`,
            section: 'experience'
          });
        }
      });

      // Date validation
      if (exp.startDate && exp.endDate) {
        const startDate = new Date(exp.startDate);
        const endDate = new Date(exp.endDate);
        
        if (startDate > endDate) {
          errors.push({
            field: 'endDate',
            message: 'End date must be after start date',
            section: 'experience'
          });
        }
      }

      // Work summary validation
      if (!exp.workSummary?.trim()) {
        warnings.push({
          field: 'workSummary',
          message: 'Work summary is recommended for experience',
          section: 'experience'
        });
      } else {
        score += 2; // 2 points per experience with summary
      }
    });

    return { errors, warnings, score };
  }

  /**
   * Validate education
   */
  static validateEducation(education?: Education[]): {
    errors: ValidationError[];
    warnings: ValidationError[];
    score: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let score = 0;

    if (!education || education.length === 0) {
      warnings.push({
        field: 'education',
        message: 'Education section is recommended',
        section: 'education'
      });
      return { errors, warnings, score };
    }

    score += 10; // Base score for having education

    education.forEach((edu, index) => {
      const requiredFields = [
        { key: 'universityName', label: 'University Name' },
        { key: 'degree', label: 'Degree' },
        { key: 'major', label: 'Major' },
        { key: 'grade', label: 'Grade' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
      ];

      requiredFields.forEach(({ key, label }) => {
        if (!edu[key as keyof Education]?.toString().trim()) {
          errors.push({
            field: key,
            message: `${label} is required for education ${index + 1}`,
            section: 'education'
          });
        }
      });

      // Date validation
      if (edu.startDate && edu.endDate) {
        const startDate = new Date(edu.startDate);
        const endDate = new Date(edu.endDate);
        
        if (startDate > endDate) {
          errors.push({
            field: 'endDate',
            message: 'End date must be after start date',
            section: 'education'
          });
        }
      }

      // Grade validation
      if (edu.grade && edu.gradeType) {
        const grade = parseFloat(edu.grade);
        if (isNaN(grade)) {
          errors.push({
            field: 'grade',
            message: 'Grade must be a valid number',
            section: 'education'
          });
        } else {
          score += 1; // 1 point per education entry
        }
      }
    });

    return { errors, warnings, score };
  }

  /**
   * Validate skills
   */
  static validateSkills(skills?: Skill[]): {
    errors: ValidationError[];
    warnings: ValidationError[];
    score: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let score = 0;

    if (!skills || skills.length === 0) {
      warnings.push({
        field: 'skills',
        message: 'Skills section is recommended',
        section: 'skills'
      });
      return { errors, warnings, score };
    }

    score += 10; // Base score for having skills

    skills.forEach((skill, index) => {
      if (!skill.name?.trim()) {
        errors.push({
          field: 'name',
          message: `Skill name is required for skill ${index + 1}`,
          section: 'skills'
        });
      } else {
        score += 1; // 1 point per skill
      }
    });

    if (skills.length < 3) {
      warnings.push({
        field: 'skills',
        message: 'Consider adding at least 3 skills',
        section: 'skills'
      });
    }

    return { errors, warnings, score };
  }

  /**
   * Validate projects
   */
  static validateProjects(projects?: Project[]): {
    errors: ValidationError[];
    warnings: ValidationError[];
    score: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let score = 0;

    if (!projects || projects.length === 0) {
      warnings.push({
        field: 'projects',
        message: 'Projects section is recommended',
        section: 'projects'
      });
      return { errors, warnings, score };
    }

    score += 5; // Base score for having projects

    projects.forEach((project, index) => {
      const requiredFields = [
        { key: 'projectName', label: 'Project Name' },
        { key: 'techStack', label: 'Tech Stack' },
      ];

      requiredFields.forEach(({ key, label }) => {
        if (!project[key as keyof Project]?.trim()) {
          errors.push({
            field: key,
            message: `${label} is required for project ${index + 1}`,
            section: 'projects'
          });
        }
      });

      if (project.projectName?.trim() && project.techStack?.trim()) {
        score += 2; // 2 points per complete project
      }

      if (!project.projectSummary?.trim()) {
        warnings.push({
          field: 'projectSummary',
          message: 'Project summary is recommended',
          section: 'projects'
        });
      }
    });

    return { errors, warnings, score };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   */
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(result: ValidationResult): {
    message: string;
    color: string;
    suggestions: string[];
  } {
    const { isValid, errors, warnings, completenessScore } = result;
    
    let message = '';
    let color = '';
    const suggestions: string[] = [];

    if (isValid) {
      if (completenessScore >= 90) {
        message = 'Excellent! Your resume is complete and well-structured.';
        color = 'green';
      } else if (completenessScore >= 70) {
        message = 'Good! Your resume is mostly complete with minor improvements needed.';
        color = 'orange';
        suggestions.push('Consider adding more details to improve completeness');
      } else {
        message = 'Your resume needs more content to be competitive.';
        color = 'red';
        suggestions.push('Add more sections and details to improve your resume');
      }
    } else {
      message = `Your resume has ${errors.length} error(s) that need to be fixed.`;
      color = 'red';
    }

    // Add specific suggestions based on errors and warnings
    if (errors.length > 0) {
      suggestions.push('Fix all required field errors before saving');
    }
    
    if (warnings.length > 0) {
      suggestions.push('Consider addressing the warnings to improve your resume');
    }

    if (completenessScore < 50) {
      suggestions.push('Add more sections like experience, education, or projects');
    }

    return { message, color, suggestions };
  }
}

export default ResumeValidationService;
