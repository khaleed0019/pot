'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ban, RefreshCcw, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import RequireRole from '@/components/RequireRole';
import { useAuth, type AppUser } from '@/contexts/AuthContext';

type Row = {
  id: string;
  email: string;
  name: string | null;
  role: AppUser['role'];
  suspended: boolean;
  createdAt: string;
};

const ROLES: AppUser['role'][] = ['USER', 'AGENT', 'ADMIN'];

const ROLE_STYLES: Record<AppUser['role'], string> = {
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  AGENT: 'bg-blue-50 text-blue-700 border-blue-200',
  USER: 'bg-gray-100 text-gray-600 border-gray-200',
};

function UsersAdmin() {
  const { appUser } = useAuth();
  const [users, setUsers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await apiFetch('/admin/users'));
    } catch (e: unknown) {
      console.error('Failed to load users', e);
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (user: Row, role: AppUser['role']) => {
    if (role === user.role) return;
    setSavingId(user.id);
    setNotice(null);
    setError(null);
    try {
      const updated = await apiFetch(`/admin/users/${user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)));
      setNotice(`${updated.email} is now ${updated.role}.`);
    } catch (e: unknown) {
      // The server blocks self-demotion and removing the last admin.
      setError(e instanceof Error ? e.message : 'Could not update role.');
    } finally {
      setSavingId(null);
    }
  };

  const toggleSuspend = async (user: Row) => {
    const next = !user.suspended;
    if (
      next &&
      !window.confirm(`Suspend ${user.name || user.email}? They won't be able to sign in until unsuspended.`)
    ) {
      return;
    }
    setSavingId(user.id);
    setNotice(null);
    setError(null);
    try {
      const updated = await apiFetch(`/admin/users/${user.id}/suspend`, {
        method: 'PATCH',
        body: JSON.stringify({ suspended: next }),
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, suspended: updated.suspended } : u)));
      setNotice(`${updated.email} is now ${updated.suspended ? 'suspended' : 'active'}.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not update suspension.');
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (user: Row) => {
    // Permanent, and the server refuses if the account still owns listings/deals —
    // confirm up front since a successful delete can't be undone from here.
    if (!window.confirm(`Permanently delete ${user.name || user.email}? This cannot be undone.`)) {
      return;
    }
    setSavingId(user.id);
    setNotice(null);
    setError(null);
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setNotice(`${user.email} was deleted.`);
    } catch (e: unknown) {
      // Surfaces the server's "still has N listings" message when it applies.
      setError(e instanceof Error ? e.message : 'Could not delete user.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-primary font-bold mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-secondary">Users &amp; Roles</h1>
            <p className="text-gray-500 mt-2">
              Promoting someone to Agent also creates their agent profile so they can list.
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl font-bold hover:bg-gray-50 self-start"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}
        {notice && <p className="text-green-600 font-semibold mb-4">{notice}</p>}

        {loading ? (
          <p className="text-gray-500 font-bold">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500 font-bold">No users yet.</p>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {users.map((u) => {
              const isSelf = u.id === appUser?.id;
              return (
                <div
                  key={u.id}
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-extrabold text-secondary truncate">{u.name || u.email}</p>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${ROLE_STYLES[u.role]}`}
                      >
                        {u.role}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-gray-900 text-white">
                          You
                        </span>
                      )}
                      {u.suspended && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200">
                          Suspended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{u.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelf ? (
                      <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <ShieldCheck className="h-4 w-4" /> Your own access is protected
                      </span>
                    ) : (
                      <>
                        <UserCog className="h-4 w-4 text-gray-400" />
                        <select
                          value={u.role}
                          disabled={savingId === u.id}
                          onChange={(e) => changeRole(u, e.target.value as AppUser['role'])}
                          className="bg-gray-50 rounded-2xl px-4 py-2 font-bold text-secondary border-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => toggleSuspend(u)}
                          disabled={savingId === u.id}
                          className={`flex items-center gap-1 px-4 py-2 rounded-2xl text-sm font-bold border disabled:opacity-50 ${
                            u.suspended
                              ? 'bg-green-50 border-green-100 text-green-700 hover:bg-green-100'
                              : 'bg-white border-amber-100 text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          <Ban className="h-4 w-4" /> {u.suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => remove(u)}
                          disabled={savingId === u.id}
                          className="flex items-center gap-1 bg-white border border-red-100 text-red-600 px-4 py-2 rounded-2xl text-sm font-bold hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireRole roles={['ADMIN']}>
      <UsersAdmin />
    </RequireRole>
  );
}
