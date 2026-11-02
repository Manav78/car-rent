import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  CheckCheck, 
  XCircle, 
  Ban,
  Wrench,
  AlertTriangle,
  Car
} from 'lucide-react';
import { STATUS } from '../../utils/constants';

const statusConfigs = {
  // Booking Statuses
  [STATUS.PENDING]: {
    label: 'Pending Review',
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    icon: Clock,
  },
  [STATUS.ACCEPTED]: {
    label: 'Accepted',
    bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    icon: CheckCircle2,
  },
  [STATUS.CONFIRMED]: {
    label: 'Confirmed',
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: CheckCircle2,
  },
  [STATUS.IN_PROGRESS]: {
    label: 'Trip Started',
    bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    icon: PlayCircle,
  },
  TRIP_STARTED: {
    label: 'Trip Started',
    bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    icon: PlayCircle,
  },
  [STATUS.COMPLETED]: {
    label: 'Completed',
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: CheckCheck,
  },
  TRIP_COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: CheckCheck,
  },
  [STATUS.CANCELLED]: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    icon: XCircle,
  },
  [STATUS.REJECTED]: {
    label: 'Rejected',
    bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    icon: Ban,
  },

  // Verification & Approval Statuses
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: CheckCircle2,
  },

  // Vehicle & Driver Operational States
  ACTIVE: {
    label: 'Active / Available',
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: CheckCircle2,
  },
  AVAILABLE: {
    label: 'Available',
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: CheckCircle2,
  },
  BUSY: {
    label: 'Busy / On Trip',
    bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 font-bold',
    icon: Car,
  },
  BOOKED: {
    label: 'Booked',
    bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    icon: Car,
  },
  MAINTENANCE: {
    label: 'Maintenance',
    bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold',
    icon: Wrench,
  },
  INACTIVE: {
    label: 'Inactive',
    bg: 'bg-slate-700/50 border-slate-600 text-slate-400',
    icon: AlertTriangle,
  },
};

const StatusBadge = ({ status, className = '' }) => {
  const config = statusConfigs[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-700/50 border-slate-600 text-slate-300',
    icon: Clock,
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${config.bg} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
