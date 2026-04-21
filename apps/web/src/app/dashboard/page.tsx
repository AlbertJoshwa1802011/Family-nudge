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
  FolderPlus,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORY_ICONS } from '@/lib/constants';
import { useAuthStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';

type Tab = 'overview' | 'reminders' | 'documents' | 'policies' | 'maintenance';

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

const AVATAR_COLORS = ['bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-cyan-500', 'bg-orange-500'];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

interface MemberDisplay {
  id: string;
  firstName: string;
  lastName: string;
  avatarColor: string;
  role: string;
}

function Avatar({ member, size = 'sm' }: { member: MemberDisplay; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
  return (
    <div className={`${sizes[size]} ${member.avatarColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`} title={`${member.firstName} ${member.lastName}`}>
      {member.firstName[0]}
    </div>
  );
}

function AvatarStack({ memberIds, members, max = 3 }: { memberIds: string[]; members: MemberDisplay[]; max?: number }) {
  const resolved = memberIds.map((id) => members.find((m) => m.id === id)).filter(Boolean) as MemberDisplay[];
  const shown = resolved.slice(0, max);
  const overflow = resolved.length - max;
  const isEntireFamily = resolved.length === members.length && members.length > 1;

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
        {resolved.map((m) => m.firstName).join(', ')}
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

function EmptyState({ icon: Icon, title, description, action, onAction }: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{description}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition"
        >
          <Plus className="w-4 h-4" />
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Create Family Modal ───

function CreateFamilyModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const token = useAuthStore((s) => s.token);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await apiFetch('/families', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ name }),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create a Family</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Family Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Doe Family"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Family'}
          </button>
        </div>
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

function CreateReminderModal({ members, familyId, onClose, onCreated }: {
  members: MemberDisplay[];
  familyId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const token = useAuthStore((s) => s.token);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        assignEntireFamily: newIds.length === members.length,
      };
    });
  }

  function toggleEntireFamily() {
    setForm((prev) => ({
      ...prev,
      assignEntireFamily: !prev.assignEntireFamily,
      assigneeIds: !prev.assignEntireFamily ? members.map((m) => m.id) : [],
    }));
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.dueDate) return;
    setLoading(true);
    setError('');
    try {
      await apiFetch('/reminders', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          priority: form.priority,
          frequency: form.frequency,
          channels: form.channels,
          dueDate: new Date(form.dueDate).toISOString(),
          earlyNotificationDays: form.earlyNotificationDays,
          familyId,
          assigneeIds: form.assigneeIds.length > 0 ? form.assigneeIds : undefined,
        }),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create a Nudge</h2>
            <p className="text-sm text-gray-500 mt-1">Step {step} of 3 — {step === 1 ? 'What & When' : step === 2 ? 'Who to Remind' : 'How to Notify'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {error && <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <div className="p-6 space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Car Insurance Renewal, Dental Checkup..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add any details or notes..." rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white">
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat.charAt(0) + cat.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white">
                    {FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>{freq.charAt(0) + freq.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Early Notification</label>
                  <select value={form.earlyNotificationDays} onChange={(e) => setForm({ ...form, earlyNotificationDays: Number(e.target.value) })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white">
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
                      <div className="text-sm text-gray-500">Send this nudge to all {members.length} family members</div>
                    </div>
                  </div>
                  <button onClick={toggleEntireFamily} className={`relative w-12 h-7 rounded-full transition-colors ${form.assignEntireFamily ? 'bg-primary-600' : 'bg-gray-300'}`}>
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
                  {members.map((member) => {
                    const selected = form.assigneeIds.includes(member.id);
                    return (
                      <button key={member.id} onClick={() => toggleAssignee(member.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${selected ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                        <Avatar member={member} size="lg" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                          <div className="text-xs text-gray-500">{member.role}</div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${selected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                          {selected && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {PRIORITIES.map((p) => {
                    const colors: Record<string, string> = { LOW: 'border-gray-300 bg-gray-50 hover:border-gray-400', MEDIUM: 'border-blue-300 bg-blue-50 hover:border-blue-400', HIGH: 'border-amber-300 bg-amber-50 hover:border-amber-400', CRITICAL: 'border-red-300 bg-red-50 hover:border-red-400' };
                    const activeColors: Record<string, string> = { LOW: 'border-gray-500 bg-gray-100 ring-2 ring-gray-300', MEDIUM: 'border-blue-500 bg-blue-100 ring-2 ring-blue-300', HIGH: 'border-amber-500 bg-amber-100 ring-2 ring-amber-300', CRITICAL: 'border-red-500 bg-red-100 ring-2 ring-red-300' };
                    return (
                      <button key={p} onClick={() => setForm({ ...form, priority: p })} className={`p-4 rounded-xl border-2 text-left transition ${form.priority === p ? activeColors[p] : colors[p]}`}>
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
                      <button key={ch.id} onClick={() => toggleChannel(ch.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${active ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-primary-100' : 'bg-gray-100'}`}>
                          <ch.icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 text-sm">{ch.label}</div>
                          <div className="text-xs text-gray-500">{ch.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${active ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                          {active && <CheckCheck className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
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
                      <span>{form.assignEntireFamily ? 'Entire Family' : form.assigneeIds.map((id) => members.find((m) => m.id === id)?.firstName).filter(Boolean).join(', ')}</span>
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

        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <button onClick={() => step === 1 ? onClose() : setStep((step - 1) as 1 | 2)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={() => {
              if (step < 3) setStep((step + 1) as 2 | 3);
              else handleCreate();
            }}
            disabled={loading}
            className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {step === 3 ? (loading ? 'Creating...' : <><span>Create Nudge</span> <CheckCheck className="w-4 h-4" /></>) : (<><span>Next</span> <ChevronRight className="w-4 h-4" /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    token,
    currentFamily,
    families,
    reminders,
    policies,
    documents,
    fetchFamilies,
    fetchReminders,
    fetchPolicies,
    fetchDocuments,
    setCurrentFamily,
    logout,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const familyMembers: MemberDisplay[] = currentFamily?.members.map((m, i) => ({
    id: m.user.id,
    firstName: m.user.firstName,
    lastName: m.user.lastName,
    avatarColor: getAvatarColor(i),
    role: m.role,
  })) ?? [];

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    await fetchFamilies();
    setIsRefreshing(false);
  }, [fetchFamilies]);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  useEffect(() => {
    if (currentFamily) {
      fetchReminders(currentFamily.id);
      fetchPolicies(currentFamily.id);
      fetchDocuments(currentFamily.id);
    }
  }, [currentFamily, fetchReminders, fetchPolicies, fetchDocuments]);

  const activeReminders = reminders.filter((r) => !r.isCompleted);
  const dueSoonReminders = reminders.filter((r) => {
    if (r.isCompleted) return false;
    const due = new Date(r.dueDate);
    const now = new Date();
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  });

  const expiringPolicies = policies.filter((p) => {
    const end = new Date(p.endDate);
    const now = new Date();
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff >= 0;
  });

  function handleLogout() {
    logout();
    router.push('/login');
  }

  async function handleCompleteReminder(id: string) {
    if (!token) return;
    try {
      await apiFetch(`/reminders/${id}/complete`, { method: 'PATCH', token });
      if (currentFamily) fetchReminders(currentFamily.id);
    } catch { /* silently fail */ }
  }

  async function handleSnoozeReminder(id: string) {
    if (!token) return;
    try {
      await apiFetch(`/reminders/${id}/snooze`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ hours: 24 }),
      });
      if (currentFamily) fetchReminders(currentFamily.id);
    } catch { /* silently fail */ }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  if (!currentFamily && families.length === 0 && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {showFamilyModal && <CreateFamilyModal onClose={() => setShowFamilyModal(false)} onCreated={loadData} />}
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Family Nudge!</h1>
          <p className="text-gray-500 mb-8">Create your first family group to start managing reminders, documents, and policies together.</p>
          <button
            onClick={() => setShowFamilyModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition"
          >
            <FolderPlus className="w-5 h-5" />
            Create Your Family
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showCreateModal && currentFamily && (
        <CreateReminderModal
          members={familyMembers}
          familyId={currentFamily.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => currentFamily && fetchReminders(currentFamily.id)}
        />
      )}
      {showFamilyModal && <CreateFamilyModal onClose={() => setShowFamilyModal(false)} onCreated={loadData} />}

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
          {currentFamily ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{currentFamily.name}</div>
                  <div className="text-xs text-gray-500">{familyMembers.length} members</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {familyMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                    <Avatar member={m} />
                    <span className="text-xs text-gray-600">{m.firstName}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{m.role}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <button onClick={() => setShowFamilyModal(true)} className="w-full flex items-center gap-3 p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition">
              <FolderPlus className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Create Family</span>
            </button>
          )}

          {families.length > 1 && (
            <div className="mt-3 space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider px-3">Switch Family</div>
              {families.filter((f) => f.id !== currentFamily?.id).map((f) => (
                <button key={f.id} onClick={() => setCurrentFamily(f)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition">
                  <Users className="w-3.5 h-3.5" />
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
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
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tabs.find((t) => t.id === activeTab)?.label}</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.firstName ?? 'there'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search everything..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 w-64" />
              </div>
              <button onClick={loadData} className={`p-2 hover:bg-gray-50 rounded-xl transition ${isRefreshing ? 'animate-spin' : ''}`} title="Refresh data">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button className="relative p-2 hover:bg-gray-50 rounded-xl transition">
                <Bell className="w-5 h-5 text-gray-600" />
                {dueSoonReminders.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition">
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
                <StatCard icon={Bell} label="Active Reminders" value={activeReminders.length} color="bg-blue-500" />
                <StatCard icon={AlertTriangle} label="Due Soon" value={dueSoonReminders.length} color="bg-amber-500" />
                <StatCard icon={Shield} label="Active Policies" value={policies.length} color="bg-emerald-500" />
                <StatCard icon={FileText} label="Documents Stored" value={documents.length} color="bg-purple-500" />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="font-semibold text-gray-900">Upcoming Reminders</h3>
                    <button onClick={() => setActiveTab('reminders')} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-6 pb-6 space-y-3">
                    {activeReminders.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">No reminders yet. Create your first nudge!</p>
                    ) : (
                      activeReminders.slice(0, 4).map((r) => (
                        <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                          <div className="text-2xl">{CATEGORY_ICONS[r.category as keyof typeof CATEGORY_ICONS] ?? '⭐'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">{r.title}</div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(r.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <AvatarStack memberIds={r.assignees.map((a) => a.user.id)} members={familyMembers} />
                            </div>
                          </div>
                          <PriorityBadge priority={r.priority} />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="font-semibold text-gray-900">Policy Alerts</h3>
                    <button onClick={() => setActiveTab('policies')} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-6 pb-6 space-y-3">
                    {policies.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">No policies tracked yet.</p>
                    ) : (
                      policies.slice(0, 4).map((p) => {
                        const daysLeft = Math.ceil((new Date(p.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const isExpiring = daysLeft <= 30;
                        return (
                          <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isExpiring ? 'bg-red-100' : 'bg-emerald-100'}`}>
                              <Shield className={`w-5 h-5 ${isExpiring ? 'text-red-600' : 'text-emerald-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate">{p.name}</div>
                              <div className="text-xs text-gray-500">{p.provider}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${daysLeft <= 30 ? 'text-red-600' : 'text-gray-700'}`}>{daysLeft}d left</div>
                              <div className="text-xs text-gray-400">{new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
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
                    <button key={cat} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition">
                      {cat === 'All' ? 'All' : `${CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ?? ''} ${cat.charAt(0) + cat.slice(1).toLowerCase()}`}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition">
                  <Plus className="w-4 h-4" /> New Nudge
                </button>
              </div>

              {reminders.length === 0 ? (
                <EmptyState icon={Bell} title="No Reminders Yet" description="Create your first nudge to start tracking important dates and tasks for your family." action="Create Reminder" onAction={() => setShowCreateModal(true)} />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                  {reminders.map((r) => (
                    <div key={r.id} className={`flex items-center gap-4 p-5 hover:bg-gray-50 transition ${r.isCompleted ? 'opacity-50' : ''}`}>
                      <button onClick={() => handleCompleteReminder(r.id)} className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${r.isCompleted ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-primary-500'}`}>
                        {r.isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>
                      <div className="text-2xl">{CATEGORY_ICONS[r.category as keyof typeof CATEGORY_ICONS] ?? '⭐'}</div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-gray-900 ${r.isCompleted ? 'line-through' : ''}`}>{r.title}</div>
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {new Date(r.dueDate).toLocaleDateString()}
                          </span>
                          <AvatarStack memberIds={r.assignees.map((a) => a.user.id)} members={familyMembers} />
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">Created by {r.createdBy.firstName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          {r.channels.map((ch) => <ChannelBadge key={ch} channel={ch} />)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!r.isCompleted && (
                          <button onClick={() => handleSnoozeReminder(r.id)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                            Snooze
                          </button>
                        )}
                        <PriorityBadge priority={r.priority} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">All documents are AES-256-GCM encrypted at rest</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
              </div>

              {documents.length === 0 ? (
                <EmptyState icon={FileText} title="No Documents Yet" description="Upload important family documents to your encrypted vault. All files are protected with AES-256-GCM encryption." action="Upload Document" />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{doc.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{doc.category} &middot; {(doc.fileSize / 1024).toFixed(0)} KB</div>
                          <div className="text-xs text-gray-400 mt-2">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Encrypted</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

              {policies.length === 0 ? (
                <EmptyState icon={Shield} title="No Policies Tracked" description="Add your insurance policies and warranties to track expiration dates and get timely reminders." action="Add Policy" />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                  {policies.map((p) => {
                    const daysLeft = Math.ceil((new Date(p.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const isExpiring = daysLeft <= 30;
                    return (
                      <div key={p.id} className="p-5 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isExpiring ? 'bg-red-100' : 'bg-emerald-100'}`}>
                              <Shield className={`w-6 h-6 ${isExpiring ? 'text-red-600' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{p.name}</div>
                              <div className="text-sm text-gray-500">{p.provider} &middot; Expires {new Date(p.endDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${daysLeft <= 30 ? 'text-red-600' : 'text-emerald-600'}`}>{daysLeft} days</div>
                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${isExpiring ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {isExpiring ? 'EXPIRING SOON' : 'ACTIVE'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
              <EmptyState icon={Wrench} title="No Maintenance Items" description="Track home and vehicle maintenance schedules to stay on top of upkeep tasks." action="Add Maintenance Item" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
