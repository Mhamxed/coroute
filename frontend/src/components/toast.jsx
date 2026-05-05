// Toast.jsx
import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    normal: { bg: "bg-gray-900 border-gray-700", icon: <CheckCircle size={15} className="text-lime-400 flex-shrink-0" />, text: "text-white" },
    error:  { bg: "bg-red-600 border-red-500",   icon: <AlertCircle size={15} className="text-white flex-shrink-0" />,    text: "text-white" },
  };

  const s = styles[type] || styles.normal;

  return (
    <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border min-w-64 max-w-sm ${s.bg} animate-in`}>
      {s.icon}
      <span className={`text-sm font-medium flex-1 ${s.text}`}>{message}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white transition-colors cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
};