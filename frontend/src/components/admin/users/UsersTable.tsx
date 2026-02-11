import {
  Loader2,
  UserX,
  Mail,
  Phone,
  Building,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  CloudOff,
  Square,
  CheckSquare,
  MinusSquare,
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { User, PaginationMeta } from './types';
import { statusColors } from './types';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  pagination?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (user: User) => void;
  onSyncUser: (id: number) => void;
  isSyncing: boolean;
  // Selection props
  selectedIds: Set<number>;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: number) => void;
}

export function UsersTable({
  users,
  isLoading,
  pagination,
  page,
  onPageChange,
  onStatusChange,
  onDelete,
  onSyncUser,
  isSyncing,
  selectedIds,
  isAllSelected,
  isSomeSelected,
  onToggleSelectAll,
  onToggleSelect,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center">
        <UserX className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No users found</p>
        <p className="text-sm text-slate-500 mt-1">
          Users will appear here when they register on the website
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 w-12">
                <button
                  onClick={onToggleSelectAll}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title={isAllSelected ? "Deselect all" : "Select all"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-5 w-5 text-blue-400" />
                  ) : isSomeSelected ? (
                    <MinusSquare className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                User
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Orders
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                SuiteDash
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Joined
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className={`hover:bg-slate-700/50 ${selectedIds.has(user.id) ? 'bg-blue-900/20' : ''}`}
              >
                <td className="px-4 py-4">
                  <button
                    onClick={() => onToggleSelect(user.id)}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                  >
                    {selectedIds.has(user.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </td>
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
                    onChange={(e) => onStatusChange(user.id, e.target.value)}
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
                      <span
                        className="flex items-center gap-1 text-xs text-green-400"
                        title={`Synced at ${
                          user.suitedash_synced_at
                            ? new Date(user.suitedash_synced_at).toLocaleString()
                            : 'N/A'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Synced
                      </span>
                    ) : user.suitedash_sync_error ? (
                      <span
                        className="flex items-center gap-1 text-xs text-red-400"
                        title={user.suitedash_sync_error}
                      >
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
                      onClick={() => onSyncUser(user.id)}
                      disabled={isSyncing}
                      className="p-1 text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50"
                      title="Sync to SuiteDash"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                      />
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
                      onClick={() => onDelete(user)}
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
            Page {pagination.current_page} of {pagination.last_page} (
            {pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={pagination.current_page === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(Math.min(pagination.last_page, page + 1))}
              disabled={pagination.current_page === pagination.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
