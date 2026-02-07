import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Clock, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { get } from '@/services/api';

interface DashboardStats {
  pillars: { total: number; active: number };
  services: { total: number; active: number };
  faqs: { total: number; active: number };
  contacts: { total: number; new: number; thisWeek: number; thisMonth: number };
  users: { total: number; active: number; thisWeek: number; thisMonth: number };
  orders: { total: number; pending: number; confirmed: number; completed: number; thisWeek: number; thisMonth: number; totalRevenue: number };
}

export function AdminDashboard() {
  const { data: statsData } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: () => get<DashboardStats>('/admin/dashboard/stats'),
  });

  const stats = statsData?.data;

  return (
    <div>
      <h1 className="text-h2 text-white mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-400">This week</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.orders?.thisWeek ?? '-'}</p>
          <p className="text-sm text-slate-400">New Orders</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-xs font-medium text-slate-400">Revenue</span>
          </div>
          <p className="text-3xl font-bold text-white">
            £{stats?.orders?.totalRevenue?.toLocaleString() ?? '-'}
          </p>
          <p className="text-sm text-slate-400">Total Revenue (Paid)</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <span className="text-xs font-medium text-slate-400">Pending</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.orders?.pending ?? '-'}</p>
          <p className="text-sm text-slate-400">Pending Orders</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-slate-400">This month</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.users?.thisMonth ?? '-'}</p>
          <p className="text-sm text-slate-400">New Users</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-h4 text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-blue-400" />
              <span className="font-medium text-slate-300">View Orders</span>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Users className="h-5 w-5 text-purple-400" />
              <span className="font-medium text-slate-300">Manage Users</span>
            </Link>
            <Link
              to="/admin/services"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <FileText className="h-5 w-5 text-orange-400" />
              <span className="font-medium text-slate-300">Manage Services</span>
            </Link>
            <Link
              to="/admin/contacts"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-green-400" />
              <span className="font-medium text-slate-300">Contact Submissions</span>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-h4 text-white mb-4">Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-medium text-slate-200">Total Orders</p>
                  <p className="text-xs text-slate-500">
                    {stats?.orders?.completed ?? 0} completed
                  </p>
                </div>
              </div>
              <span className="text-lg font-semibold text-white">
                {stats?.orders?.total ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="font-medium text-slate-200">Registered Users</p>
                  <p className="text-xs text-slate-500">
                    {stats?.users?.active ?? 0} active
                  </p>
                </div>
              </div>
              <span className="text-lg font-semibold text-white">
                {stats?.users?.total ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium text-slate-200">Contact Submissions</p>
                  <p className="text-xs text-slate-500">
                    {stats?.contacts?.new ?? 0} new
                  </p>
                </div>
              </div>
              <span className="text-lg font-semibold text-white">
                {stats?.contacts?.total ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="font-medium text-slate-200">Active Services</p>
                  <p className="text-xs text-slate-500">
                    across {stats?.pillars?.active ?? 0} pillars
                  </p>
                </div>
              </div>
              <span className="text-lg font-semibold text-white">
                {stats?.services?.active ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
