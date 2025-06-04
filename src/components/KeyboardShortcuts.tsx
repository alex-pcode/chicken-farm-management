import { motion } from 'framer-motion';

interface KeyboardShortcut {
  key: string;
  description: string;
  modifier?: string;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts = ({ shortcuts, isOpen, onClose }: KeyboardShortcutsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 ${
        isOpen ? '' : 'pointer-events-none'
      }`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full m-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {shortcuts.map((shortcut, index) => (
            <motion.div
              key={shortcut.key}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex justify-between items-center"
            >
              <span className="text-gray-600">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.modifier && (
                  <>
                    <kbd className="px-2.5 py-1.5 text-sm font-mono bg-gray-100 rounded-lg text-gray-800">
                      {shortcut.modifier}
                    </kbd>
                    <span className="text-gray-400">+</span>
                  </>
                )}
                <kbd className="px-2.5 py-1.5 text-sm font-mono bg-gray-100 rounded-lg text-gray-800">
                  {shortcut.key}
                </kbd>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Press <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 rounded-lg">?</kbd> to show/hide shortcuts
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};