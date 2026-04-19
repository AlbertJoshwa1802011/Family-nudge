'use client';

import {
  Bell,
  Shield,
  FileText,
  Wrench,
  Users,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Search,
  Settings,
  LogOut,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { PRIORITY_COLORS, CATEGORY_ICONS } from '@family-nudge/shared';

type Tab = 'overview' | 'reminders' | 'documents' | 'policies' | 'maintenance';

const mockReminders = [
  { id: '1', title: 'Car Insurance Renewal', category: 'INSURANCE', priority: 'CRITICAL', dueDate: '2026-04-25', channels: ['PUSH', 'SMS', 'WHATSAPP', 'CALL'] },
  { id: '2', title: 'Dental Checkup — Sarah', category: 'HEALTH', priority: 'HIGH', dueDate: '2026-04-30', channels: ['PUSH', 'SMS'] },
  { id: '3', title: 'Replace HVAC Filter', category: 'MAINTENANCE', priority: 'MEDIUM', dueDate: '2026-05-01', channels: ['PUSH'] },
  { id: '4', title: 'School Permission Slip', category: 'SCHOOL', priority: 'HIGH', dueDate: '2026-04-22', channels: ['PUSH', 'WHATSAPP'] },
  { id: '5', title: 'Passport Renewal — John', category: 'DOCUMENTS', priority: 'MEDIUM', dueDate: '2026-06-15', channels: ['PUSH', 'SMS'] },
];

const mockPolicies = [
  { id: '1', name: 'Auto Insurance — Honda', provider: 'State Farm', endDate: '2026-05-15', daysLeft: 26, status: 'EXPIRING_SOON' },
  { id: '2', name: 'Home Insurance', provider: 'Allstate', endDate: '2026-11-01', daysLeft: 196, status: 'ACTIVE' },
  { id: '3', name: 'Laptop Extended Warranty', provider: 'Best Buy', endDate: '2026-04-28', daysLeft: 9, status: 'EXPIRING_SOON' },
];

const mockDocuments = [
  { id: '1', name: 'Passport — John.pdf', category: 'IDENTITY', size: '2.4 MB', uploadedAt: '2026-03-15' },
  { id: '2', name: 'Home Insurance Policy.pdf', category: 'INSURANCE', size: '890 KB', uploadedAt: '2026-01-02' },
  { id: '3', name: 'Birth Certificate — Emma.pdf', category: 'IDENTITY', size: '1.1 MB', uploadedAt: '2025-12-10' },
  { id: '4', name: 'Tax Return 2025.pdf', category: 'FINANCIAL', size: '3.2 MB', uploadedAt: '2026-03-28' },
];

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-amber-100 text-amber-700',
    CRITICAL: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[priority] ?? colors.MEDIUM}`}>
      {priority}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }: { icon: React.ElementType; label: string; value: string | number; color: string; trend?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Family Nudge
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">The Doe Family</div>
              <div className="text-xs text-gray-500">4 members</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-gray-500">Welcome back, John</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 w-64"
                />
              </div>
              <button className="relative p-2 hover:bg-gray-50 rounded-xl transition">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition">
                <Plus className="w-4 h-4" />
                New Nudge
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard icon={Bell} label="Active Reminders" value={12} color="bg-blue-500" trend="+2 this week" />
                <StatCard icon={AlertTriangle} label="Due Soon" value={3} color="bg-amber-500" />
                <StatCard icon={Shield} label="Active Policies" value={5} color="bg-emerald-500" />
                <StatCard icon={FileText} label="Documents Stored" value={24} color="bg-purple-500" />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Upcoming Reminders */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="font-semibold text-gray-900">Upcoming Reminders</h3>
                    <button onClick={() => setActiveTab('reminders')} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-6 pb-6 space-y-3">
                    {mockReminders.slice(0, 4).map((r) => (
                      <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                        <div className="text-2xl">{CATEGORY_ICONS[r.category as keyof typeof CATEGORY_ICONS] ?? '⭐'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{r.title}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(r.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <PriorityBadge priority={r.priority} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Policy Alerts */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="font-semibold text-gray-900">Policy Alerts</h3>
                    <button onClick={() => setActiveTab('policies')} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-6 pb-6 space-y-3">
                    {mockPolicies.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === 'EXPIRING_SOON' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                          <Shield className={`w-5 h-5 ${p.status === 'EXPIRING_SOON' ? 'text-red-600' : 'text-emerald-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.provider}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${p.daysLeft <= 30 ? 'text-red-600' : 'text-gray-700'}`}>
                            {p.daysLeft}d left
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                {['All', 'HEALTH', 'INSURANCE', 'MAINTENANCE', 'SCHOOL', 'DOCUMENTS'].map((cat) => (
                  <button
                    key={cat}
                    className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition"
                  >
                    {cat === 'All' ? 'All' : `${CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ?? ''} ${cat.charAt(0) + cat.slice(1).toLowerCase()}`}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {mockReminders.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition">
                    <button className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-primary-500 transition flex-shrink-0" />
                    <div className="text-2xl">{CATEGORY_ICONS[r.category as keyof typeof CATEGORY_ICONS] ?? '⭐'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{r.title}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(r.dueDate).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-400">via {r.channels.join(', ')}</span>
                      </div>
                    </div>
                    <PriorityBadge priority={r.priority} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">All documents are AES-256-GCM encrypted at rest</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition">
                  <Plus className="w-4 h-4" />
                  Upload Document
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {mockDocuments.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{doc.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{doc.category} &middot; {doc.size}</div>
                        <div className="text-xs text-gray-400 mt-2">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Encrypted</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Track all insurance policies and warranties in one place</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition">
                  <Plus className="w-4 h-4" />
                  Add Policy
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {mockPolicies.map((p) => (
                  <div key={p.id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.status === 'EXPIRING_SOON' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                          <Shield className={`w-6 h-6 ${p.status === 'EXPIRING_SOON' ? 'text-red-600' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-sm text-gray-500">{p.provider} &middot; Expires {new Date(p.endDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${p.daysLeft <= 30 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {p.daysLeft} days
                        </div>
                        <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.status === 'EXPIRING_SOON' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Keep your home and vehicles in top shape</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition">
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'HVAC Filter Replacement', location: 'Home', frequency: 'MONTHLY', daysUntil: 5, urgency: 'due_soon' },
                  { name: 'Oil Change — Honda Civic', location: 'Vehicle', frequency: 'QUARTERLY', daysUntil: 22, urgency: 'upcoming' },
                  { name: 'Gutter Cleaning', location: 'Home', frequency: 'QUARTERLY', daysUntil: -3, urgency: 'overdue' },
                  { name: 'Smoke Detector Battery', location: 'Home', frequency: 'YEARLY', daysUntil: 45, urgency: 'ok' },
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          item.urgency === 'overdue' ? 'bg-red-100' :
                          item.urgency === 'due_soon' ? 'bg-amber-100' :
                          'bg-gray-100'
                        }`}>
                          <Wrench className={`w-6 h-6 ${
                            item.urgency === 'overdue' ? 'text-red-600' :
                            item.urgency === 'due_soon' ? 'text-amber-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.location} &middot; {item.frequency}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.urgency === 'overdue' ? 'bg-red-100 text-red-700' :
                        item.urgency === 'due_soon' ? 'bg-amber-100 text-amber-700' :
                        item.urgency === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.daysUntil < 0 ? `${Math.abs(item.daysUntil)}d overdue` : `${item.daysUntil}d left`}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button className="flex-1 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition">
                        Mark Done
                      </button>
                      <button className="px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        Snooze
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
