import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import RecordPage from './pages/bill/Record/index';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="w-full h-full bg-gray-50 text-gray-900 font-sans">
        <Routes>
          {/* Redirect root "/" to "/bill/record" */}
          <Route path="/" element={<Navigate to="/bill/record" replace />} />
          
          {/* The Record Page Route */}
          <Route path="/bill/record" element={<RecordPage />} />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/bill/record" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;