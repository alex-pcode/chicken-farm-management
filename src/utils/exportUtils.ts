export const exportToCSV = (data: any[], filename: string): void => {
  try {
    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const cell = row[header]?.toString() ?? '';
          return cell.includes(',') ? `"${cell}"` : cell;
        }).join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);

    // Show toast notification
    showToast('Export successful!', 'success');

    // Trigger download
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export failed:', error);
    showToast('Export failed. Please try again.', 'error');
  }
};

const showToast = (message: string, type: 'success' | 'error'): void => {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 py-2 px-4 rounded-lg shadow-lg text-white text-sm font-medium z-50 animate-slide-up ${
    type === 'success' ? 'bg-success' : 'bg-danger'
  }`;
  toast.textContent = message;

  // Add to document
  document.body.appendChild(toast);

  // Remove after delay
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    toast.style.transition = 'all 0.3s ease-in-out';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
};