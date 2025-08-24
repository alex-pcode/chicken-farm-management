import React from 'react';
import { Modal } from './Modal';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface AlertDialogProps extends BaseUIComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  info: {
    icon: 'ℹ️',
    iconColor: 'text-blue-600',
    buttonClass: 'neu-button',
    borderColor: 'border-blue-200'
  },
  success: {
    icon: '✅',
    iconColor: { color: 'oklch(0.44 0.11 162.79)' },
    buttonClass: 'px-4 py-2 rounded-md transition-colors text-white',
    buttonStyle: { backgroundColor: 'oklch(0.44 0.11 162.79)' },
    borderColor: 'border-emerald-200'
  },
  warning: {
    icon: '⚠️',
    iconColor: 'text-yellow-600',
    buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors',
    borderColor: 'border-yellow-200'
  },
  error: {
    icon: '❌',
    iconColor: 'text-red-600',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors',
    borderColor: 'border-red-200'
  }
};

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  variant = 'info',
  className = '',
  testId,
}) => {
  const styles = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
      className={`${styles.borderColor} ${className}`}
      testId={testId}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div 
            className={`text-2xl ${typeof styles.iconColor === 'string' ? styles.iconColor : ''}`}
            style={typeof styles.iconColor === 'object' ? styles.iconColor : undefined}
          >
            {styles.icon}
          </div>
          <div className="flex-1">
            <p className="text-gray-600">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className={styles.buttonClass}
            style={'buttonStyle' in styles ? styles.buttonStyle : undefined}
            autoFocus
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};