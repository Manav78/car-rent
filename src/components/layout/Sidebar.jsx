import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  CalendarPlus, 
  BookOpen, 
  ShieldCheck, 
  MapPin, 
  CheckSquare, 
  UserCheck,
  Users,
  User,
  X, 
  Sparkles, 
  CreditCard,
  Building
} from 'lucide-react';
import { getActiveRole, getRoles, setActiveRole } from '../../utils/authStorage';
import { ROLES, DEFAULT_ROLE_REDIRECTS } from '../../utils/constants';

const navMenusByRole = {
  [ROLES.CUSTOMER]: [
    { label: 'Fleet Marketplace', path: '/customer/vehicles', icon: Car },
    { label: 'Reserve a Car', path: '/customer/bookings/create', icon: CalendarPlus },
    { label: 'My Bookings', path: '/customer/bookings', icon: BookOpen },
    { label: 'Dashboard', path: '/customer', icon: LayoutDashboard },
    { label: 'My Profile', path: '/customer/profile', icon: User },
  ],
  [ROLES.OWNER]: [
    { label: 'Dashboard', path: '/owner', icon: LayoutDashboard },
    { label: 'My Vehicles', path: '/owner/vehicles', icon: Car },
    { label: 'My Drivers', path: '/owner/drivers', icon: Users },
    { label: 'Booking Requests', path: '/owner/bookings', icon: CheckSquare },
    { label: 'Fleet Subscriptions', path: '/owner/subscription', icon: CreditCard },
    { label: 'My Profile', path: '/owner/profile', icon: User },
  ],
  [ROLES.DRIVER]: [
    { label: 'Dashboard', path: '/driver', icon: LayoutDashboard },
    { label: 'Assigned Trips', path: '/driver/trips', icon: MapPin },
    { label: 'My Driver Profile', path: '/driver/profile', icon: User },
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'System Approvals', path: '/admin/approvals', icon: ShieldCheck },
    { label: 'Platform Accounts', path: '/admin/accounts', icon: Users },
    { label: 'Subscription Plans', path: '/admin/plans', icon: CreditCard },
    { label: 'Platform Owners', path: '/admin/owners', icon: Building },
    { label: 'Platform Drivers', path: '/admin/drivers', icon: UserCheck },
    { label: 'All Vehicles', path: '/admin/vehicles', icon: Car },
  ],
};

const roleThemeStyles = {
  [ROLES.CUSTOMER]: {
    activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30',
    hoverText: 'hover:bg-slate-800 hover:text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentText: 'text-emerald-400',
  },
  [ROLES.OWNER]: {
    activeBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30',
    hoverText: 'hover:bg-slate-800 hover:text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    accentText: 'text-blue-400',
  },
  [ROLES.DRIVER]: {
    activeBg: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30',
    hoverText: 'hover:bg-slate-800 hover:text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accentText: 'text-purple-400',
  },
  [ROLES.ADMIN]: {
    activeBg: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/30',
    hoverText: 'hover:bg-slate-800 hover:text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    accentText: 'text-rose-400',
  },
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const activeRole = getActiveRole();
  const userRoles = getRoles();

  const menuItems = navMenusByRole[activeRole] || navMenusByRole[ROLES.CUSTOMER];
  const roleTheme = roleThemeStyles[activeRole] || roleThemeStyles[ROLES.CUSTOMER];

  const handleRoleSwitch = (role) => {
    setActiveRole(role);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 h-screen md:h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40 shrink-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-extrabold shadow-md">
              🇮🇳
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-100">DriveIndia</h2>
              <p className="text-[10px] text-emerald-400 font-bold uppercase">Car Rental</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3.5 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className={`w-3 h-3 ${roleTheme.accentText}`} />
              Navigation Menu
            </span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrentlySelected = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={true}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive || isCurrentlySelected
                      ? roleTheme.activeBg
                      : `text-slate-400 ${roleTheme.hoverText}`
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {location.pathname === item.path && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Multi-Role Quick Switcher */}
        {userRoles.length > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Switch Mode
            </p>
            <div className="space-y-1.5">
              {userRoles.map((role) => {
                const isActive = role === activeRole;
                const rStyle = roleThemeStyles[role] || roleThemeStyles[ROLES.CUSTOMER];

                return (
                  <NavLink
                    key={role}
                    to={DEFAULT_ROLE_REDIRECTS[role] || '/'}
                    onClick={() => handleRoleSwitch(role)}
                    className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? `bg-slate-850 ${rStyle.badge}`
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>{role.replace('ROLE_', '')} Mode</span>
                    </div>
                    {isActive && (
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-mono font-extrabold uppercase bg-white/10">
                        ACTIVE
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-center bg-slate-950">
          <p className="text-[11px] text-slate-200 font-extrabold tracking-wide">DriveIndia Rentals 🇮🇳</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Enterprise Portal • Standalone Ready</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
