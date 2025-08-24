import React, { useState } from 'react';
import { Modal } from '../../ui/modals/Modal';
import { AlertDialog } from '../../ui/modals/AlertDialog';
import { ConfirmDialog } from '../../ui/modals/ConfirmDialog';
import { FormModal } from '../../ui/modals/FormModal';
import { FormButton } from '../../ui/forms/FormButton';

const ModalsTab: React.FC = () => {
  // Modal states
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  return (
    <div className="space-y-12">
      {/* Basic Modals */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Modals</h2>
          <p className="text-gray-600">Standard modal windows with different sizes</p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <FormButton
            onClick={() => setShowBasicModal(true)}
            variant="primary"
          >
            Open Basic Modal
          </FormButton>
          
          <FormButton
            onClick={() => setShowLargeModal(true)}
            variant="secondary"
          >
            Open Large Modal
          </FormButton>
        </div>
      </section>

      {/* Alert Dialogs */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Dialogs</h2>
          <p className="text-gray-600">Informational alerts with different severity levels</p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <FormButton
            onClick={() => setShowInfoAlert(true)}
            variant="secondary"
          >
            Info Alert
          </FormButton>
          
          <FormButton
            onClick={() => setShowSuccessAlert(true)}
            variant="primary"
          >
            Success Alert
          </FormButton>
          
          <FormButton
            onClick={() => setShowWarningAlert(true)}
            variant="secondary"
          >
            Warning Alert
          </FormButton>
          
          <FormButton
            onClick={() => setShowErrorAlert(true)}
            variant="danger"
          >
            Error Alert
          </FormButton>
        </div>
      </section>

      {/* Confirmation Dialogs */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation Dialogs</h2>
          <p className="text-gray-600">Action confirmations and form dialogs</p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <FormButton
            onClick={() => setShowConfirmDialog(true)}
            variant="primary"
          >
            Confirm Action
          </FormButton>
          
          <FormButton
            onClick={() => setShowDangerConfirm(true)}
            variant="danger"
          >
            Danger Confirm
          </FormButton>
          
          <FormButton
            onClick={() => setShowFormModal(true)}
            variant="secondary"
          >
            Form Modal
          </FormButton>
        </div>
      </section>

      {/* Modal Components */}
      <Modal
        isOpen={showBasicModal}
        onClose={() => setShowBasicModal(false)}
        title="Basic Modal Example"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a basic modal window. It can contain any content you need to display
            in an overlay format.
          </p>
          <p className="text-gray-600">
            You can close this modal by clicking the X button, pressing Escape, or clicking
            outside the modal content area.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowBasicModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <FormButton
              onClick={() => setShowBasicModal(false)}
              variant="primary"
            >
              Got it
            </FormButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showLargeModal}
        onClose={() => setShowLargeModal(false)}
        title="Large Modal Example"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            This is a large modal that provides more space for complex content. It's perfect
            for forms, detailed information, or multi-step processes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Farm Statistics</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Total Eggs Today: 47</li>
                <li>• Active Hens: 45</li>
                <li>• Feed Remaining: 87 lbs</li>
                <li>• Revenue: $23.50</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recent Activities</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Morning collection completed</li>
                <li>• Feed distributed</li>
                <li>• Nest boxes cleaned</li>
                <li>• Water refreshed</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowLargeModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <FormButton
              onClick={() => setShowLargeModal(false)}
              variant="primary"
            >
              Save Changes
            </FormButton>
          </div>
        </div>
      </Modal>

      <AlertDialog
        isOpen={showInfoAlert}
        onClose={() => setShowInfoAlert(false)}
        variant="info"
        title="Information"
        message="This is an informational message. It provides neutral information to the user without requiring immediate action."
      />

      <AlertDialog
        isOpen={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        variant="success"
        title="Success!"
        message="Your egg collection has been successfully recorded. Today's total: 47 eggs."
      />

      <AlertDialog
        isOpen={showWarningAlert}
        onClose={() => setShowWarningAlert(false)}
        variant="warning"
        title="Warning"
        message="Feed levels are running low. Consider ordering more feed within the next 3 days to avoid running out."
      />

      <AlertDialog
        isOpen={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        variant="error"
        title="Error Occurred"
        message="Unable to save the egg collection data. Please check your connection and try again."
      />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirm Action"
        message="Are you sure you want to mark today's egg collection as complete? This action cannot be undone."
        onConfirm={() => {
          setShowConfirmDialog(false);
          alert('Collection marked as complete!');
        }}
        confirmText="Mark Complete"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={showDangerConfirm}
        onClose={() => setShowDangerConfirm(false)}
        title="Delete All Records"
        message="This will permanently delete all egg collection records for this month. This action cannot be undone."
        onConfirm={() => {
          setShowDangerConfirm(false);
          alert('Records deleted!');
        }}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
      />

      <FormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Add New Hen"
        onSubmit={(event) => {
          const formData = new FormData(event.currentTarget);
          const name = formData.get('name') as string;
          setShowFormModal(false);
          alert(`New hen added: ${name}`);
        }}
        submitText="Add Hen"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-600 text-sm mb-2">
              Hen Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter hen name..."
              required
              className="neu-input"
            />
          </div>
          
          <div>
            <label htmlFor="breed" className="block text-gray-600 text-sm mb-2">
              Breed
            </label>
            <select
              id="breed"
              name="breed"
              required
              className="neu-input"
            >
              <option value="">Select a breed...</option>
              <option value="rhode-island-red">Rhode Island Red</option>
              <option value="sussex">Sussex</option>
              <option value="leghorn">Leghorn</option>
              <option value="orpington">Orpington</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="age" className="block text-gray-600 text-sm mb-2">
              Age (weeks)
            </label>
            <input
              type="number"
              id="age"
              name="age"
              placeholder="0"
              required
              className="neu-input"
            />
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-gray-600 text-sm mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about this hen..."
              rows={3}
              className="neu-input resize-none"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default ModalsTab;