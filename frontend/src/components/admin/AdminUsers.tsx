import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Loader2, Search, Users, UserCheck, UserX, Mail, Phone, Building, RefreshCw, CheckCircle, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { get, patch, del, post } from '@/services/api';
import { Button } from '@/components/ui';
import type { PaginationMeta } from '@/types';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
  // SuiteDash sync fields
  suitedash_synced?: boolean;
  suitedash_contact_id?: string;
  suitedash_sync_error?: string;
  suitedash_synced_at?: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  this_week: number;
  this_month: number;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-slate-700 text-slate-400',
};

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, status: statusFilter, page }],
    queryFn: () => get<User[]>('/admin/users', {
      search: search || undefined,
      status: statusFilter || undefined,
      page,
    }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: () => get<UserStats>('/admin/users/stats'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      patch<User>(`/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated');
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const syncToSuiteDashMutation = useMutation({
    mutationFn: (id: number) => post<{ synced: boolean }>(`/admin/users/${id}/sync-suitedash`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      if (data.success) {
        toast.success('User synced to SuiteDash');
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to sync: ${err.message}`);
    },
  });

  const syncAllToSuiteDashMutation = useMutation({
    mutationFn: () => post<{ synced: number; failed: number; total: number }>('/admin/users/sync-all-suitedash'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      if (data.success && data.data) {
        toast.success(`Synced ${data.data.synced} of ${data.data.total} users`);
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to sync: ${err.message}`);
    },
  });

  const users = usersData?.data || [];
  const stats = statsData?.data;
  const pagination = usersData?.meta?.pagination as PaginationMeta | undefined;

  const handleDelete = (user: User) => {
    if (confirm(`Delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-h2 text-white">Registered Users</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => syncAllToSuiteDashMutation.mutate()}
          disabled={syncAllToSuiteDashMutation.isPending}
        >
          {syncAllToSuiteDashMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Cloud className="h-4 w-4 mr-2" />
          )}
          Sync All to SuiteDash
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-slate-400">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-sm text-slate-400">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.this_week}</p>
                <p className="text-sm text-slate-400">This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.this_month}</p>
                <p className="text-sm text-slate-400">This Month</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or company..."
              className="w-full h-10 pl-10 pr-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-4 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UserX className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No users found</p>
            <p className="text-sm text-slate-500 mt-1">Users will appear here when they register on the website</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Orders</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">SuiteDash</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Joined</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.company && (
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {user.company}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-300 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-500" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-500" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-blue-400">
                          {user.orderCount} order{user.orderCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.status}
                          onChange={(e) => updateStatusMutation.mutate({
                            id: user.id,
                            status: e.target.value,
                          })}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
                            statusColors[user.status] || statusColors.active
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.suitedash_synced ? (
                            <span className="flex items-center gap-1 text-xs text-green-400" title={`Synced at ${user.suitedash_synced_at ? new Date(user.suitedash_synced_at).toLocaleString() : 'N/A'}`}>
                              <CheckCircle className="h-4 w-4" />
                              Synced
                            </span>
                          ) : user.suitedash_sync_error ? (
                            <span className="flex items-center gap-1 text-xs text-red-400" title={user.suitedash_sync_error}>
                              <AlertCircle className="h-4 w-4" />
                              Error
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <CloudOff className="h-4 w-4" />
                              Not synced
                            </span>
                          )}
                          <button
                            onClick={() => syncToSuiteDashMutation.mutate(user.id)}
                            disabled={syncToSuiteDashMutation.isPending}
                            className="p-1 text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50"
                            title="Sync to SuiteDash"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${syncToSuiteDashMutation.isPending ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="border-t border-slate-700 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.current_page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                    disabled={pagination.current_page === pagination.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
