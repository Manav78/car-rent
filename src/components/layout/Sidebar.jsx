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
    activeBg: 'bg-slate-950 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm font-black',
    hoverText: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
    accentText: 'text-amber-500',
  },
  [ROLES.OWNER]: {
    activeBg: 'bg-slate-950 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm font-black',
    hoverText: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
    accentText: 'text-amber-500',
  },
  [ROLES.DRIVER]: {
    activeBg: 'bg-slate-950 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm font-black',
    hoverText: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
    accentText: 'text-blue-500',
  },
  [ROLES.ADMIN]: {
    activeBg: 'bg-slate-950 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm font-black',
    hoverText: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
    accentText: 'text-rose-500',
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
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 h-screen md:h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 shrink-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-amber-500 text-amber-400 dark:text-slate-950 flex items-center justify-center font-black">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">DriveEase</h2>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Mobility Pro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
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
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive || isCurrentlySelected
                      ? roleTheme.activeBg
                      : roleTheme.hoverText
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {(location.pathname === item.path) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Multi-Role Quick Switcher */}
        {userRoles.length > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Switch Mode
            </p>
            <div className="space-y-1">
              {userRoles.map((role) => {
                const isActive = role === activeRole;

                return (
                  <NavLink
                    key={role}
                    to={DEFAULT_ROLE_REDIRECTS[role] || '/'}
                    onClick={() => handleRoleSwitch(role)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{role.replace('ROLE_', '')}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
