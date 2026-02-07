import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { RefreshCw, Eye, Trash2, Loader2, Download, Search } from 'lucide-react';
import { get, patch, post, del } from '@/services/api';
import { Button } from '@/components/ui';
import type { ContactSubmission, PaginationMeta } from '@/types';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  synced: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  closed: 'bg-slate-700 text-slate-400',
};

export function AdminContacts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ['admin', 'contacts', { search, status: statusFilter, page }],
    queryFn: () => get<ContactSubmission[]>('/admin/contact-submissions', {
      search: search || undefined,
      status: statusFilter || undefined,
      page,
    }),
  });

  const resyncMutation = useMutation({
    mutationFn: (id: number) => post<void>(`/admin/contact-submissions/${id}/resync`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      toast.success('Resync queued');
    },
    onError: () => {
      toast.error('Failed to queue resync');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      patch<ContactSubmission>(`/admin/contact-submissions/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/admin/contact-submissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      toast.success('Contact deleted');
    },
    onError: () => {
      toast.error('Failed to delete contact');
    },
  });

  const contacts = contactsData?.data || [];
  const pagination = contactsData?.meta?.pagination as PaginationMeta | undefined;

  const handleDelete = (contact: ContactSubmission) => {
    if (confirm(`Delete submission from "${contact.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(contact.id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-h2 text-white">Contact Submissions</h1>
        <Button variant="secondary" onClick={() => toast('Export feature would be implemented here')}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

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
              placeholder="Search by name or email..."
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
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="synced">Synced</option>
            <option value="failed">Failed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">No contact submissions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Interest</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{contact.name}</p>
                          <p className="text-sm text-slate-400">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-sm text-slate-500">{contact.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {contact.pillar?.name || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={contact.status}
                          onChange={(e) => updateStatusMutation.mutate({
                            id: contact.id,
                            status: e.target.value,
                          })}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
                            statusColors[contact.status] || statusColors.new
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="synced">Synced</option>
                          <option value="failed">Failed</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toast('Contact details modal would open here')}
                            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => resyncMutation.mutate(contact.id)}
                            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                            title="Resync to CRM"
                            disabled={resyncMutation.isPending}
                          >
                            <RefreshCw className={`h-4 w-4 ${resyncMutation.isPending ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDelete(contact)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
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
