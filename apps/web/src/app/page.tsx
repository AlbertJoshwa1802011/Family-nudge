'use client';

import { useState } from 'react';
import {
  Bell,
  Shield,
  FileText,
  Users,
  Clock,
  Wrench,
  Phone,
  MessageCircle,
  Lock,
  ChevronRight,
  Star,
  Heart,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Set criticality levels — from gentle push notifications to automated phone calls for things that truly matter.',
    color: 'bg-blue-500',
  },
  {
    icon: Shield,
    title: 'Insurance & Warranty Tracker',
    description: 'Never miss a renewal. Get early notifications before policies expire, with all details at your fingertips.',
    color: 'bg-emerald-500',
  },
  {
    icon: Lock,
    title: 'Encrypted Document Vault',
    description: 'Store passports, birth certificates, and sensitive docs with AES-256 encryption. Full audit trail for every access.',
    color: 'bg-purple-500',
  },
  {
    icon: Users,
    title: 'Family Groups',
    description: 'Create family groups with role-based access. Parents, members, children — everyone gets the right level of control.',
    color: 'bg-orange-500',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp & SMS Integration',
    description: 'Send reminders via WhatsApp messages, SMS, or even automated calls. Meet your family where they already are.',
    color: 'bg-green-500',
  },
  {
    icon: Wrench,
    title: 'Maintenance Tracking',
    description: 'HVAC filters, oil changes, appliance care — track recurring maintenance with auto-calculated next-due dates.',
    color: 'bg-red-500',
  },
];

const stats = [
  { label: 'Reminder Categories', value: '12+' },
  { label: 'Notification Channels', value: '5' },
  { label: 'Encryption Standard', value: 'AES-256' },
  { label: 'Platforms', value: 'Web + Mobile' },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Family Nudge
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition">How It Works</a>
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">Log In</a>
            <a
              href="/register"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition shadow-sm"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Solving boring problems in an interesting way
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 max-w-4xl mx-auto leading-tight">
            Your family&apos;s
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              {' '}second brain{' '}
            </span>
            for everything important
          </h1>

          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Reminders that escalate. Documents that are encrypted. Policies that never expire unnoticed.
            One app for all the boring-but-critical stuff families forget.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-200 p-1.5 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2.5 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 w-full sm:w-64"
              />
              <button className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition whitespace-nowrap">
                Start Free
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> End-to-end encrypted</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Free for families</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Everything your family needs,
              <br />
              <span className="text-primary-600">nothing it doesn&apos;t</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Built for the real problems families face — not another generic to-do app.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-200"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Nudges Work */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">How Nudges Escalate</h2>
            <p className="mt-4 text-lg text-gray-600">
              Set the importance level and we handle the rest — from gentle taps to phone calls.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { level: 'Low', color: 'border-gray-300 bg-gray-50', icon: Bell, channel: 'Push notification', desc: 'A gentle reminder in your notification tray' },
              { level: 'Medium', color: 'border-blue-300 bg-blue-50', icon: MessageCircle, channel: 'Push + SMS', desc: 'Notification plus a text message to make sure you see it' },
              { level: 'High', color: 'border-amber-300 bg-amber-50', icon: MessageCircle, channel: 'Push + SMS + WhatsApp', desc: 'We reach you on WhatsApp too — hard to miss' },
              { level: 'Critical', color: 'border-red-300 bg-red-50', icon: Phone, channel: 'Push + SMS + WhatsApp + Call', desc: 'Automated phone call — for insurance renewals, medical appointments, deadlines' },
            ].map((item, i) => (
              <div key={item.level} className={`flex items-start gap-6 p-6 rounded-2xl border-2 ${item.color} transition-all hover:scale-[1.02]`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-gray-700">
                  {i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-semibold text-gray-900">{item.level} Priority</span>
                    <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600 font-medium shadow-sm">{item.channel}</span>
                  </div>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Document Vault Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Your family&apos;s digital safe.
                <br />
                <span className="text-purple-600">Encrypted. Audited. Always accessible.</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Stop digging through drawers and email attachments. Upload passports, insurance policies,
                medical records, and warranties — all encrypted with military-grade AES-256-GCM.
              </p>
              <ul className="space-y-4">
                {[
                  'Every upload, download, and view is logged with full audit trail',
                  'Role-based access — children can view but not delete',
                  'Tag and categorize for instant search across all documents',
                  'Automatic reminders when linked documents expire',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-100">
              <div className="space-y-4">
                {[
                  { name: 'Passport — John.pdf', cat: 'Identity', size: '2.4 MB', date: 'Mar 15', icon: FileText },
                  { name: 'Home Insurance 2026.pdf', cat: 'Insurance', size: '890 KB', date: 'Jan 2', icon: Shield },
                  { name: 'Car Warranty.pdf', cat: 'Warranty', size: '1.2 MB', date: 'Nov 28', icon: FileText },
                  { name: 'Medical Records — Sarah.pdf', cat: 'Medical', size: '5.1 MB', date: 'Oct 10', icon: Heart },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <doc.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{doc.name}</div>
                      <div className="text-sm text-gray-500">{doc.cat} &middot; {doc.size}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-gray-400">{doc.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-purple-600">
                <Clock className="w-4 h-4" />
                All activity tracked with full audit log
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Stop letting important things slip through the cracks
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join families who have taken control of their reminders, documents, and deadlines.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-50 transition shadow-xl"
          >
            Get Started — It&apos;s Free
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-white">Family Nudge</span>
            </div>
            <p className="text-sm">
              Built with love for families everywhere. Your data is encrypted and yours alone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
