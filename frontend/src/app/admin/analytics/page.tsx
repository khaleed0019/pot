'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, BarChart3, Eye, Users } from 'lucide-react';
import RequireRole from '@/components/RequireRole';

type AgentRow = {
  agentId: string;
  user: { name?: string; email: string };
  totalListings: number;
  published: number;
  pending: number;
  rejected: number;
  approvalRate: number;
  rejectionRate: number;
  totalViews: number;
  totalLeads: number;
  topPropertyType: string | null;
};

function AdminAnalytics() {
  const [data, setData] = useState<{
    summary: Record<string, unknown>;
    agents: AgentRow[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/analytics/agents')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-primary font-bold mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>
        <h1 className="text-4xl font-extrabold text-secondary mb-2">Agent Analytics</h1>
        <p className="text-gray-500 mb-10">Performance across all agents</p>

        {loading ? (
          <p>Loading analytics...</p>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: 'Agents', value: data.summary.totalAgents, icon: Users },
                { label: 'Listings', value: data.summary.totalListings, icon: BarChart3 },
                { label: 'Published', value: data.summary.totalPublished, icon: BarChart3 },
                { label: 'Total views', value: data.summary.totalViews, icon: Eye },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <Icon className="h-6 w-6 text-primary mb-2" />
                  <p className="text-2xl font-extrabold text-secondary">{String(value)}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-4">Agent</th>
                    <th className="p-4">Listings</th>
                    <th className="p-4">Published</th>
                    <th className="p-4">Approval %</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Leads</th>
                    <th className="p-4">Top type</th>
                  </tr>
                </thead>
                <tbody>
                  {data.agents.map((a) => (
                    <tr key={a.agentId} className="border-t border-gray-50">
                      <td className="p-4 font-bold text-secondary">{a.user.name || a.user.email}</td>
                      <td className="p-4">{a.totalListings}</td>
                      <td className="p-4">{a.published}</td>
                      <td className="p-4">{a.approvalRate}%</td>
                      <td className="p-4">{a.totalViews}</td>
                      <td className="p-4">{a.totalLeads}</td>
                      <td className="p-4">{a.topPropertyType || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-red-500">Failed to load analytics</p>
        )}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <RequireRole roles={['ADMIN']}>
      <AdminAnalytics />
    </RequireRole>
  );
}
