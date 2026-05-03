import React from 'react';

const Loading = () => {
  return (
    <>
      <span className="flex space-x-4">
        <span className="dot bg-lime-600"></span>
      </span>
      
      <style jsx>{`
        .dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
            box-shadow: 0 0 12px oklch(0.897 0.196 126.665);
          }
        }
      `}</style>
    </>
  );
};

export default Loading;