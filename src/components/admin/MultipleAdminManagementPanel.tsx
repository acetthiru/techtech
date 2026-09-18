import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2, Edit3, Key, Check, AlertCircle, RefreshCw, Lock, Users } from 'lucide-react';
import { AdminRole } from '../../types';

interface MultipleAdminManagementPanelProps {
  adminToken: string | null;
  currentUsername: string;
}

interface AccountItem {
  username: string;
  role: AdminRole;
  name: string;
  disabled: boolean;
  createdAt: number;
  lastLogin?: number;
}

export const MultipleAdminManagementPanel: React.FC<MultipleAdminManagementPanelProps> = ({
  adminToken,
  currentUsername,
}) => {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('MODERATOR');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/accounts', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAccounts();
    }
  }, [adminToken]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowCreateModal(false);
        setNewUsername('');
        setNewPassword('');
        setNewName('');
        fetchAccounts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create account' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleToggleDisable = async (username: string, currentDisabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/accounts/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ disabled: !currentDisabled }),
      });
      if (res.ok) fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (username: string) => {
    if (!confirm(`Are you sure you want to permanently delete administrator account '${username}'?`)) return;

    try {
      const res = await fetch(`/api/admin/accounts/${username}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchAccounts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">SUPER ADMIN</span>;
      case 'ADMIN':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">ADMIN</span>;
      case 'MODERATOR':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">MODERATOR</span>;
      case 'REPORT_MANAGER':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">REPORT MANAGER</span>;
      case 'DISPLAY_ONLY':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">DISPLAY ONLY</span>;
      default:
        return <span className="bg-[#F1F5F9] text-[#172033] border border-[#DCE6F0] px-2 py-0.5 rounded-lg text-[10px]">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0891B2]" />
            Multiple Administrator & Role Accounts (Super Admin)
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Delegate competition roles to faculty moderators, report managers, and auditorium display operators
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add Admin Account
          </button>
          <button
            onClick={fetchAccounts}
            className="p-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] rounded-xl border border-[#DCE6F0] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {message.text}
        </div>
      )}

      {/* Accounts List */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-[#F8FAFC] px-5 py-3.5 border-b border-[#DCE6F0] flex items-center justify-between">
          <span className="font-bold text-sm text-[#172033] flex items-center gap-2">
            Configured System Administrators ({accounts.length})
          </span>
          <span className="text-xs text-[#64748B]">Strict RBAC Enforced</span>
        </div>

        <div className="divide-y divide-[#DCE6F0]">
          {accounts.map((acc) => {
            const isSelf = acc.username.toUpperCase() === currentUsername.toUpperCase();

            return (
              <div key={acc.username} className="p-4 hover:bg-[#F8FAFC] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#172033] font-mono">{acc.username}</span>
                    {getRoleBadge(acc.role)}
                    {isSelf && (
                      <span className="bg-cyan-50 border border-[#06B6D4]/40 text-[#0891B2] px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                        You (Active Session)
                      </span>
                    )}
                    {acc.disabled && (
                      <span className="bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {acc.name} • Created {new Date(acc.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isSelf && (
                    <>
                      <button
                        onClick={() => handleToggleDisable(acc.username, acc.disabled)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
                          acc.disabled
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-[#F1F5F9] border-[#DCE6F0] text-[#172033] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        {acc.disabled ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onClick={() => handleDelete(acc.username)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white border border-[#DCE6F0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#0891B2]" />
              Create New Administrator Account
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#172033] font-medium block mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MOD_AUDITORIUM"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toUpperCase())}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] font-mono uppercase focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              <div>
                <label className="text-[#172033] font-medium block mb-1">Full Name / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Kumar (Stage Coordinator)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              <div>
                <label className="text-[#172033] font-medium block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              <div>
                <label className="text-[#172033] font-medium block mb-1">Role & Permission Tier</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                >
                  <option value="MODERATOR">Moderator (Live control & monitoring)</option>
                  <option value="REPORT_MANAGER">Report Manager (Reports & exports)</option>
                  <option value="ADMIN">Admin (Questions, scores, teams)</option>
                  <option value="DISPLAY_ONLY">Display Only (Projector/auditorium)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full system control)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#DCE6F0]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F1F5F9] text-[#172033] hover:bg-[#E2E8F0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white hover:from-[#0891B2] hover:to-[#1D4ED8] shadow-md cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
