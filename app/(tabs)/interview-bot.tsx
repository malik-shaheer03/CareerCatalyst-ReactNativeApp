import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import { generateInterviewQuestions, analyzeInterviewPerformance, InterviewResponse } from '../../lib/services/mcq-api';

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function InterviewBotScreen() {
  const router = useRouter();
  const { jobTitle, difficulty } = useLocalSearchParams<{ jobTitle: string; difficulty: string }>();
  
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<any>(null);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0);

  // Voice recognition setup (mobile only)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechRecognized = onSpeechRecognized;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechPartialResults = onSpeechPartialResults;

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }
  }, []);

  // Generate questions using AI
  useEffect(() => {
    generateQuestions();
  }, [jobTitle, difficulty]);

  // Timer for each question
  useEffect(() => {
    if (!interviewStarted || interviewCompleted || showResults) return;

    const timer = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, interviewCompleted, showResults, currentQuestionIndex]);

  // Reset timer when moving to next question
  useEffect(() => {
    setQuestionTimer(0);
  }, [currentQuestionIndex]);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const generatedQuestions = await generateInterviewQuestions(jobTitle || '', difficulty || '', 8);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error("Error generating questions:", error);
      // Fallback questions
      setQuestions([
        `Tell me about yourself and your experience with ${jobTitle}.`,
        `What interests you most about this ${jobTitle} position?`,
        "Describe a challenging project you've worked on recently.",
        "How do you handle tight deadlines and pressure?",
        "What are your greatest strengths and how do they apply to this role?",
        "Where do you see yourself in 5 years?",
        "Do you have any questions for us?",
      ]);
    }
    setLoading(false);
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice recognition event handlers
  const onSpeechStart = (e: any) => {
    console.log('Speech started:', e);
    setIsListening(true);
  };

  const onSpeechRecognized = (e: any) => {
    console.log('Speech recognized:', e);
  };

  const onSpeechEnd = (e: any) => {
    console.log('Speech ended:', e);
    setIsListening(false);
  };

  const onSpeechError = (e: any) => {
    console.log('Speech error:', e);
    setIsListening(false);
    Alert.alert('Speech Recognition Error', e.error?.message || 'Failed to recognize speech. Please try again.');
  };

  const onSpeechResults = (e: any) => {
    console.log('Speech results:', e);
    if (e.value && e.value.length > 0) {
      setCurrentAnswer(e.value[0]);
    }
    setIsListening(false);
  };

  const onSpeechPartialResults = (e: any) => {
    console.log('Partial speech results:', e);
    if (e.value && e.value.length > 0) {
      setCurrentAnswer(e.value[0]);
    }
  };

  const speakText = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      rate: 0.9,
      pitch: 1,
      volume: 0.8,
      onStart: () => setIsSpeaking(true),
      onDone: () => {
        setIsSpeaking(false);
        // Start listening after question is spoken
        if (interviewStarted && currentQuestionIndex < questions.length) {
          setTimeout(() => startListening(), 1000);
        }
      },
      onError: (error) => {
        console.error("Speech error:", error);
        setIsSpeaking(false);
      },
    });
  };

  const startListening = async () => {
    try {
      setCurrentAnswer("");
      setAnswerStartTime(Date.now());
      
      if (Platform.OS === 'web') {
        // For web platform, use Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          recognition.onstart = () => {
            setIsListening(true);
          };
          
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setCurrentAnswer(transcript);
          };
          
          recognition.onend = () => {
            setIsListening(false);
          };
          
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            Alert.alert('Speech Recognition Error', 'Failed to recognize speech. Please try again.');
          };
          
          recognition.start();
        } else {
          Alert.alert('Speech Recognition Not Available', 'Speech recognition is not supported in this browser.');
        }
      } else {
        // For mobile platforms, use react-native-voice
        const available = await Voice.isAvailable();
        if (!available) {
          Alert.alert('Speech Recognition Not Available', 'Speech recognition is not available on this device.');
          return;
        }

        // Start listening
        await Voice.start('en-US');
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      Alert.alert('Error', 'Failed to start speech recognition. Please check microphone permissions.');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web platform, we can't directly stop the recognition
        // It will stop automatically when speech ends
        setIsListening(false);
      } else {
        // For mobile platforms, use react-native-voice
        await Voice.stop();
        setIsListening(false);
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      setIsListening(false);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setCurrentQuestionIndex(0);
    speakText(`Hello! I'm your AI interviewer. Let's begin the interview for the ${jobTitle} position. ${questions[0]}`);
  };

  const nextQuestion = () => {
    if (currentAnswer.trim()) {
      const duration = Date.now() - answerStartTime;
      const newResponse: InterviewResponse = {
        question: questions[currentQuestionIndex],
        answer: currentAnswer,
        duration,
      };

      setResponses((prev) => [...prev, newResponse]);
      setCurrentAnswer("");

      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        speakText(`Thank you. Next question: ${questions[nextIndex]}`);
      } else {
        completeInterview([...responses, newResponse]);
      }
    }
  };

  const completeInterview = async (allResponses: InterviewResponse[]) => {
    setInterviewCompleted(true);
    speakText("Thank you for completing the interview. I'm now analyzing your performance.");

    try {
      const analysis = await analyzeInterviewPerformance(jobTitle || '', difficulty || '', allResponses);
      setPerformanceAnalysis(analysis);
      setShowResults(true);
    } catch (error) {
      console.error("Error analyzing performance:", error);
      // Fallback analysis
      setPerformanceAnalysis({
        overallScore: 75,
        confidence: "Good",
        tone: "Professional",
        answerQuality: "Satisfactory",
        strengths: ["Clear communication", "Relevant experience"],
        improvements: ["Provide more specific examples", "Elaborate on technical skills"],
        feedback: "Overall good performance with room for improvement in providing detailed examples.",
      });
      setShowResults(true);
    }
  };

  const skipQuestion = () => {
    const duration = Date.now() - answerStartTime;
    const newResponse: InterviewResponse = {
      question: questions[currentQuestionIndex],
      answer: "No response provided",
      duration,
    };

    setResponses((prev) => [...prev, newResponse]);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      speakText(`Moving to the next question: ${questions[nextIndex]}`);
    } else {
      completeInterview([...responses, newResponse]);
    }
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
                <Icon name="robot" size={48} color="#00A389" />
              </View>
              <Text style={styles.loadingTitle}>Preparing Interview...</Text>
              <ActivityIndicator size="large" color="#00A389" style={styles.loadingSpinner} />
              <Text style={styles.loadingSubtitle}>
                Setting up questions for {jobTitle} ({difficulty} level)
              </Text>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (showResults && performanceAnalysis) {
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
                <Icon name="robot" size={48} color="#00A389" />
              </View>
              <Text style={styles.heroTitle}>Interview Complete!</Text>
              <Text style={styles.heroSubtitle}>
                Your performance has been analyzed
              </Text>
            </View>

            {/* Main Card */}
            <View style={styles.mainCard}>
              {/* Score Section */}
              <View style={styles.scoreSection}>
                <View style={styles.scoreHeader}>
                  <Icon name="trophy" size={24} color="#00A389" />
                  <Text style={styles.scoreTitle}>Overall Score</Text>
                </View>
                <View style={styles.scoreDisplay}>
                  <Text style={styles.scorePercentage}>{performanceAnalysis.overallScore}%</Text>
                  <Text style={styles.scoreDetails}>Performance Rating</Text>
                </View>
              </View>

              {/* Performance Breakdown */}
              <View style={styles.performanceSection}>
                <View style={styles.performanceHeader}>
                  <Icon name="chart-line" size={24} color="#00A389" />
                  <Text style={styles.performanceTitle}>Performance Breakdown</Text>
                </View>
                <View style={styles.performanceList}>
                  <View style={styles.performanceItem}>
                    <Text style={styles.performanceText}>Confidence: {performanceAnalysis.confidence}</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Text style={styles.performanceText}>Tone: {performanceAnalysis.tone}</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Text style={styles.performanceText}>Quality: {performanceAnalysis.answerQuality}</Text>
                  </View>
                </View>
              </View>

              {/* Strengths Section */}
              <View style={styles.strengthsSection}>
                <View style={styles.strengthsHeader}>
                  <Icon name="check-circle" size={24} color="#00A389" />
                  <Text style={styles.strengthsTitle}>Strengths</Text>
                </View>
                <View style={styles.strengthsList}>
                  {performanceAnalysis.strengths && performanceAnalysis.strengths.length > 0 ? (
                    performanceAnalysis.strengths.map((strength: string, index: number) => (
                      <View key={index} style={styles.strengthItem}>
                        <Text style={styles.strengthText}>• {strength}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.strengthItem}>
                      <Text style={styles.strengthText}>• No specific strengths identified</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Improvements Section */}
              <View style={styles.improvementsSection}>
                <View style={styles.improvementsHeader}>
                  <Icon name="trending-up" size={24} color="#00A389" />
                  <Text style={styles.improvementsTitle}>Areas for Improvement</Text>
                </View>
                <View style={styles.improvementsList}>
                  {performanceAnalysis.improvements && performanceAnalysis.improvements.length > 0 ? (
                    performanceAnalysis.improvements.map((improvement: string, index: number) => (
                      <View key={index} style={styles.improvementItem}>
                        <Text style={styles.improvementText}>• {improvement}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.improvementItem}>
                      <Text style={styles.improvementText}>• Continue practicing to improve</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Feedback Section */}
              <View style={styles.feedbackSection}>
                <View style={styles.feedbackHeader}>
                  <Icon name="text" size={24} color="#00A389" />
                  <Text style={styles.feedbackTitle}>Overall Feedback</Text>
                </View>
                <View style={styles.feedbackContent}>
                  <Text style={styles.feedbackText}>{performanceAnalysis.feedback}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => router.back()}
                >
                  <Icon name="refresh" size={20} color="#6B7280" />
                  <Text style={styles.secondaryButtonText}>Practice Again</Text>
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
              <Icon name="robot" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>AI Interview Bot</Text>
            <Text style={styles.heroSubtitle}>
              Practice your interview skills with our AI-powered interviewer
            </Text>
          </View>

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            {/* Progress Section */}
            {interviewStarted && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <View style={styles.progressInfo}>
                    <Icon name="chart-line" size={24} color="#00A389" />
                    <Text style={styles.progressTitle}>Interview Progress</Text>
                  </View>
                  <View style={styles.timerChip}>
                    <Icon name="timer" size={18} color="#FFFFFF" />
                    <Text style={styles.timerText}>{formatTime(questionTimer)}</Text>
                  </View>
                </View>
                <View style={styles.progressInfoSection}>
                  <Text style={styles.progressText}>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Text>
                  <Text style={styles.progressSubtext}>
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]} />
                </View>
              </View>
            )}

            {/* Interview Section */}
            <View style={styles.interviewSection}>
              <View style={styles.interviewHeader}>
                <Icon name="microphone" size={24} color="#00A389" />
                <Text style={styles.interviewTitle}>
                  {!interviewStarted ? 'Ready to Start?' : 'Current Question'}
                </Text>
              </View>

              {/* Robot Avatar */}
              <View style={[
                styles.robotAvatar,
                isSpeaking && styles.robotAvatarSpeaking,
              ]}>
                <Icon name="robot" size={60} color="#FFFFFF" />
              </View>

              {!interviewStarted ? (
                <View style={styles.startContainer}>
                  <Text style={styles.startTitle}>Ready to Start Your Interview?</Text>
                  <Text style={styles.startSubtitle}>
                    I'll ask you {questions.length} questions about the {jobTitle} position. Speak clearly and take your
                    time to answer each question.
                  </Text>
                  <View style={styles.jobInfoContainer}>
                    <View style={styles.jobInfoItem}>
                      <Icon name="briefcase" size={16} color="#00A389" />
                      <Text style={styles.jobInfoText}>Job: {jobTitle}</Text>
                    </View>
                    <View style={styles.jobInfoItem}>
                      <Icon name="chart-line" size={16} color="#00A389" />
                      <Text style={styles.jobInfoText}>Level: {difficulty}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.startButton} onPress={startInterview}>
                    <Icon name="play" size={20} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>Start Interview</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>
                    {questions[currentQuestionIndex]}
                  </Text>

                  {/* Speaking/Listening Status */}
                  <View style={styles.statusContainer}>
                    {isSpeaking && (
                      <View style={styles.statusChip}>
                        <Icon name="volume-high" size={16} color="#4CAF50" />
                        <Text style={styles.statusText}>AI is speaking...</Text>
                      </View>
                    )}
                    {isListening && (
                      <View style={[styles.statusChip, styles.statusChipListening]}>
                        <Icon name="microphone" size={16} color="#F44336" />
                        <Text style={styles.statusText}>Listening...</Text>
                      </View>
                    )}
                  </View>

                  {/* Current Answer Display */}
                  {currentAnswer && (
                    <View style={styles.answerContainer}>
                      <Text style={styles.answerText}>"{currentAnswer}"</Text>
                    </View>
                  )}

                  {/* Control Buttons */}
                  {!isSpeaking && (
                    <View style={styles.controlsContainer}>
                      {/* Mic Button - Centered */}
                      <View style={styles.micButtonContainer}>
                        <TouchableOpacity
                          style={[styles.controlButton, isListening && styles.controlButtonActive]}
                          onPress={isListening ? stopListening : startListening}
                        >
                          <Icon 
                            name={isListening ? "microphone" : "microphone-outline"} 
                            size={24} 
                            color="#FFFFFF" 
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Next and Skip Buttons - Stacked in middle */}
                      <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.nextButton]}
                          onPress={nextQuestion}
                          disabled={!currentAnswer.trim()}
                        >
                          <Icon name="arrow-right" size={20} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>Next Question</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.skipButton]}
                          onPress={skipQuestion}
                        >
                          <Icon name="skip-next" size={20} color="#6B7280" />
                          <Text style={styles.skipButtonText}>Skip</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/(tabs)/interview-prep')}
            >
              <Icon name="arrow-left" size={20} color="#6B7280" />
              <Text style={styles.backButtonText}>Back to Interview Preparation</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 28,
    width: 28,
    marginRight: 6,
    resizeMode: 'contain',
  },
  logoText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
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
  },
  // Main Card
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  // Progress Section
  progressSection: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  progressInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A389',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#004D40',
  },
  progressSubtext: {
    fontSize: 14,
    color: '#6B7280',
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
  // Interview Section
  interviewSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  interviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  interviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  // Job Info
  jobInfoContainer: {
    marginBottom: 24,
    gap: 12,
  },
  jobInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  jobInfoText: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '500',
    marginLeft: 12,
  },
  // Back Button
  backButton: {
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
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  robotAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00A389',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  robotAvatarSpeaking: {
    backgroundColor: '#4CAF50',
  },
  startContainer: {
    alignItems: 'center',
    width: '100%',
  },
  startTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 16,
  },
  startSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A389',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  questionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusChipListening: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 14,
    color: '#004D40',
    marginLeft: 4,
    fontWeight: '600',
  },
  answerContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  answerText: {
    fontSize: 16,
    color: '#004D40',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  controlsContainer: {
    alignItems: 'center',
    gap: 24,
  },
  micButtonContainer: {
    alignItems: 'center',
  },
  actionButtonsContainer: {
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00A389',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#F44336',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextButton: {
    backgroundColor: '#00A389',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
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
  // Results Screen Styles (Career Path Design)
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
    color: '#00A389',
    marginBottom: 8,
  },
  scoreDetails: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  performanceSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  performanceList: {
    gap: 12,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  performanceText: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '500',
  },
  strengthsSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  strengthsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  strengthsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  strengthsList: {
    gap: 12,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
  },
  strengthText: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '500',
  },
  improvementsSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  improvementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  improvementsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  improvementsList: {
    gap: 12,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  improvementText: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '500',
  },
  feedbackSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  feedbackContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  feedbackText: {
    fontSize: 16,
    color: '#004D40',
    lineHeight: 24,
    fontWeight: '500',
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
});
