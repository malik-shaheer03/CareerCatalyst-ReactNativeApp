import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastNotification from '@/components/ToastNotification';

// Types
export interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom';
  showIcon?: boolean;
  actionText?: string;
  onActionPress?: () => void;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);

  // Show toast with custom config
  const showToast = useCallback((config: ToastConfig) => {
    setToastConfig(config);
    setVisible(true);
  }, []);

  // Hide toast
  const hideToast = useCallback(() => {
    setVisible(false);
    // Clear config after animation completes
    setTimeout(() => {
      setToastConfig(null);
    }, 300);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message: string, duration = 3000) => {
    showToast({
      message,
      type: 'success',
      duration,
    });
  }, [showToast]);

  const showError = useCallback((message: string, duration = 4000) => {
    showToast({
      message,
      type: 'error',
      duration,
    });
  }, [showToast]);

  const showWarning = useCallback((message: string, duration = 3500) => {
    showToast({
      message,
      type: 'warning',
      duration,
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, duration = 3000) => {
    showToast({
      message,
      type: 'info',
      duration,
    });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toastConfig && (
        <ToastNotification
          visible={visible}
          message={toastConfig.message}
          type={toastConfig.type}
          duration={toastConfig.duration}
          position={toastConfig.position}
          showIcon={toastConfig.showIcon}
          actionText={toastConfig.actionText}
          onActionPress={toastConfig.onActionPress}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

// Hook to use toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
