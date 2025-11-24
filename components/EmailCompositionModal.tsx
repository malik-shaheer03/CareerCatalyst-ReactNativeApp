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
import { sendCandidateEmail, type SendCandidateEmailRequest } from '@/lib/services/backend-api';

interface EmailCompositionModalProps {
  visible: boolean;
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

// Email templates
const EMAIL_TEMPLATES = {
  interview: {
    subject: 'Interview Invitation - {jobTitle}',
    body: `Dear {candidateName},

Thank you for your interest in the {jobTitle} position at {companyName}.

We were impressed with your application and would like to invite you for an interview. Please let us know your availability for the coming week.

We look forward to speaking with you.

Best regards,
{companyName} Team`,
  },
  shortlist: {
    subject: 'Application Update - {jobTitle}',
    body: `Dear {candidateName},

We are pleased to inform you that your application for the {jobTitle} position has been shortlisted.

We will be in touch soon with next steps.

Best regards,
{companyName} Team`,
  },
  rejection: {
    subject: 'Application Status - {jobTitle}',
    body: `Dear {candidateName},

Thank you for your interest in the {jobTitle} position at {companyName}.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate the time you took to apply and wish you the best in your job search.

Best regards,
{companyName} Team`,
  },
  custom: {
    subject: '',
    body: '',
  },
};

export default function EmailCompositionModal({
  visible,
  candidateEmail,
  candidateName,
  jobTitle,
  companyName,
  onClose,
  onSuccess,
  onError,
}: EmailCompositionModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMAIL_TEMPLATES>('custom');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const applyTemplate = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    setSelectedTemplate(templateKey);
    const template = EMAIL_TEMPLATES[templateKey];
    
    // Replace placeholders
    const replacedSubject = template.subject
      .replace('{jobTitle}', jobTitle)
      .replace('{candidateName}', candidateName)
      .replace('{companyName}', companyName);
    
    const replacedBody = template.body
      .replace(/{candidateName}/g, candidateName)
      .replace(/{jobTitle}/g, jobTitle)
      .replace(/{companyName}/g, companyName);
    
    setSubject(replacedSubject);
    setBody(replacedBody);
  };

  const handleSend = async () => {
    // Validation
    if (!subject.trim()) {
      onError('Subject is required');
      return;
    }

    if (!body.trim()) {
      onError('Message body is required');
      return;
    }

    setIsSending(true);

    try {
      const emailData: SendCandidateEmailRequest = {
        to: candidateEmail,
        subject: subject.trim(),
        body: body.trim(),
        company: companyName,
        jobTitle,
        candidateName,
      };

      await sendCandidateEmail(emailData);
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error sending email:', error);
      onError(error.message || 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setSelectedTemplate('custom');
      setSubject('');
      setBody('');
      onClose();
    }
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
                <Icon name="email-edit-outline" size={24} color="#00A389" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Send Email</Text>
                <Text style={styles.modalSubtitle}>To: {candidateName}</Text>
              </View>
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
            {/* Email Templates */}
            <View style={styles.templatesSection}>
              <Text style={styles.sectionLabel}>Quick Templates</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.templatesContainer}>
                  {Object.keys(EMAIL_TEMPLATES).map((key) => {
                    const templateKey = key as keyof typeof EMAIL_TEMPLATES;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.templateChip,
                          selectedTemplate === key && styles.templateChipActive,
                        ]}
                        onPress={() => applyTemplate(templateKey)}
                      >
                        <Text
                          style={[
                            styles.templateChipText,
                            selectedTemplate === key && styles.templateChipTextActive,
                          ]}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Subject */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Subject <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Icon name="text" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Email subject"
                  placeholderTextColor="#9CA3AF"
                  editable={!isSending}
                />
              </View>
            </View>

            {/* Message Body */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Message <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  value={body}
                  onChangeText={setBody}
                  placeholder="Type your message here..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                  editable={!isSending}
                />
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Icon name="information" size={18} color="#00A389" />
              <Text style={styles.infoText}>
                Email will be sent with professional formatting and your company branding
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
              disabled={isSending || !subject.trim() || !body.trim()}
            >
              {isSending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Icon name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Send Email</Text>
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
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  templatesSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  templatesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  templateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  templateChipActive: {
    backgroundColor: '#00A389',
    borderColor: '#00A389',
  },
  templateChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  templateChipTextActive: {
    color: '#FFFFFF',
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
    minHeight: 150,
    textAlignVertical: 'top',
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
