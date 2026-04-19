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
  X,
  UserPlus,
  Phone,
  MessageCircle,
  Mail,
  Send,
  CheckCheck,
} from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_ICONS } from '@/lib/constants';

type Tab = 'overview' | 'reminders' | 'documents' | 'policies' | 'maintenance';

const mockFamilyMembers = [
  { id: '1', firstName: 'John', lastName: 'Doe', avatarColor: 'bg-blue-500', role: 'ADMIN' },
  { id: '2', firstName: 'Sarah', lastName: 'Doe', avatarColor: 'bg-pink-500', role: 'PARENT' },
  { id: '3', firstName: 'Emma', lastName: 'Doe', avatarColor: 'bg-purple-500', role: 'MEMBER' },
  { id: '4', firstName: 'Jake', lastName: 'Doe', avatarColor: 'bg-green-500', role: 'CHILD' },
];

const mockReminders = [
  { id: '1', title: 'Car Insurance Renewal', category: 'INSURANCE', priority: 'CRITICAL', dueDate: '2026-04-25', channels: ['PUSH', 'SMS', 'WHATSAPP', 'CALL'], assignees: ['1', '2'], createdBy: '1' },
  { id: '2', title: 'Dental Checkup — Sarah', category: 'HEALTH', priority: 'HIGH', dueDate: '2026-04-30', channels: ['PUSH', 'SMS'], assignees: ['2'], createdBy: '1' },
  { id: '3', title: 'Replace HVAC Filter', category: 'MAINTENANCE', priority: 'MEDIUM', dueDate: '2026-05-01', channels: ['PUSH'], assignees: ['1'], createdBy: '2' },
  { id: '4', title: 'School Permission Slip', category: 'SCHOOL', priority: 'HIGH', dueDate: '2026-04-22', channels: ['PUSH', 'WHATSAPP'], assignees: ['3', '4'], createdBy: '2' },
  { id: '5', title: 'Passport Renewal — John', category: 'DOCUMENTS', priority: 'MEDIUM', dueDate: '2026-06-15', channels: ['PUSH', 'SMS'], assignees: ['1'], createdBy: '2' },
  { id: '6', title: 'Annual Health Checkups', category: 'HEALTH', priority: 'HIGH', dueDate: '2026-05-10', channels: ['PUSH', 'SMS', 'WHATSAPP'], assignees: ['1', '2', '3', '4'], createdBy: '1' },
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

const CATEGORIES = ['HEALTH', 'FINANCE', 'INSURANCE', 'WARRANTY', 'MAINTENANCE', 'SCHOOL', 'DOCUMENTS', 'FAMILY', 'VEHICLE', 'PETS', 'HOUSEHOLD', 'CUSTOM'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const FREQUENCIES = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const;
const CHANNELS = [
  { id: 'PUSH', label: 'Push', icon: Bell, desc: 'App notification' },
  { id: 'SMS', label: 'SMS', icon: MessageCircle, desc: 'Text message' },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: Send, desc: 'WhatsApp message' },
  { id: 'CALL', label: 'Call', icon: Phone, desc: 'Automated phone call' },
  { id: 'EMAIL', label: 'Email', icon: Mail, desc: 'Email notification' },
] as const;

function Avatar({ member, size = 'sm' }: { member: typeof mockFamilyMembers[0]; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
  return (
    <div className={`${sizes[size]} ${member.avatarColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`} title={`${member.firstName} ${member.lastName}`}>
      {member.firstName[0]}
    </div>
  );
}

function AvatarStack({ memberIds, max = 3 }: { memberIds: string[]; max?: number }) {
  const members = memberIds.map((id) => mockFamilyMembers.find((m) => m.id === id)).filter(Boolean) as typeof mockFamilyMembers;
  const shown = members.slice(0, max);
  const overflow = members.length - max;
  const isEntireFamily = members.length === mockFamilyMembers.length;

  if (isEntireFamily) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
          <Users className="w-3.5 h-3.5 text-primary-600" />
        </div>
        <span className="text-xs text-primary-600 font-medium">Entire Family</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {shown.map((m) => (
          <Avatar key={m.id} member={m} />
        ))}
        {overflow > 0 && (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600 border-2 border-white">
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500 ml-2">
        {members.map((m) => m.firstName).join(', ')}
      </span>
    </div>
  );
}

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

function ChannelBadge({ channel }: { channel: string }) {
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    PUSH: { color: 'bg-gray-100 text-gray-600', icon: Bell },
    SMS: { color: 'bg-blue-100 text-blue-600', icon: MessageCircle },
    WHATSAPP: { color: 'bg-green-100 text-green-600', icon: Send },
    CALL: { color: 'bg-red-100 text-red-600', icon: Phone },
    EMAIL: { color: 'bg-purple-100 text-purple-600', icon: Mail },
  };
  const c = config[channel] ?? config.PUSH;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${c.color}`}>
      <c.icon className="w-2.5 h-2.5" />
      {channel}
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

// ─── Create Reminder Modal ───

interface CreateReminderForm {
  title: string;
  description: string;
  category: string;
  priority: string;
  frequency: string;
  channels: string[];
  dueDate: string;
  earlyNotificationDays: number;
  assigneeIds: string[];
  assignEntireFamily: boolean;
}

function CreateReminderModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CreateReminderForm>({
    title: '',
    description: '',
    category: 'HEALTH',
    priority: 'MEDIUM',
    frequency: 'ONCE',
    channels: ['PUSH'],
    dueDate: '',
    earlyNotificationDays: 7,
    assigneeIds: [],
    assignEntireFamily: false,
  });
  const [step, setStep] = useState<1 | 2 | 3>(1);

  function toggleChannel(ch: string) {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }));
  }

  function toggleAssignee(id: string) {
    setForm((prev) => {
      const newIds = prev.assigneeIds.includes(id)
        ? prev.assigneeIds.filter((a) => a !== id)
        : [...prev.assigneeIds, id];
      return {
        ...prev,
        assigneeIds: newIds,
        assignEntireFamily: newIds.length === mockFamilyMembers.length,
      };
    });
  }

  function toggleEntireFamily() {
    setForm((prev) => ({
      ...prev,
      assignEntireFamily: !prev.assignEntireFamily,
      assigneeIds: !prev.assignEntireFamily ? mockFamilyMembers.map((m) => m.id) : [],
    }));
  }

  const priorityExplain: Record<string, string> = {
    LOW: 'Gentle reminder — push notification only',
    MEDIUM: 'Important — push notification + SMS',
    HIGH: 'Urgent — push + SMS + WhatsApp message',
    CRITICAL: 'Cannot miss — push + SMS + WhatsApp + automated phone call',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create a Nudge</h2>
            <p className="text-sm text-gray-500 mt-1">Step {step} of 3 — {step === 1 ? 'What & When' : step === 2 ? 'Who to Remind' : 'How to Notify'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: What & When */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Car Insurance Renewal, Dental Checkup..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Add any details or notes..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat]} {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>{freq.charAt(0) + freq.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Early Notification</label>
                  <select
                    value={form.earlyNotificationDays}
                    onChange={(e) => setForm({ ...form, earlyNotificationDays: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value={1}>1 day before</option>
                    <option value={3}>3 days before</option>
                    <option value={7}>1 week before</option>
                    <option value={14}>2 weeks before</option>
                    <option value={30}>1 month before</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Who to Remind */}
          {step === 2 && (
            <>
              <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Remind Entire Family</div>
                      <div className="text-sm text-gray-500">Send this nudge to all {mockFamilyMembers.length} family members</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleEntireFamily}
                    className={`relative w-12 h-7 rounded-full transition-colors ${form.assignEntireFamily ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.assignEntireFamily ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Or pick specific members</label>
                  <span className="text-xs text-gray-400">{form.assigneeIds.length} selected</span>
                </div>
                <div className="space-y-2">
                  {mockFamilyMembers.map((member) => {
                    const selected = form.assigneeIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        onClick={() => toggleAssignee(member.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                          selected ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Avatar member={member} size="lg" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                          <div className="text-xs text-gray-500">{member.role}</div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                          selected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                        }`}>
                          {selected && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-amber-800">Any member can create reminders</div>
                    <div className="text-xs text-amber-600 mt-1">
                      Everyone in your family can create nudges for anyone else. Parents and admins
                      can also manage and delete reminders.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: How to Notify */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {PRIORITIES.map((p) => {
                    const colors: Record<string, string> = {
                      LOW: 'border-gray-300 bg-gray-50 hover:border-gray-400',
                      MEDIUM: 'border-blue-300 bg-blue-50 hover:border-blue-400',
                      HIGH: 'border-amber-300 bg-amber-50 hover:border-amber-400',
                      CRITICAL: 'border-red-300 bg-red-50 hover:border-red-400',
                    };
                    const activeColors: Record<string, string> = {
                      LOW: 'border-gray-500 bg-gray-100 ring-2 ring-gray-300',
                      MEDIUM: 'border-blue-500 bg-blue-100 ring-2 ring-blue-300',
                      HIGH: 'border-amber-500 bg-amber-100 ring-2 ring-amber-300',
                      CRITICAL: 'border-red-500 bg-red-100 ring-2 ring-red-300',
                    };
                    return (
                      <button
                        key={p}
                        onClick={() => setForm({ ...form, priority: p })}
                        className={`p-4 rounded-xl border-2 text-left transition ${
                          form.priority === p ? activeColors[p] : colors[p]
                        }`}
                      >
                        <div className="font-semibold text-gray-900 text-sm">{p}</div>
                        <div className="text-xs text-gray-600 mt-1">{priorityExplain[p]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channels</label>
                <p className="text-xs text-gray-500 mb-3">Choose how the assignees will be reminded</p>
                <div className="space-y-2">
                  {CHANNELS.map((ch) => {
                    const active = form.channels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                          active ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          active ? 'bg-primary-100' : 'bg-gray-100'
                        }`}>
                          <ch.icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 text-sm">{ch.label}</div>
                          <div className="text-xs text-gray-500">{ch.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                          active ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                        }`}>
                          {active && <CheckCheck className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Reminder Preview</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[form.category as keyof typeof CATEGORY_ICONS] ?? '⭐'}</span>
                    <span className="font-semibold text-gray-900">{form.title || 'Untitled Reminder'}</span>
                    <PriorityBadge priority={form.priority} />
                  </div>
                  {form.assigneeIds.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        {form.assignEntireFamily
                          ? 'Entire Family'
                          : form.assigneeIds.map((id) => mockFamilyMembers.find((m) => m.id === id)?.firstName).filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {form.channels.map((ch) => <ChannelBadge key={ch} channel={ch} />)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <button
            onClick={() => step === 1 ? onClose() : setStep((step - 1) as 1 | 2)}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={() => {
              if (step < 3) setStep((step + 1) as 2 | 3);
              else onClose();
            }}
            className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition flex items-center gap-2"
          >
            {step === 3 ? (
              <>Create Nudge <CheckCheck className="w-4 h-4" /></>
            ) : (
              <>Next <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {showCreateModal && <CreateReminderModal onClose={() => setShowCreateModal(false)} />}

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
              <div className="text-xs text-gray-500">{mockFamilyMembers.length} members</div>
            </div>
          </div>
          {/* Family members list */}
          <div className="mt-3 space-y-1">
            {mockFamilyMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                <Avatar member={m} />
                <span className="text-xs text-gray-600">{m.firstName}</span>
                <span className="text-[10px] text-gray-400 ml-auto">{m.role}</span>
              </div>
            ))}
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
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition"
              >
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
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(r.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <AvatarStack memberIds={r.assignees} />
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
              <div className="flex items-center justify-between">
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
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition"
                >
                  <Plus className="w-4 h-4" /> New Nudge
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {mockReminders.map((r) => {
                  const creator = mockFamilyMembers.find((m) => m.id === r.createdBy);
                  return (
                    <div key={r.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition">
                      <button className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-primary-500 transition flex-shrink-0" />
                      <div className="text-2xl">{CATEGORY_ICONS[r.category as keyof typeof CATEGORY_ICONS] ?? '⭐'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{r.title}</div>
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {new Date(r.dueDate).toLocaleDateString()}
                          </span>
                          <AvatarStack memberIds={r.assignees} />
                          {creator && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              Created by {creator.firstName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          {r.channels.map((ch) => <ChannelBadge key={ch} channel={ch} />)}
                        </div>
                      </div>
                      <PriorityBadge priority={r.priority} />
                    </div>
                  );
                })}
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
