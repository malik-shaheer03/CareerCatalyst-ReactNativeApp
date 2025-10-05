import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const jobTitles = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "UX/UI Designer",
  "DevOps Engineer",
  "Business Analyst",
  "Marketing Manager",
  "Sales Representative",
  "Project Manager",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Machine Learning Engineer",
  "Cybersecurity Analyst",
  "Digital Marketing Specialist",
];

const difficultyLevels = [
  { value: "beginner", label: "Beginner", description: "Basic concepts and fundamentals" },
  { value: "intermediate", label: "Intermediate", description: "Moderate complexity with practical scenarios" },
  { value: "advanced", label: "Advanced", description: "Complex problems and expert-level questions" },
];

export default function MCQSetupScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showJobModal, setShowJobModal] = useState(false);

  const steps = ["Select Job Title", "Choose Difficulty", "Take Quiz"];

  const handleStartQuiz = () => {
    if (selectedJob && selectedDifficulty) {
      router.push({
        pathname: '/(tabs)/mcq-quiz',
        params: {
          jobTitle: selectedJob,
          difficulty: selectedDifficulty,
        },
      });
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedJob) {
      setCurrentStep(1);
    } else if (currentStep === 1 && selectedDifficulty) {
      handleStartQuiz();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderJobItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => {
        setSelectedJob(item);
        setShowJobModal(false);
      }}
    >
      <Text style={styles.jobItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Icon name="briefcase" size={48} color="#00A389" />
              <Text style={styles.stepTitle}>Select Your Target Job Title</Text>
              <Text style={styles.stepSubtitle}>
                Choose the job role you're preparing for to get relevant questions
              </Text>
            </View>

            <TouchableOpacity
              style={styles.jobSelector}
              onPress={() => setShowJobModal(true)}
            >
              <Text style={[styles.jobSelectorText, selectedJob && styles.jobSelectorTextSelected]}>
                {selectedJob || "Select Job Title"}
              </Text>
              <Icon name="chevron-down" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.continueButton, !selectedJob && styles.continueButtonDisabled]}
              onPress={handleNext}
              disabled={!selectedJob}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>

            {/* Back to Interview Prep Button */}
            <TouchableOpacity 
              style={styles.backToPrepButton}
              onPress={() => router.push('/(tabs)/interview-prep')}
            >
              <Icon name="arrow-left" size={20} color="#6B7280" />
              <Text style={styles.backToPrepButtonText}>Back to Interview Preparation Screen</Text>
            </TouchableOpacity>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Icon name="chart-line" size={48} color="#00A389" />
              <Text style={styles.stepTitle}>Choose Difficulty Level</Text>
              <Text style={styles.stepSubtitle}>
                Selected Job: <Text style={styles.selectedJobText}>{selectedJob}</Text>
              </Text>
            </View>

            <View style={styles.difficultyContainer}>
              {difficultyLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.difficultyCard,
                    selectedDifficulty === level.value && styles.difficultyCardSelected,
                  ]}
                  onPress={() => setSelectedDifficulty(level.value)}
                >
                  <View style={styles.difficultyContent}>
                    <View style={styles.difficultyHeader}>
                      <Text style={styles.difficultyLabel}>{level.label}</Text>
                      {selectedDifficulty === level.value && (
                        <View style={styles.selectedChip}>
                          <Text style={styles.selectedChipText}>Selected</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.difficultyDescription}>{level.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Centered Start Quiz Button */}
            <TouchableOpacity
              style={[styles.centeredStartButton, !selectedDifficulty && styles.startButtonDisabled]}
              onPress={handleNext}
              disabled={!selectedDifficulty}
            >
              <Text style={styles.startButtonText}>Start Quiz</Text>
            </TouchableOpacity>

            {/* Back to Job Selection Button */}
            <TouchableOpacity 
              style={styles.backToJobButton}
              onPress={() => setCurrentStep(0)}
            >
              <Icon name="arrow-left" size={20} color="#6B7280" />
              <Text style={styles.backToJobButtonText}>Back to Select Job Title</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#004D40', '#00695C', '#00796B']}
        style={styles.gradientContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/white-logo-noBG.png')} style={styles.logoImage} />
            <Text style={styles.logoText}>CareerCatalyst</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Icon name="help-circle-outline" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>MCQ Practice</Text>
            <Text style={styles.heroSubtitle}>
              Test your knowledge with AI-generated questions tailored to your role
            </Text>
          </View>

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            {/* Progress Stepper */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepper}>
                {steps.map((label, index) => (
                  <View key={label} style={styles.stepContainer}>
                    <View style={[
                      styles.stepCircle,
                      index <= currentStep && styles.stepCircleActive,
                    ]}>
                      <Text style={[
                        styles.stepNumber,
                        index <= currentStep && styles.stepNumberActive,
                      ]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      index <= currentStep && styles.stepLabelActive,
                    ]}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Step Content */}
            <View style={styles.stepContent}>
              {renderStepContent()}
            </View>
          </View>
        </ScrollView>

        {/* Job Selection Modal */}
        <Modal
          visible={showJobModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowJobModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Job Title</Text>
                <TouchableOpacity onPress={() => setShowJobModal(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={jobTitles}
                renderItem={renderJobItem}
                keyExtractor={(item) => item}
                style={styles.jobList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#004D40',
  },
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 32,
    width: 32,
    marginRight: 8,
    resizeMode: 'contain',
  },
  logoText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 20,
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  // Main Card
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  stepperContainer: {
    marginBottom: 24,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#00A389',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#00A389',
    fontWeight: '600',
  },
  stepContent: {
    alignItems: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  selectedJobText: {
    fontWeight: '600',
    color: '#00A389',
  },
  jobSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8F5E8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
    marginBottom: 32,
  },
  jobSelectorText: {
    fontSize: 16,
    color: '#9CA3AF',
    flex: 1,
  },
  jobSelectorTextSelected: {
    color: '#004D40',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#00A389',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  difficultyContainer: {
    width: '100%',
    marginBottom: 32,
  },
  difficultyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  difficultyCardSelected: {
    borderColor: '#00A389',
    backgroundColor: '#F0FDF4',
  },
  difficultyContent: {
    flex: 1,
  },
  difficultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
  },
  selectedChip: {
    backgroundColor: '#00A389',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    borderWidth: 2,
    borderColor: '#E8F5E8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 0.45,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#00A389',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 0.45,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centeredStartButton: {
    backgroundColor: '#00A389',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  backToJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  backToJobButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  backToPrepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  backToPrepButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
  },
  jobList: {
    maxHeight: 400,
  },
  jobItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  jobItemText: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '500',
  },
});
