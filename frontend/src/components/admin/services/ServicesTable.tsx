import { Loader2, Eye, EyeOff, Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Service } from './types';

interface ServicesTableProps {
  services: Service[];
  isLoading: boolean;
  onToggleActive: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onAddNew: () => void;
}

export function ServicesTable({
  services,
  isLoading,
  onToggleActive,
  onEdit,
  onDelete,
  onAddNew,
}: ServicesTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-400">No services found</p>
        <Button onClick={onAddNew} variant="secondary" className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Add your first service
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-900/50 border-b border-slate-700">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Title
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Pillar
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Type
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Status
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {services.map((service) => (
            <tr key={service.id} className="hover:bg-slate-700/50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-white">{service.title}</p>
                  <p className="text-sm text-slate-400 truncate max-w-xs">
                    {service.summary}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-300">
                  {service.pillar?.name || '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    service.type === 'one_off'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {service.type === 'one_off' ? 'One-off' : 'Subscription'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    service.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggleActive(service)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title={service.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {service.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(service)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(service)}
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
  );
}
