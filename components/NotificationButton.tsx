'use client';

import { useState, useEffect } from 'react';

export default function NotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setTimeout(() => {
        setPermission(Notification.permission);
      }, 0);
    }
  }, []);

  const requestNotification = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === 'granted') {
      new Notification('CineMay', {
        body: 'Notifications enabled! You will be notified about the latest movies and episodes.',
        icon: '/favicon.ico',
      });
    }
  };

  if (permission === 'granted') return null;

  return (
    <button
      onClick={requestNotification}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a24] border border-white/10 hover:border-[#e63946] text-gray-200 transition-colors"
      title="Enable Notifications"
    >
      <svg
        className="w-3.5 h-3.5 text-[#e63946]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <span>Enable Notifications</span>
    </button>
  );
}