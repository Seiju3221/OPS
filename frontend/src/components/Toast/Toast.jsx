import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 ${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg`}>
      <Icon className="h-5 w-5" />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-75"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;