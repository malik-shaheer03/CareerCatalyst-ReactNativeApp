import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import RichTextEditor from '../RichTextEditor';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/lib/ToastContext';
import { Project as ProjectType, ResumeData } from '@/lib/resume';

// Types
export interface ProjectsProps {
  projects: ProjectType[];
  onUpdate: (projects: ProjectType[]) => void;
  onSave: () => Promise<void>;
  resumeInfo: ResumeData;
  isLoading?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

// Main Projects Component
const Projects: React.FC<ProjectsProps> = ({
  projects,
  onUpdate,
  onSave,
  resumeInfo,
  isLoading = false,
  isSaving = false,
  disabled = false
}) => {
  const [localProjects, setLocalProjects] = useState<ProjectType[]>(projects);
  const [errors, setErrors] = useState<{ [key: string]: { [field: string]: string } }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const { showError, showSuccess } = useToast();

  // Update local projects when prop changes
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  // Validate project entry - No required field validation
  const validateProject = useCallback((index: number, project: ProjectType) => {
    const newErrors = { ...errors };
    const entryErrors: { [field: string]: string } = {};

    // No required field validation - all fields are optional

    if (Object.keys(entryErrors).length > 0) {
      newErrors[index] = entryErrors;
    } else {
      delete newErrors[index];
    }

    setErrors(newErrors);
    return Object.keys(entryErrors).length === 0;
  }, [errors]);

  // Handle input change with optimized updates
  const handleInputChange = useCallback((index: number, field: keyof ProjectType, value: string) => {
    const updatedProjects = [...localProjects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    
    setLocalProjects(updatedProjects);
    onUpdate(updatedProjects);
    
    // Validate the entry
    validateProject(index, updatedProjects[index]);
  }, [localProjects, onUpdate, validateProject]);

  // Add new project
  const addProject = useCallback(() => {
    const newProject: ProjectType = {
      projectName: '',
      techStack: '',
      projectSummary: '',
      projectUrl: '',
      githubUrl: ''
    };
    
    const updatedProjects = [...localProjects, newProject];
    setLocalProjects(updatedProjects);
    onUpdate(updatedProjects);
  }, [localProjects, onUpdate]);

  // Remove project
  const removeProject = useCallback((index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(() => {
    if (deleteIndex === null) return;

    const updatedProjects = localProjects.filter((_, i) => i !== deleteIndex);
    setLocalProjects(updatedProjects);
    onUpdate(updatedProjects);
    
    // Remove errors for this index
    const newErrors = { ...errors };
    delete newErrors[deleteIndex];
    setErrors(newErrors);

    setShowDeleteModal(false);
    setDeleteIndex(null);
    showSuccess('Project removed successfully.');
  }, [deleteIndex, localProjects, onUpdate, errors, showSuccess]);

  // Cancel delete
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setDeleteIndex(null);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    // Validate all entries
    let isValid = true;
    localProjects.forEach((project, index) => {
      if (!validateProject(index, project)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showError('Please fill in all required fields correctly.');
      return;
    }

    try {
      await onSave();
      showSuccess('Projects saved successfully.');
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save projects. Please try again.');
    }
  }, [localProjects, validateProject, onSave]);

  // Check if form is valid
  const isFormValid = localProjects.every((project, index) => {
    const entryErrors = errors[index] || {};
    return Object.keys(entryErrors).length === 0 && 
           project.projectName?.trim() && 
           project.techStack?.trim() && 
           project.projectSummary?.trim();
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Projects</Text>
            <Text style={styles.subtitle}>
              Showcase your projects and technical skills
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addProject}
            disabled={disabled}
          >
            <Icon name="plus" size={20} color="#004D40" />
            <Text style={styles.addButtonText}>Add Project</Text>
          </TouchableOpacity>
        </View>

        {/* Projects List */}
        {localProjects.length > 0 ? (
          localProjects.map((project, index) => (
            <View key={index} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectTitle}>Project {index + 1}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeProject(index)}
                  disabled={disabled}
                >
                  <Icon name="delete" size={20} color="#ff6b35" />
                </TouchableOpacity>
              </View>

              {/* Project Name */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Project Name *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors[index]?.projectName && styles.textInputError
                  ]}
                  value={project.projectName || ''}
                  onChangeText={(value) => handleInputChange(index, 'projectName', value)}
                  placeholder="e.g., E-commerce Website, Mobile App"
                  editable={!disabled}
                />
                {errors[index]?.projectName && (
                  <Text style={styles.errorText}>{errors[index].projectName}</Text>
                )}
              </View>

              {/* Tech Stack */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Tech Stack *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors[index]?.techStack && styles.textInputError
                  ]}
                  value={project.techStack || ''}
                  onChangeText={(value) => handleInputChange(index, 'techStack', value)}
                  placeholder="e.g., React, Node.js, MongoDB, AWS"
                  editable={!disabled}
                />
                {errors[index]?.techStack && (
                  <Text style={styles.errorText}>{errors[index].techStack}</Text>
                )}
              </View>

              {/* Project URLs */}
              <View style={styles.row}>
                <View style={[styles.fieldContainer, styles.halfWidth]}>
                  <Text style={styles.fieldLabel}>Project URL (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={project.projectUrl || ''}
                    onChangeText={(value) => handleInputChange(index, 'projectUrl', value)}
                    placeholder="https://yourproject.com"
                    keyboardType="url"
                    autoCapitalize="none"
                    editable={!disabled}
                  />
                </View>
                
                <View style={[styles.fieldContainer, styles.halfWidth]}>
                  <Text style={styles.fieldLabel}>GitHub URL (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={project.githubUrl || ''}
                    onChangeText={(value) => handleInputChange(index, 'githubUrl', value)}
                    placeholder="https://github.com/user/repo"
                    keyboardType="url"
                    autoCapitalize="none"
                    editable={!disabled}
                  />
                </View>
              </View>

              {/* Project Summary with Rich Text Editor */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Project Summary *</Text>
                <RichTextEditor
                  value={project.projectSummary || ''}
                  onChange={(value) => handleInputChange(index, 'projectSummary', value)}
                  placeholder="Describe your project, key features, challenges overcome, and technologies used..."
                  section="projects"
                  field="projectSummary"
                  index={index}
                  resumeInfo={resumeInfo}
                  showAIGenerate={true}
                  showToolbar={true}
                  multiline={true}
                  numberOfLines={6}
                  disabled={disabled}
                />
                {errors[index]?.projectSummary && (
                  <Text style={styles.errorText}>{errors[index].projectSummary}</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="code-braces" size={48} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Projects Added</Text>
            <Text style={styles.emptyStateText}>
              Add your projects to showcase your technical skills and experience
            </Text>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Project Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Include projects that demonstrate relevant skills</Text>
            <Text style={styles.tipItem}>• Highlight your role and contributions</Text>
            <Text style={styles.tipItem}>• Mention technologies, frameworks, and tools used</Text>
            <Text style={styles.tipItem}>• Include links to live demos or GitHub repositories</Text>
            <Text style={styles.tipItem}>• Quantify results and impact when possible</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isFormValid || isSaving) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isFormValid || isSaving || disabled}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="content-save" size={20} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Projects'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Remove Project"
        message="Are you sure you want to remove this project?"
        confirmText="Remove"
        cancelText="Cancel"
        confirmColor="#ff6b35"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="delete"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
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
  headerContent: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004D40',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
  },
  projectCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
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
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textInputError: {
    borderColor: '#ff6b35',
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b35',
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
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
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#004D40',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Projects;
