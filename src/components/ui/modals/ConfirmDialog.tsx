import React from 'react';
import { Modal } from './Modal';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface ConfirmDialogProps extends BaseUIComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  loading?: boolean;
  disabled?: boolean;
}

const variantStyles = {
  default: {
    confirmButton: 'neu-button',
    icon: '❓',
    iconColor: 'text-blue-600'
  },
  danger: {
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors',
    icon: '⚠️',
    iconColor: 'text-red-600'
  },
  warning: {
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors',
    icon: '⚠️',
    iconColor: 'text-yellow-600'
  },
  success: {
    confirmButton: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors',
    icon: '✅',
    iconColor: 'text-green-600'
  }
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  disabled = false,
  className = '',
  testId,
}) => {
  const styles = variantStyles[variant];

  const handleConfirm = () => {
    if (loading || disabled) return;
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className={className}
      testId={testId}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`text-2xl ${styles.iconColor}`}>
            {styles.icon}
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          {cancelText && (
            <button
              onClick={onClose}
              disabled={loading || disabled}
              className="neu-button-secondary"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={loading || disabled}
            className={`${styles.confirmButton} ${(loading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};