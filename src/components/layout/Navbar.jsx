import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  ChevronDown, 
  Shield, 
  Car, 
  Navigation, 
  UserCheck,
  Sun,
  Moon,
  CreditCard,
  Sparkles,
  Compass,
  LogIn,
  UserPlus,
  Bell,
  CheckCheck,
  Check
} from 'lucide-react';
import { 
  getUser, 
  getRoles, 
  getActiveRole, 
  setActiveRole, 
  clearAuth,
  isAuthenticated
} from '../../utils/authStorage';
import { authApi } from '../../api/authApi';
import { adminApi } from '../../api/adminApi';
import { customerApi } from '../../api/customerApi';
import { DEFAULT_ROLE_REDIRECTS, ROLES } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';

const roleLabels = {
  [ROLES.CUSTOMER]: { name: 'Customer', icon: User, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  [ROLES.OWNER]: { name: 'Vehicle Owner', icon: Car, color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  [ROLES.DRIVER]: { name: 'Driver', icon: Navigation, color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  [ROLES.ADMIN]: { name: 'Super Admin', icon: Shield, color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isAuth = isAuthenticated();
  const user = getUser();
  const userRoles = getRoles();
  const activeRole = getActiveRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Fetch unread count for badge
  const fetchUnreadCount = async () => {
    if (!isAuth) return;
    try {
      if (activeRole === ROLES.ADMIN) {
        const count = await adminApi.getUnreadNotificationCount();
        setUnreadCount(Number(count) || 0);
      } else {
        const res = await customerApi.getUnreadCount();
        setUnreadCount(Number(res?.count ?? res?.unreadCount) || 0);
      }
    } catch {
      // quiet fail
    }
  };

  // Fetch notification list
  const fetchNotificationList = async () => {
    if (!isAuth) return;
    try {
      setLoadingNotifs(true);
      if (activeRole === ROLES.ADMIN) {
        const list = await adminApi.getNotifications({ size: 15, bypassCache: true });
        setNotifications(Array.isArray(list) ? list : []);
      } else {
        const list = await customerApi.getNotifications({ bypassCache: true });
        setNotifications(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 45000);
      return () => clearInterval(interval);
    }
  }, [isAuth, activeRole]);

  const handleToggleNotifications = () => {
    const nextState = !notifOpen;
    setNotifOpen(nextState);
    if (dropdownOpen) setDropdownOpen(false);
    if (nextState) {
      fetchNotificationList();
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      if (activeRole === ROLES.ADMIN) {
        await adminApi.markNotificationAsRead(id);
      } else {
        await customerApi.markNotificationAsRead(id);
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true, status: 'READ' } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (activeRole === ROLES.ADMIN) {
        await adminApi.markAllNotificationsAsRead();
      } else {
        await customerApi.markAllNotificationsAsRead();
      }
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true, status: 'READ' }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      clearAuth();
      navigate('/', { replace: true });
    }
  };

  const handleSwitchRole = (role) => {
    if (role === activeRole) return;
    setActiveRole(role);
    setDropdownOpen(false);
    const targetPath = DEFAULT_ROLE_REDIRECTS[role] || '/customer';
    navigate(targetPath);
  };

  const activeRoleConfig = roleLabels[activeRole] || roleLabels[ROLES.CUSTOMER];
  const ActiveIcon = activeRoleConfig.icon;

  const getProfilePath = () => {
    if (activeRole === ROLES.OWNER) return '/owner/profile';
    if (activeRole === ROLES.ADMIN) return '/admin';
    if (activeRole === ROLES.DRIVER) return '/driver/profile';
    return '/customer/profile';
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar (Only when user is authenticated) */}
        {isAuth && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-600/30 transition-all">
            <Car className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-extrabold text-lg text-slate-100 tracking-tight">
            DriveIndia<span className="text-emerald-400">.in</span> 🇮🇳
          </span>
        </Link>

        {/* Public Storefront Navigation Links (visible on desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5 ml-6 text-xs font-bold text-slate-300">
          <Link
            to="/customer/vehicles"
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              location.pathname === '/customer/vehicles' || location.pathname === '/'
                ? 'bg-slate-800 text-emerald-400 font-extrabold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Explore Fleet</span>
          </Link>
          
          <a
            href="#routes"
            onClick={(e) => {
              if (location.pathname !== '/' && location.pathname !== '/customer/vehicles') {
                e.preventDefault();
                navigate('/customer/vehicles#routes');
              }
            }}
            className="px-3 py-1.5 rounded-xl hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Popular Routes</span>
          </a>

          <a
            href="#why-us"
            onClick={(e) => {
              if (location.pathname !== '/' && location.pathname !== '/customer/vehicles') {
                e.preventDefault();
                navigate('/customer/vehicles#why-us');
              }
            }}
            className="px-3 py-1.5 rounded-xl hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Why Choose Us</span>
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 border border-slate-700 transition-all flex items-center justify-center cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 animate-in spin-in-180 duration-200" />
          )}
        </button>

        {/* Notification Bell & Dropdown */}
        {isAuth && (
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              type="button"
              aria-label="View Notifications"
              title="Notifications"
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center justify-center cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-md shadow-rose-500/50 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                      Alerts & Updates
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Read All</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {loadingNotifs ? (
                    <div className="py-8 text-center">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[11px] text-slate-400 mt-2">Checking notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-1">
                      <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs font-semibold text-slate-300">No Notifications</p>
                      <p className="text-[10px] text-slate-500">You're all caught up with alerts!</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !n.isRead && !n.read && n.status !== 'READ';
                      return (
                        <div
                          key={n.id}
                          className={`p-3.5 transition-colors flex items-start gap-3 ${
                            isUnread ? 'bg-indigo-950/20 hover:bg-indigo-950/30' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              isUnread ? 'bg-indigo-400 ring-2 ring-indigo-400/30' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-xs font-bold truncate ${isUnread ? 'text-slate-100' : 'text-slate-300'}`}>
                                {n.title || n.notificationType || 'System Alert'}
                              </h4>
                              {isUnread && (
                                <button
                                  onClick={(e) => handleMarkAsRead(n.id, e)}
                                  className="text-[10px] text-slate-400 hover:text-emerald-400 p-1 rounded transition-colors cursor-pointer shrink-0"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            {n.createdAt && (
                              <p className="text-[9px] text-slate-500 mt-1 font-mono">
                                {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {isAuth ? (
          /* ========================================================= */
          /* AUTHENTICATED USER CONTROLS                               */
          /* ========================================================= */
          <>
            {/* Top Navbar Profile Shortcut Pill */}
            {(activeRole === ROLES.CUSTOMER || activeRole === ROLES.OWNER || activeRole === ROLES.DRIVER) && (
              <Link
                to={getProfilePath()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">My Profile</span>
              </Link>
            )}

            {/* Active Role Indicator */}
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${activeRoleConfig.color}`}>
              <ActiveIcon className="w-3.5 h-3.5" />
              <span>{activeRoleConfig.name}</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-all text-slate-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold leading-none text-slate-200">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{user?.email || 'user@system.com'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-slate-200">{user?.name || 'Signed In'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>

                  {/* Multi-role selection */}
                  {userRoles.length > 1 && (
                    <div className="px-2 py-2 border-b border-slate-800">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-1">
                        Switch Mode
                      </p>
                      {userRoles.map((role) => {
                        const roleInfo = roleLabels[role] || { name: role, icon: UserCheck };
                        const IconComp = roleInfo.icon;
                        const isActive = role === activeRole;
                        return (
                          <button
                            key={role}
                            onClick={() => handleSwitchRole(role)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <IconComp className="w-3.5 h-3.5" />
                              <span>{roleInfo.name}</span>
                            </div>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Direct Profile Links based on Role */}
                  <div className="px-2 py-1 border-b border-slate-800 space-y-0.5">
                    {activeRole === ROLES.CUSTOMER && (
                      <>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/customer/bookings');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
                        >
                          <Car className="w-3.5 h-3.5 text-indigo-400" />
                          <span>My Bookings & Trips</span>
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/customer/profile');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-emerald-400 hover:bg-emerald-500/10 font-bold transition-colors cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>My Customer Profile</span>
                        </button>
                      </>
                    )}

                    {activeRole === ROLES.OWNER && (
                      <>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/owner/profile');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-blue-400 hover:bg-blue-500/10 font-bold transition-colors cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Owner Profile & Driving</span>
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/owner/drivers');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-purple-400 hover:bg-purple-500/10 font-bold transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>My Registered Drivers</span>
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/owner/subscription');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-emerald-400 hover:bg-emerald-500/10 font-bold transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Owner Subscription Hub</span>
                        </button>
                      </>
                    )}

                    {activeRole === ROLES.DRIVER && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/driver/profile');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-purple-400 hover:bg-purple-500/10 font-bold transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>My Driver Profile & Status</span>
                      </button>
                    )}

                    {activeRole === ROLES.ADMIN && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/admin/plans');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 font-bold transition-colors cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Subscription Plans & Vehicles</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ========================================================= */
          /* GUEST VISITOR CONTROLS                                    */
          /* ========================================================= */
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In</span>
            </Link>

            <Link
              to="/login?action=signup"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

