import React from 'react';
import { HashRouter } from 'react-router-dom';
import AppRouter from './router';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="w-full h-full bg-gray-50 text-gray-900 font-sans">
        <AppRouter />
      </div>
    </HashRouter>
  );
};

export default App;