import React from 'react';

const LoadingComponent = () => {
  return (
    <div>
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
      </div>
    </div>
  );
};

export default LoadingComponent;
