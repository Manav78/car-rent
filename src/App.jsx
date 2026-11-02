import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
            <AppRoutes />
          </div>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
