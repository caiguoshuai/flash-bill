import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RecordPage from './pages/bill/Record/index';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-gray-50 text-gray-900 font-sans">
        <Routes>
          {/* Default Route to Record Page */}
          <Route path="/" element={<RecordPage />} />
          
          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;