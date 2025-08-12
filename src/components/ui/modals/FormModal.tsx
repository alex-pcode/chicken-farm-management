import React from 'react';
import { Modal } from './Modal';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface FormModalProps extends BaseUIComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFooter?: boolean;
  submitDisabled?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  size = 'md',
  showFooter = true,
  submitDisabled = false,
  children,
  className = '',
  testId,
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit && !loading) {
      onSubmit(event);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      testId={testId}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {children}
        </div>
        
        {showFooter && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="neu-button-secondary"
            >
              {cancelText}
            </button>
            {onSubmit && (
              <button
                type="submit"
                disabled={loading || submitDisabled}
                className="neu-button"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Processing...
                  </div>
                ) : (
                  submitText
                )}
              </button>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
};