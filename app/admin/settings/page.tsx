'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [searchUser, setSearchUser] = useState<string>('');
  
  // Platform Controls State
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch Platform Settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok && data) {
        setMaintenanceMode(data.maintenanceMode ?? false);
      }
    } catch (err) {
      console.error('Failed to fetch platform settings:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, [fetchUsers, fetchSettings]);

  // Update user role or status
  const handleUpdateUser = async (userId: string, updates: { role?: string; isBanned?: boolean }) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
        );
      }
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  // Save platform settings to API
  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          maintenanceMode 
        }),
      });

      if (res.ok) {
        setSaveStatus('Settings updated successfully!');
      } else {
        setSaveStatus('Failed to update settings.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('Error saving settings.');
    }
    
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchUser.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure maintenance toggles and manage system users. (Stream servers are now managed in Global Gateways).
        </p>
      </div>

      {/* 1. Global Platform Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
          Platform Configuration
        </h2>

        <form onSubmit={handleSavePlatformSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl w-full">
              <div>
                <div className="text-xs font-semibold text-white">Maintenance Mode</div>
                <div className="text-[11px] text-slate-400">Lock the frontend and show maintenance screen</div>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                  maintenanceMode ? 'bg-red-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tracking-wider transition shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              Save Platform Settings
            </button>
            {saveStatus && <span className={`text-xs font-medium ${saveStatus.includes('Error') || saveStatus.includes('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>{saveStatus}</span>}
          </div>
        </form>
      </div>

      {/* 2. User Management Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              User Management ({users.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Control user roles and access status</p>
          </div>

          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full md:w-80 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loadingUsers ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading users list...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.name || 'Anonymous User'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                        className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isBanned
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {u.isBanned ? 'BANNED' : 'ACTIVE'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleUpdateUser(u.id, { isBanned: !u.isBanned })}
                        className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                          u.isBanned
                            ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800'
                            : 'bg-red-950 text-red-400 hover:bg-red-900 border border-red-800'
                        }`}
                      >
                        {u.isBanned ? 'Unban Account' : 'Ban User'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}