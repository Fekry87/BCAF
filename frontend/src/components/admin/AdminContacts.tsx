import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { RefreshCw, Eye, Trash2, Loader2, Download, Search, X, Mail, Phone, Calendar, Tag, MessageSquare, CheckSquare, MinusSquare, Square } from 'lucide-react';
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

// Contact Details Modal Component
function ContactDetailsModal({
  contact,
  onClose,
  onStatusChange,
}: {
  contact: ContactSubmission;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Contact Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-semibold text-lg">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{contact.name}</p>
                  <p className="text-sm text-slate-400">Contact</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-300 mb-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${contact.email}`} className="hover:text-blue-400 transition-colors">
                  {contact.email}
                </a>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${contact.phone}`} className="hover:text-blue-400 transition-colors">
                    {contact.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Status & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Status</span>
              </div>
              <select
                value={contact.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className={`text-sm px-3 py-2 rounded-lg font-medium border-0 cursor-pointer w-full ${
                  statusColors[contact.status] || statusColors.new
                }`}
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="synced">Synced</option>
                <option value="failed">Failed</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Submitted</span>
              </div>
              <p className="text-white">
                {new Date(contact.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Interest/Pillar */}
          {contact.pillar && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Area of Interest</span>
              </div>
              <p className="text-white">{contact.pillar.name}</p>
            </div>
          )}

          {/* Message */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Message</span>
            </div>
            <p className="text-white whitespace-pre-wrap leading-relaxed">
              {contact.message}
            </p>
          </div>

          {/* Sync Info */}
          {contact.synced_at && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-400">
                Synced to CRM on {new Date(contact.synced_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {contact.suitedash_external_id && (
                <p className="text-xs text-green-500/70 mt-1">
                  External ID: {contact.suitedash_external_id}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.location.href = `mailto:${contact.email}`}>
            <Mail className="h-4 w-4 mr-2" />
            Reply via Email
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminContacts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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
      void queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
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
      void queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/admin/contact-submissions/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      toast.success('Contact deleted');
    },
    onError: () => {
      toast.error('Failed to delete contact');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => post<void>('/admin/contact-submissions/bulk-delete', { ids }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      toast.success(`${selectedIds.size} contact(s) deleted`);
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error('Failed to delete contacts');
    },
  });

  const contacts = contactsData?.data || [];
  const pagination = contactsData?.meta?.pagination as PaginationMeta | undefined;

  // Selection handlers
  const isAllSelected = contacts.length > 0 && selectedIds.size === contacts.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < contacts.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id)));
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

  const handleDelete = (contact: ContactSubmission) => {
    if (confirm(`Delete submission from "${contact.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(contact.id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} selected contact(s)? This action cannot be undone.`)) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-h2 text-white">Contact Submissions</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="secondary"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
            >
              {bulkDeleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button variant="secondary" onClick={() => {
            if (contacts.length === 0) {
              toast.error('No contacts to export');
              return;
            }
            // Generate CSV content
            const headers = ['Name', 'Email', 'Phone', 'Interest', 'Message', 'Status', 'Date & Time'];
            const rows = contacts.map(contact => [
              contact.name,
              contact.email,
              contact.phone || '',
              contact.pillar?.name || 'General',
              `"${contact.message.replace(/"/g, '""')}"`, // Escape quotes in message
              contact.status,
              new Date(contact.created_at).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            ]);
            const csvContent = [
              headers.join(','),
              ...rows.map(row => row.join(','))
            ].join('\n');

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `contacts-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('CSV exported successfully');
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
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
            <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No contact submissions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={handleToggleSelectAll}
                        className="text-slate-400 hover:text-white transition-colors"
                        title={isAllSelected ? 'Deselect all' : 'Select all'}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="h-5 w-5 text-blue-400" />
                        ) : isSomeSelected ? (
                          <MinusSquare className="h-5 w-5 text-blue-400" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Interest</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className={`hover:bg-slate-700/50 ${selectedIds.has(contact.id) ? 'bg-blue-500/10' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleSelect(contact.id)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {selectedIds.has(contact.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-400" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </td>
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
                        <div>
                          <p className="text-sm text-slate-300">
                            {new Date(contact.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(contact.created_at).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedContact(contact)}
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

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onStatusChange={(status) => {
            updateStatusMutation.mutate({
              id: selectedContact.id,
              status,
            });
            setSelectedContact({ ...selectedContact, status: status as ContactSubmission['status'] });
          }}
        />
      )}
    </div>
  );
}
