import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2, Search, Cloud, Trash2 } from 'lucide-react';
import { get, patch, del, post } from '@/services/api';
import { Button } from '@/components/ui';
import type { User, UserStats, PaginationMeta } from './types';
import { UserStatsCards } from './UserStatsCards';
import { UsersTable } from './UsersTable';

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, status: statusFilter, page }],
    queryFn: () =>
      get<User[]>('/admin/users', {
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
    mutationFn: (id: number) =>
      post<{ synced: boolean }>(`/admin/users/${id}/sync-suitedash`),
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
    mutationFn: () =>
      post<{ synced: number; failed: number; total: number }>(
        '/admin/users/sync-all-suitedash'
      ),
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

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => post<void>('/admin/users/bulk-delete', { ids }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(`${selectedIds.size} user(s) deleted`);
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error('Failed to delete users');
    },
  });

  const users = usersData?.data || [];
  const stats = statsData?.data;
  const pagination = usersData?.meta?.pagination as PaginationMeta | undefined;

  const handleDelete = (user: User) => {
    if (
      confirm(
        `Delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(user.id);
    }
  };

  // Selection handlers
  const isAllSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const isSomeSelected = users.some((u) => selectedIds.has(u.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Delete ${selectedIds.size} user(s)? This action cannot be undone.`
      )
    ) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-h2 text-white">Registered Users</h1>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="text-red-400 hover:text-red-300"
            >
              {bulkDeleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete ({selectedIds.size})
            </Button>
          )}
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
      </div>

      {/* Stats Cards */}
      {stats && <UserStatsCards stats={stats} />}

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
        <UsersTable
          users={users}
          isLoading={isLoading}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          onStatusChange={(id, status) =>
            updateStatusMutation.mutate({ id, status })
          }
          onDelete={handleDelete}
          onSyncUser={(id) => syncToSuiteDashMutation.mutate(id)}
          isSyncing={syncToSuiteDashMutation.isPending}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelect={handleToggleSelect}
        />
      </div>
    </div>
  );
}
