import React from 'react';

interface ErrorProps {
  message: string;
  onClose: () => void;
}

export default function ModalError({ message, onClose }: ErrorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-lg w-full break-words">
        <h2 className="text-xl font-bold mb-4 text-red-600">Error</h2>
        <p className="mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
