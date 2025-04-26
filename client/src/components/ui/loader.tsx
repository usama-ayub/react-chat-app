import React from 'react';

export const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-gray-500"></div>
    </div>
  );
};