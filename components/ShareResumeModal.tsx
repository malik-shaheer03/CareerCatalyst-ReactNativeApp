import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ResumeData } from '@/lib/resume';
import { generateResumePDF, generateResumeFilename } from '@/lib/services/resume-pdf-service';
import { sendResumeEmail } from '@/lib/services/backend-api';

interface ShareResumeModalProps {
  visible: boolean;
  resume: ResumeData | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function ShareResumeModal({
  visible,
  resume,
  onClose,
  onSuccess,
  onError,
}: ShareResumeModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setRecipientEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleSend = async () => {
    if (!resume) {
      console.error('ShareResumeModal: No resume data available');
      onError('No resume data available');
      return;
    }

    console.log('ShareResumeModal: Resume data:', {
      hasPersonal: !!resume.personal,
      hasSummary: !!resume.summary,
      experienceCount: resume.experience?.length || 0,
      educationCount: resume.education?.length || 0,
      skillsCount: resume.skills?.length || 0,
      projectsCount: resume.projects?.length || 0,
    });

    // Validate email
    if (!recipientEmail.trim()) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(recipientEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSending(true);

    try {
      console.log('ShareResumeModal: Starting PDF generation...');
      // Generate PDF
      const { base64 } = await generateResumePDF(resume);
      console.log('ShareResumeModal: PDF generated, base64 length:', base64.length);
      
      // Prepare data for email service
      const filename = generateResumeFilename(resume);
      const senderName = `${resume.personal.firstName || ''} ${resume.personal.lastName || ''}`.trim() || 'Job Seeker';
      
      console.log('ShareResumeModal: Sending email with filename:', filename);
      
      // Convert base64 to data URI
      const pdfDataUri = `data:application/pdf;base64,${base64}`;

      // Send email via backend
      await sendResumeEmail({
        recipientEmail: recipientEmail.trim(),
        senderName,
        message: message.trim(),
        pdfData: pdfDataUri,
        filename,
      });

      console.log('ShareResumeModal: Email sent successfully');
      
      // Success
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('ShareResumeModal: Error sending resume:', error);
      onError(error.message || 'Failed to send resume. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setRecipientEmail('');
      setMessage('');
      setEmailError('');
      onClose();
    }
  };

  const getSenderName = (): string => {
    if (!resume) return 'Your Resume';
    const { firstName, lastName } = resume.personal;
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Your Resume';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Icon name="email" size={24} color="#00A389" />
              </View>
              <Text style={styles.modalTitle}>Share Resume via Email</Text>
            </View>
            {!isSending && (
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Resume Info */}
            <View style={styles.resumeInfo}>
              <Icon name="file-document" size={20} color="#00A389" />
              <Text style={styles.resumeInfoText}>
                Sending: <Text style={styles.resumeName}>{getSenderName()}</Text>
              </Text>
            </View>

            {/* Recipient Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Recipient Email <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                <Icon name="email-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={recipientEmail}
                  onChangeText={handleEmailChange}
                  placeholder="Enter recipient's email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSending}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Personal Message */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Personal Message (Optional)</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Add a personal message to your resume..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isSending}
                />
              </View>
              <Text style={styles.helperText}>
                This message will be included in the email body
              </Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Icon name="information" size={18} color="#00A389" />
              <Text style={styles.infoText}>
                Your resume will be sent as a PDF attachment via professional email template
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelButton, isSending && styles.buttonDisabled]}
              onPress={handleClose}
              disabled={isSending}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendButton, isSending && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={isSending || !recipientEmail.trim()}
            >
              {isSending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Icon name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Send Resume</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  resumeInfoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  resumeName: {
    fontWeight: '600',
    color: '#00A389',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  textAreaWrapper: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
  },
  textArea: {
    fontSize: 15,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E0F2F1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#00A389',
    marginLeft: 8,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#00A389',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
