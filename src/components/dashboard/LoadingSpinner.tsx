
import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F0E]"></div>
    </div>
  );
};
