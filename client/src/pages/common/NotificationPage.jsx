import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Check,
  Inbox,
  Clock,
  Sparkles
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const NotificationPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications(1, unreadOnly);
  }, [fetchNotifications, unreadOnly]);

  if (loading && notifications.length === 0) {
    return <LoadingSpinner fullPage text="Scanning notification inbox..." />;
  }

  const filtered = unreadOnly ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Activity Center</p>
          <h1 className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
            Notifications <Bell className="h-6 w-6 text-indigo-600" />
          </h1>
          <p className="text-sm text-slate-500">
            Real-time updates on applications, interview schedules, and platform approvals.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4 text-indigo-600" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setUnreadOnly(false)}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            !unreadOnly
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setUnreadOnly(true)}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            unreadOnly
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications to show"
          description={unreadOnly ? 'You have read all your notifications.' : 'Activity and updates will appear here.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item._id}
              className={`glass-card rounded-2xl p-5 border transition-all flex items-start justify-between gap-4 ${
                item.isRead
                  ? 'bg-white border-slate-200 opacity-80'
                  : 'bg-indigo-50/40 border-indigo-200 shadow-xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!item.isRead && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" />
                  )}
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead(item._id)}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    title="Mark read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotification(item._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
