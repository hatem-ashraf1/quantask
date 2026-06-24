import { useState } from 'react';
import {
  Search, Bell, ChevronDown, CheckCircle2, Clock, AlertTriangle, X,
  User, LogOut, Settings, Shield
} from 'lucide-react';
import { NOTIFICATIONS, CURRENT_USER, Notification } from '../data/store';
import { useAuthorization } from '../authorization/AuthorizationContext';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onAuthClick?: () => void;
  onNavigate?: (view: 'settings' | 'members' | 'profile') => void;
}

const NOTIF_ICONS: Record<Notification['type'], React.ReactNode> = {
  deadline: <Clock size={14} className="text-orange-400" />,
  assigned: <CheckCircle2 size={14} className="text-indigo-400" />,
  review: <Shield size={14} className="text-emerald-400" />,
  mention: <User size={14} className="text-sky-400" />,
  blocked: <AlertTriangle size={14} className="text-red-400" />,
};

function formatRelative(timestamp: string) {
  const d = new Date(timestamp);
  const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function TopBar({ title, subtitle, onAuthClick, onNavigate }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [searchFocused, setSearchFocused] = useState(false);
  const { activeProjectId, rolesFor } = useAuthorization();
  const scopedRoles = rolesFor('project', activeProjectId);
  const displayedRole = scopedRoles.includes('workspace-owner')
    ? 'owner'
    : scopedRoles.includes('project-manager')
      ? 'project manager'
      : scopedRoles.includes('developer')
        ? 'developer'
        : scopedRoles.includes('viewer')
          ? 'viewer'
          : 'workspace member';

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <header
      className="h-12 flex items-center px-4 gap-4 border-b flex-shrink-0 relative z-30"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        fontFamily: 'var(--font-family-body)',
      }}
    >
      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm text-[var(--foreground)] leading-tight">{title}</h1>
          {subtitle && (
            <>
              <span className="text-[var(--border)] text-xs">/</span>
              <span className="text-xs text-[var(--muted-foreground)]">{subtitle}</span>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className={`relative flex items-center transition-all ${searchFocused ? 'w-64' : 'w-52'}`}>
        <Search
          size={13}
          className="absolute left-2.5 text-[var(--muted-foreground)] pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search tasks, members…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-7 pr-3 py-1.5 rounded-md text-xs outline-none transition-all"
          style={{
            background: 'var(--input-background)',
            border: searchFocused ? '1px solid var(--primary)' : '1px solid transparent',
            color: 'var(--foreground)',
          }}
        />
        <kbd
          className="absolute right-2 text-[10px] text-[var(--muted-foreground)] hidden sm:block"
          style={{ fontFamily: 'var(--font-family-mono)' }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          className="relative p-1.5 rounded-md hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <Bell size={16} />
          {unread > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center"
              style={{ background: 'var(--primary)' }}
            >
              {unread}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl border z-50 overflow-hidden"
              style={{ background: 'var(--popover)', borderColor: 'var(--border)' }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="text-sm text-[var(--foreground)]">Notifications</span>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[var(--primary)] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="p-0.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: 'var(--muted)' }}
                    >
                      <Bell size={18} className="text-[var(--muted-foreground)]" />
                    </div>
                    <p className="text-xs text-[var(--foreground)]">No notifications</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      New assignments and updates will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b cursor-pointer transition-colors hover:bg-[var(--muted)] ${
                        !n.read ? 'bg-[var(--accent)]' : ''
                      }`}
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="mt-0.5 flex-shrink-0">{NOTIF_ICONS[n.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--foreground)] leading-relaxed">{n.message}</p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-family-mono)' }}
                        >
                          {formatRelative(n.timestamp)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--primary)' }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--muted)] transition-colors"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
          >
            {CURRENT_USER.avatar}
          </div>
          <ChevronDown size={12} className="text-[var(--muted-foreground)]" />
        </button>

        {profileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl border z-50 overflow-hidden py-1"
              style={{ background: 'var(--popover)', borderColor: 'var(--border)' }}
            >
              <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs text-[var(--foreground)]">{CURRENT_USER.name}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{CURRENT_USER.email}</p>
                <span
                  className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] text-white"
                  style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
                >
                  {displayedRole}
                </span>
              </div>
              {[
                { icon: <User size={13} />, label: 'Profile', view: 'profile' as const },
                { icon: <Settings size={13} />, label: 'Preferences', view: 'profile' as const },
                { icon: <Shield size={13} />, label: 'Security', view: 'settings' as const },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate?.(label === 'Security' ? 'settings' : 'profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <span className="text-[var(--muted-foreground)]">{icon}</span>
                  {label}
                </button>
              ))}
              <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
              <button
                onClick={onAuthClick}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
