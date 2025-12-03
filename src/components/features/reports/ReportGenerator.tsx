import { ReactNode, useRef } from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface ReportGeneratorProps {
  title: string;
  children: ReactNode;
}

export const ReportGenerator = ({ title, children }: ReportGeneratorProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = contentRef.current;
    if (!printContent) return;

    const printStyles = `
      <style>
        @media print {
          body { 
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .no-print { display: none; }
          table { 
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
          }
          th, td { 
            padding: 12px;
            border: 1px solid #e5e7eb;
            text-align: left;
          }
          th { 
            background-color: #f9fafb;
            font-weight: 600;
          }
          h1 { 
            font-size: 24px;
            margin-bottom: 1.5rem;
            color: #1f2937;
          }
          h2 { 
            font-size: 20px;
            margin: 2rem 0 1rem;
            color: #374151;
          }
          .print-section { 
            margin-bottom: 2rem;
            page-break-inside: avoid;
          }
          .stat-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
          }
          .stat-label {
            font-size: 0.875rem;
            color: #6b7280;
          }
        }
      </style>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>${title} - Report</title>
            ${printStyles}
          </head>
          <body>
            <h1>${title}</h1>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="print-container"
    >
      <button
        onClick={handlePrint}
        className="no-print mb-6 inline-flex items-center px-4 py-2.5 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors font-medium"
      >
        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
        Generate Report
      </button>
      <div ref={contentRef} className="print-content">
        {children}
      </div>
    </motion.div>
  );
};