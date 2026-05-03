import { useEffect } from 'react';
import { Ban, X } from 'lucide-react';

// Simple Toast Notification Component
const Toast = ({ message, type, onClose }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
        onClose();
    }, 3000); // Auto dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const baseStyles = "flex justify-between items-center fixed top-17 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center justify-between min-w-64 max-w-sm transition-all duration-300 ease-in-out";
  
  const typeStyles = {
    normal: "bg-lime-50 text-lime-700 border-l-4 border-lime-500 text-gray-700",
    error: "bg-red-50 text-red-600 border-l-4 border-red-500 text-gray-700"
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
        { type == "error" ? <Ban /> : null}
        <span className="text-sm font-medium">{message}</span>
        <button 
            onClick={() => onClose()} 
            className="ml-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close notification"
        >
            <X className="h-4 w-4" />
        </button>
    </div>
  );
};

export default Toast;