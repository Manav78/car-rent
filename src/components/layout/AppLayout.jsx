import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { getActiveRole, isAuthenticated } from '../../utils/authStorage';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(getActiveRole());
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  useEffect(() => {
    const handleAuthOrRoleChange = () => {
      setCurrentRole(getActiveRole());
      setIsAuth(isAuthenticated());
    };

    window.addEventListener('roleChange', handleAuthOrRoleChange);
    window.addEventListener('authChange', handleAuthOrRoleChange);

    return () => {
      window.removeEventListener('roleChange', handleAuthOrRoleChange);
      window.removeEventListener('authChange', handleAuthOrRoleChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex w-full">
        {/* Only render Sidebar for authenticated users */}
        {isAuth && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            key={currentRole}
          />
        )}
        
        <main className={`flex-1 min-w-0 p-4 md:p-6 lg:p-8 ${isAuth ? 'pb-24 md:pb-8' : 'pb-12'} transition-colors duration-200`}>
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Only render Mobile Bottom Nav for authenticated users */}
      {isAuth && <MobileBottomNav />}
    </div>
  );
};

export default AppLayout;
