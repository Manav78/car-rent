import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  BookOpen, 
  User, 
  CheckSquare, 
  CreditCard, 
  MapPin, 
  CalendarPlus,
  Users
} from 'lucide-react';
import { getActiveRole } from '../../utils/authStorage';
import { ROLES } from '../../utils/constants';

const mobileNavItemsByRole = {
  [ROLES.CUSTOMER]: [
    { label: 'Home', path: '/customer', icon: LayoutDashboard },
    { label: 'Vehicles', path: '/customer/vehicles', icon: Car },
    { label: 'Book', path: '/customer/bookings/create', icon: CalendarPlus },
    { label: 'Bookings', path: '/customer/bookings', icon: BookOpen },
    { label: 'Profile', path: '/customer/profile', icon: User },
  ],
  [ROLES.OWNER]: [
    { label: 'Dashboard', path: '/owner', icon: LayoutDashboard },
    { label: 'Vehicles', path: '/owner/vehicles', icon: Car },
    { label: 'Drivers', path: '/owner/drivers', icon: Users },
    { label: 'Bookings', path: '/owner/bookings', icon: CheckSquare },
    { label: 'Profile', path: '/owner/profile', icon: User },
  ],
  [ROLES.DRIVER]: [
    { label: 'Dashboard', path: '/driver', icon: LayoutDashboard },
    { label: 'My Trips', path: '/driver/trips', icon: MapPin },
    { label: 'Profile', path: '/driver/profile', icon: User },
  ],
  [ROLES.ADMIN]: [], // Super Admin uses desktop sidebar navigation
};

const roleActiveStyles = {
  [ROLES.CUSTOMER]: 'text-emerald-500 dark:text-emerald-400 font-bold',
  [ROLES.OWNER]: 'text-blue-600 dark:text-blue-400 font-bold',
  [ROLES.DRIVER]: 'text-purple-600 dark:text-purple-400 font-bold',
  [ROLES.ADMIN]: 'text-rose-600 dark:text-rose-400 font-bold',
};

const MobileBottomNav = () => {
  const location = useLocation();
  const activeRole = getActiveRole();
  const items = mobileNavItemsByRole[activeRole] || [];

  if (items.length === 0) return null;

  const activeColor = roleActiveStyles[activeRole] || 'text-indigo-500 font-bold';

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-2xl h-16 flex items-center justify-around px-2"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={true}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all relative ${
              isActive 
                ? activeColor 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
