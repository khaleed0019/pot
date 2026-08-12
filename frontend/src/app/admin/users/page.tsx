'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw, ShieldCheck, UserCog } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import RequireRole from '@/components/RequireRole';
import { useAuth, type AppUser } from '@/contexts/AuthContext';

type Row = {
  id: string;
  email: string;
  name: string | null;
  role: AppUser['role'];
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
