import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { generateMCQs, Question } from '../../lib/services/mcq-api';

export default function MCQQuizScreen() {
  const router = useRouter();
  const { jobTitle, difficulty } = useLocalSearchParams<{ jobTitle: string; difficulty: string }>();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Generate questions using AI
  useEffect(() => {
    generateQuestions();
  }, [jobTitle, difficulty]);

  // Timer
  useEffect(() => {
    if (loading || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quizCompleted]);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const generatedQuestions = await generateMCQs(jobTitle || '', difficulty || '', 15);
      setQuestions(generatedQuestions);
      setSelectedAnswers(new Array(15).fill(-1));
    } catch (error) {
      console.error("Error generating questions:", error);
      // Fallback to sample questions
      setQuestions(getSampleQuestions());
      setSelectedAnswers(new Array(15).fill(-1));
    }
    setLoading(false);
  };

  const getSampleQuestions = (): Question[] => {
    const sampleQuestions = [
      {
        id: 1,
        question: `What is a key skill required for a ${jobTitle}?`,
        options: ["Communication", "Technical expertise", "Problem-solving", "All of the above"],
        correctAnswer: 3,
        explanation: "All these skills are essential for success in this role.",
      },
      {
        id: 2,
        question: `Which programming language is commonly used in ${jobTitle} positions?`,
        options: ["Python", "JavaScript", "Java", "Depends on the specific role"],
        correctAnswer: 3,
        explanation: "The choice of programming language depends on the specific requirements of the role and company.",
      },
      {
        id: 3,
        question: `What is the most important aspect of ${jobTitle} work?`,
        options: ["Speed", "Quality", "Collaboration", "All are equally important"],
        correctAnswer: 3,
        explanation: "Success in this role requires balancing speed, quality, and collaboration.",
      },
    ];

    // Repeat questions to reach 15
    const questions: Question[] = [];
    for (let i = 0; i < 15; i++) {
      const baseQuestion = sampleQuestions[i % sampleQuestions.length];
      questions.push({
        ...baseQuestion,
        id: i + 1,
        question: baseQuestion.question.replace(/\${jobTitle}/g, jobTitle || ''),
      });
    }

    return questions;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizCompleted(true);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "#4caf50";
    if (percentage >= 60) return "#ff9800";
    return "#f44336";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#004D40', '#00695C', '#00796B']}
          style={styles.gradientContainer}
        >
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <View style={styles.loadingIconContainer}>
                <Icon name="help-circle-outline" size={48} color="#00A389" />
              </View>
              <Text style={styles.loadingTitle}>Generating Questions...</Text>
              <ActivityIndicator size="large" color="#00A389" style={styles.loadingSpinner} />
              <Text style={styles.loadingSubtitle}>
                Creating personalized questions for {jobTitle} ({difficulty} level)
              </Text>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#004D40', '#00695C', '#00796B']}
          style={styles.gradientContainer}
        >
          {/* Header */}
          <Header showProfileButton={true} />

          <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroIconContainer}>
                <Icon name="trophy" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.heroTitle}>Quiz Completed!</Text>
              <Text style={styles.heroSubtitle}>
                Great job! Here's how you performed
              </Text>
            </View>

            {/* Main Content Card */}
            <View style={styles.mainCard}>
              {/* Score Section */}
              <View style={styles.scoreSection}>
                <View style={styles.scoreHeader}>
                  <Icon name="chart-line" size={24} color="#00A389" />
                  <Text style={styles.scoreTitle}>Your Score</Text>
                </View>
                <View style={styles.scoreDisplay}>
                  <Text style={[styles.scorePercentage, { color: getScoreColor(score.percentage) }]}>
                    {score.percentage}%
                  </Text>
                  <Text style={styles.scoreDetails}>
                    {score.correct} out of {score.total} questions correct
                  </Text>
                </View>
              </View>

              {/* Quiz Info Section */}
              <View style={styles.quizInfoSection}>
                <View style={styles.quizInfoHeader}>
                  <Icon name="information" size={24} color="#00A389" />
                  <Text style={styles.quizInfoTitle}>Quiz Details</Text>
                </View>
                <View style={styles.quizInfoList}>
                  <View style={styles.quizInfoItem}>
                    <Icon name="briefcase" size={16} color="#00A389" />
                    <Text style={styles.quizInfoText}>Job: {jobTitle}</Text>
                  </View>
                  <View style={styles.quizInfoItem}>
                    <Icon name="chart-line" size={16} color="#00A389" />
                    <Text style={styles.quizInfoText}>Level: {difficulty}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => router.back()}
                >
                  <Icon name="refresh" size={20} color="#6B7280" />
                  <Text style={styles.secondaryButtonText}>Take Another Quiz</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => router.push('/(tabs)/interview-prep')}
                >
                  <Icon name="arrow-left" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Back to Interview Prep</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#004D40', '#00695C', '#00796B']}
        style={styles.gradientContainer}
      >
        {/* Header */}
        <Header 
          showProfileButton={true}
          rightElement={
            <View style={styles.timerContainer}>
              <View style={[styles.timerChip, timeLeft < 300 && styles.timerChipWarning]}>
                <Icon name="timer" size={18} color="#FFFFFF" />
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            </View>
          } 
        />

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
            <Text style={styles.heroTitle}>MCQ Quiz</Text>
            <Text style={styles.heroSubtitle}>
              {jobTitle} • {difficulty} level
            </Text>
          </View>

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Icon name="chart-line" size={24} color="#00A389" />
                <Text style={styles.progressTitle}>Progress</Text>
              </View>
              <Text style={styles.progressText}>
                Question {currentQuestion + 1} of {questions.length}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>

            {/* Question */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>Question</Text>
              </View>
              <Text style={styles.questionText}>{currentQ?.question}</Text>

              <View style={styles.optionsContainer}>
                {currentQ?.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionItem,
                      selectedAnswers[currentQuestion] === index && styles.optionItemSelected,
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                  >
                    <View style={styles.optionContent}>
                      <View style={[
                        styles.radioButton,
                        selectedAnswers[currentQuestion] === index && styles.radioButtonSelected,
                      ]}>
                        {selectedAnswers[currentQuestion] === index && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text style={[
                        styles.optionText,
                        selectedAnswers[currentQuestion] === index && styles.optionTextSelected,
                      ]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Navigation */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
                onPress={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <Icon name="arrow-left" size={20} color={currentQuestion === 0 ? "#9CA3AF" : "#00A389"} />
                <Text style={[styles.navButtonText, currentQuestion === 0 && styles.navButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <View style={styles.navButtonGroup}>
                {currentQuestion === questions.length - 1 ? (
                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuiz}>
                    <Text style={styles.submitButtonText}>Submit Quiz</Text>
                    <Icon name="check" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>Next</Text>
                    <Icon name="arrow-right" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
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
  timerContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerChipWarning: {
    backgroundColor: 'rgba(244, 67, 54, 0.25)',
    borderColor: 'rgba(244, 67, 54, 0.4)',
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00A389',
    borderRadius: 4,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionHeader: {
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8F5E8',
    borderRadius: 16,
    padding: 16,
  },
  optionItemSelected: {
    borderColor: '#00A389',
    backgroundColor: '#F0FDF4',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8F5E8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#00A389',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00A389',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#004D40',
    lineHeight: 22,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00A389',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 0.4,
  },
  navButtonDisabled: {
    backgroundColor: 'transparent',
    borderColor: '#E5E7EB',
  },
  navButtonText: {
    color: '#00A389',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  navButtonGroup: {
    flex: 0.5,
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A389',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A389',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  // Results Screen Styles
  scoreSection: {
    marginBottom: 24,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  scoreDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 8,
  },
  scoreDetails: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  quizInfoSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  quizInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quizInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  quizInfoList: {
    gap: 12,
  },
  quizInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  quizInfoText: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '500',
    marginLeft: 12,
  },
  actionButtons: {
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A389',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
