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
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ResumeAIService } from '@/lib/ai';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/lib/ToastContext';
import { Skill, ResumeData } from '@/lib/resume';

// Types
export interface SkillsProps {
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
  onSave: () => Promise<void>;
  resumeInfo: ResumeData;
  isLoading?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

// Skill Categories
const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Tools & Technologies',
  'Soft Skills',
  'Certifications',
  'Languages',
  'Other'
];

// Main Skills Component
const Skills: React.FC<SkillsProps> = ({
  skills,
  onUpdate,
  onSave,
  resumeInfo,
  isLoading = false,
  isSaving = false,
  disabled = false
}) => {
  const [localSkills, setLocalSkills] = useState<Skill[]>(skills);
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState('Programming Languages');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const { showError, showSuccess } = useToast();

  // Update local skills when prop changes
  useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  // Handle input change with optimized updates
  const handleInputChange = useCallback((index: number, field: keyof Skill, value: string | number) => {
    const updatedSkills = [...localSkills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    
    setLocalSkills(updatedSkills);
    onUpdate(updatedSkills);
  }, [localSkills, onUpdate]);

  // Add new skill
  const addSkill = useCallback(() => {
    if (!newSkill.trim()) {
      return; // Silently return if no skill name entered
    }

    const skillExists = localSkills.some(skill => 
      skill.name.toLowerCase() === newSkill.toLowerCase()
    );

    if (skillExists) {
      Alert.alert('Error', 'This skill already exists.');
      return;
    }

    const newSkillEntry: Skill = {
      name: newSkill.trim(),
      category: newCategory,
      rating: 3, // Default rating
      yearsOfExperience: 0
    };

    const updatedSkills = [...localSkills, newSkillEntry];
    setLocalSkills(updatedSkills);
    onUpdate(updatedSkills);
    
    // Reset form
    setNewSkill('');
    setNewCategory('Programming Languages');
    setShowAddForm(false);
  }, [newSkill, newCategory, localSkills, onUpdate]);

  // Remove skill
  const removeSkill = useCallback((index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(() => {
    if (deleteIndex === null) return;

    const updatedSkills = localSkills.filter((_, i) => i !== deleteIndex);
    setLocalSkills(updatedSkills);
    onUpdate(updatedSkills);

    setShowDeleteModal(false);
    setDeleteIndex(null);
    showSuccess('Skill removed successfully.');
  }, [deleteIndex, localSkills, onUpdate, showSuccess]);

  // Cancel delete
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setDeleteIndex(null);
  }, []);

  // Generate skills with AI
  const generateSkillsWithAI = useCallback(async () => {
    if (!resumeInfo.personal?.jobTitle) {
      showError('Please add a job title in Personal Details first.');
      return;
    }

    try {
      setIsGenerating(true);
      
      console.log('Generating skills for job title:', resumeInfo.personal.jobTitle);
      const aiSkills = await ResumeAIService.generateSkillsRecommendations(resumeInfo.personal.jobTitle);
      console.log('AI response:', aiSkills);
      
      // Handle different response formats
      let skillsArray: string[] = [];
      
      if (Array.isArray(aiSkills)) {
        skillsArray = aiSkills;
      } else if (aiSkills && typeof aiSkills === 'object' && Array.isArray(aiSkills.skills)) {
        skillsArray = aiSkills.skills;
      } else if (aiSkills && typeof aiSkills === 'object' && Array.isArray(aiSkills.data)) {
        skillsArray = aiSkills.data;
      } else {
        console.error('Unexpected AI response format:', aiSkills);
        throw new Error('Invalid AI response format');
      }
      
      // Ensure we have valid skills
      if (!Array.isArray(skillsArray) || skillsArray.length === 0) {
        throw new Error('No skills returned from AI');
      }
      
      // Convert to our format and filter out existing skills
      const newSkills: Skill[] = skillsArray
        .filter(skillName => skillName && typeof skillName === 'string') // Ensure valid skill names
        .filter(skillName => !localSkills.some(skill => 
          skill.name.toLowerCase() === skillName.toLowerCase()
        ))
        .map(skillName => ({
          name: skillName,
          category: 'Programming Languages', // Default category
          rating: 3,
          yearsOfExperience: 0
        }));

      if (newSkills.length === 0) {
        showError('No new skills to add. All AI-recommended skills are already in your list.');
        return;
      }

      const updatedSkills = [...localSkills, ...newSkills];
      setLocalSkills(updatedSkills);
      onUpdate(updatedSkills);
      
      showSuccess(`Added ${newSkills.length} new skills!`);
    } catch (error) {
      console.error('AI generation failed:', error);
      
      // Show a fallback option
      showError('Unable to generate skills automatically. You can add skills manually below.');
    } finally {
      setIsGenerating(false);
    }
  }, [resumeInfo.personal?.jobTitle, localSkills, onUpdate]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (localSkills.length === 0) {
      showError('Please add at least one skill.');
      return;
    }

    try {
      await onSave();
      showSuccess('Skills saved successfully.');
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save skills. Please try again.');
    }
  }, [localSkills, onSave]);

  // Render skill item
  const renderSkillItem = useCallback(({ item, index }: { item: Skill; index: number }) => (
    <View style={styles.skillItem}>
      <View style={styles.skillInfo}>
        <Text style={styles.skillName}>{item.name}</Text>
        <Text style={styles.skillCategory}>{item.category}</Text>
      </View>
      
      <View style={styles.skillControls}>
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Rating:</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleInputChange(index, 'rating', star)}
                disabled={disabled}
              >
                <Icon
                  name={star <= item.rating ? 'star' : 'star-outline'}
                  size={16}
                  color={star <= item.rating ? '#ffc107' : '#ddd'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Years of Experience */}
        <View style={styles.experienceContainer}>
          <Text style={styles.experienceLabel}>Years:</Text>
          <TextInput
            style={styles.experienceInput}
            value={item.yearsOfExperience?.toString() || '0'}
            onChangeText={(value) => handleInputChange(index, 'yearsOfExperience', parseInt(value) || 0)}
            keyboardType="numeric"
            editable={!disabled}
          />
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeSkill(index)}
          disabled={disabled}
        >
          <Icon name="delete" size={20} color="#ff6b35" />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleInputChange, removeSkill, disabled]);

  // Group skills by category
  const groupedSkills = localSkills.reduce((acc, skill, index) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...skill, index });
    return acc;
  }, {} as { [key: string]: (Skill & { index: number })[] });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Skills</Text>
            <Text style={styles.subtitle}>
              Add your technical and soft skills with proficiency ratings
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.aiButton, isGenerating && styles.aiButtonGenerating]}
            onPress={generateSkillsWithAI}
            disabled={isGenerating || disabled || !resumeInfo.personal?.jobTitle}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#004D40" />
            ) : (
              <Icon name="robot" size={20} color="#004D40" />
            )}
            <Text style={styles.aiButtonText}>
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Skill Form */}
        {showAddForm && (
          <View style={styles.addFormContainer}>
            <Text style={styles.addFormTitle}>Add New Skill</Text>
            
            <View style={styles.addFormRow}>
              <View style={styles.addFormField}>
                <Text style={styles.fieldLabel}>Skill Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={newSkill}
                  onChangeText={setNewSkill}
                  placeholder="e.g., React, Python, Leadership"
                  editable={!disabled}
                />
              </View>
              
              <View style={styles.addFormField}>
                <Text style={styles.fieldLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryChips}>
                    {SKILL_CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          newCategory === category && styles.categoryChipSelected
                        ]}
                        onPress={() => setNewCategory(category)}
                        disabled={disabled}
                      >
                        <Text style={[
                          styles.categoryChipText,
                          newCategory === category && styles.categoryChipTextSelected
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={styles.addFormActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddForm(false)}
                disabled={disabled}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={addSkill}
                disabled={disabled || !newSkill.trim()}
              >
                <Icon name="plus" size={20} color="#004D40" />
                <Text style={styles.addButtonText}>Add Skill</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Skills List */}
        {Object.keys(groupedSkills).length > 0 ? (
          <View style={styles.skillsContainer}>
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {categorySkills.map((skill) => renderSkillItem({ item: skill, index: skill.index }))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="code-tags" size={48} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Skills Added</Text>
            <Text style={styles.emptyStateText}>
              Add your skills to showcase your expertise
            </Text>
          </View>
        )}

        {/* Add Skill Button */}
        {!showAddForm && (
          <TouchableOpacity
            style={styles.showAddFormButton}
            onPress={() => setShowAddForm(true)}
            disabled={disabled}
          >
            <Icon name="plus" size={20} color="#004D40" />
            <Text style={styles.showAddFormButtonText}>Add New Skill</Text>
          </TouchableOpacity>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (localSkills.length === 0 || isSaving) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={localSkills.length === 0 || isSaving || disabled}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="content-save" size={20} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Skills'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Remove Skill"
        message="Are you sure you want to remove this skill?"
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
  aiButton: {
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
  aiButtonGenerating: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
  },
  addFormContainer: {
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
  addFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  addFormRow: {
    gap: 16,
  },
  addFormField: {
    marginBottom: 16,
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
  categoryChips: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  categoryChipSelected: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  addFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    flex: 1,
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
  skillsContainer: {
    margin: 16,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingLeft: 4,
  },
  skillItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  skillInfo: {
    marginBottom: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  skillCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skillControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  experienceLabel: {
    fontSize: 12,
    color: '#666',
  },
  experienceInput: {
    width: 40,
    height: 32,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
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
  showAddFormButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004D40',
    gap: 8,
  },
  showAddFormButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
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

export default Skills;
