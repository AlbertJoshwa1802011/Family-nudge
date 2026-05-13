'use client';

import {
  Sparkles,
  Eye,
  Zap,
  Settings,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Brain,
  Workflow,
  Code2,
  MousePointerClick,
  RefreshCw,
  Shield,
  Bell,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Timer,
  Layers,
  Lightbulb,
  Target,
  Activity,
  BarChart3,
  Wrench,
  Heart,
  X,
  Check,
  Play,
} from 'lucide-react';
import { useState } from 'react';

// ─── Types ───

type PlatformFeature =
  | 'workflow_rule'
  | 'scheduled_automation'
  | 'custom_function'
  | 'custom_button'
  | 'field_update'
  | 'custom_view';

type ConfidenceLevel = 'high' | 'very_high' | 'medium';

interface PatternStep {
  action: string;
  detail: string;
}

interface UseCase {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  categoryIcon: React.ElementType;
  observedPattern: string;
  patternSteps: PatternStep[];
  repeatCount: number;
  repeatPeriod: string;
  confidence: ConfidenceLevel;
  suggestedFeature: PlatformFeature;
  featureLabel: string;
  agentNudge: string;
  whatItBuilds: string;
  generatedConfig: string;
  refinement: string;
  impactMetric: string;
}

// ─── Use Cases Data ───

const useCases: UseCase[] = [
  {
    id: 'uc1',
    title: 'Auto-Escalate Overdue Critical Reminders',
    category: 'Reminders',
    categoryColor: 'from-blue-500 to-blue-600',
    categoryIcon: Bell,
    observedPattern:
      'When a CRITICAL reminder goes 2+ days past due, the user manually changes the notification channel from PUSH to PUSH+SMS+WHATSAPP+CALL, then re-sends it.',
    patternSteps: [
      { action: 'Navigate', detail: 'Opens Reminders tab, filters by "Overdue"' },
      { action: 'Check', detail: 'Identifies CRITICAL priority reminders past due date' },
      { action: 'Edit', detail: 'Manually changes channels from [PUSH] → [PUSH, SMS, WHATSAPP, CALL]' },
      { action: 'Re-trigger', detail: 'Clicks "Re-send Notification" to escalate' },
    ],
    repeatCount: 31,
    repeatPeriod: 'this month',
    confidence: 'very_high',
    suggestedFeature: 'workflow_rule',
    featureLabel: 'Workflow Rule',
    agentNudge:
      '"I noticed you escalate overdue critical reminders to all channels 31 times this month. Want me to create a workflow that auto-escalates when a CRITICAL reminder is 2 days overdue?"',
    whatItBuilds:
      'A Workflow Rule that triggers when Reminder.priority = CRITICAL AND daysOverdue >= 2, automatically updates channels to [PUSH, SMS, WHATSAPP, CALL] and re-dispatches notifications.',
    generatedConfig: `{
  "type": "workflow_rule",
  "name": "Auto-Escalate Overdue Critical Reminders",
  "trigger": {
    "entity": "Reminder",
    "event": "field_update",
    "conditions": [
      { "field": "priority", "operator": "equals", "value": "CRITICAL" },
      { "field": "isCompleted", "operator": "equals", "value": false },
      { "field": "dueDate", "operator": "days_past", "value": 2 }
    ]
  },
  "actions": [
    {
      "type": "field_update",
      "field": "channels",
      "value": ["PUSH", "SMS", "WHATSAPP", "CALL"]
    },
    {
      "type": "send_notification",
      "template": "escalation_alert"
    }
  ]
}`,
    refinement:
      '"This rule escalated a reminder for Emma\'s dental checkup, but she had already rescheduled. Add an exception for reminders with \'rescheduled\' in their notes?"',
    impactMetric: 'Saves ~45 min/month of manual channel editing',
  },
  {
    id: 'uc2',
    title: 'Auto-Create Renewal Reminders for Expiring Policies',
    category: 'Policies',
    categoryColor: 'from-emerald-500 to-emerald-600',
    categoryIcon: Shield,
    observedPattern:
      'Every time a policy reaches 30 days before expiration, the user manually creates a CRITICAL reminder titled "Renew [Policy Name]" assigned to the family admin with all notification channels enabled.',
    patternSteps: [
      { action: 'Check', detail: 'Opens Policies tab, reviews "Expiring Soon" section' },
      { action: 'Navigate', detail: 'Switches to Reminders tab' },
      { action: 'Create', detail: 'Creates new reminder: "Renew [Policy Name]"' },
      { action: 'Configure', detail: 'Sets priority=CRITICAL, channels=ALL, assigns to Admin' },
      { action: 'Link', detail: 'Mentally tracks which policy the reminder is for' },
    ],
    repeatCount: 8,
    repeatPeriod: 'last 3 months',
    confidence: 'very_high',
    suggestedFeature: 'scheduled_automation',
    featureLabel: 'Scheduled Automation',
    agentNudge:
      '"You\'ve manually created renewal reminders for 8 expiring policies. Want me to auto-generate a CRITICAL reminder 30 days before any policy expires?"',
    whatItBuilds:
      'A Scheduled Automation that runs daily, checks for policies expiring within 30 days that don\'t already have a linked reminder, and auto-creates a CRITICAL reminder with all channels enabled, assigned to the family admin.',
    generatedConfig: `{
  "type": "scheduled_automation",
  "name": "Auto-Create Policy Renewal Reminders",
  "schedule": "0 8 * * *",
  "query": {
    "entity": "InsurancePolicy",
    "conditions": [
      { "field": "status", "operator": "equals", "value": "ACTIVE" },
      { "field": "endDate", "operator": "days_until", "value": 30 },
      { "field": "reminders", "operator": "has_none_with", "value": { "title": "contains:Renew" } }
    ]
  },
  "actions": [
    {
      "type": "create_record",
      "entity": "Reminder",
      "fields": {
        "title": "Renew {{policy.name}}",
        "category": "INSURANCE",
        "priority": "CRITICAL",
        "channels": ["PUSH", "SMS", "WHATSAPP", "CALL"],
        "dueDate": "{{policy.endDate - 7d}}",
        "linkedPolicyId": "{{policy.id}}"
      }
    },
    {
      "type": "assign_to",
      "role": "ADMIN"
    }
  ]
}`,
    refinement:
      '"The automation created a renewal reminder for the laptop warranty, but you renewed it online already. Should I also check the provider portal for renewal status before creating reminders?"',
    impactMetric: 'Zero missed policy renewals, saves ~20 min per policy',
  },
  {
    id: 'uc3',
    title: 'One-Click "Complete & Schedule Next" for Maintenance',
    category: 'Maintenance',
    categoryColor: 'from-orange-500 to-orange-600',
    categoryIcon: Wrench,
    observedPattern:
      'When marking a maintenance item as done, the user always: marks it complete, opens the item again, calculates the next due date based on frequency, updates the date, and creates a new reminder for it.',
    patternSteps: [
      { action: 'Mark Done', detail: 'Clicks "Mark Done" on a maintenance item' },
      { action: 'Reopen', detail: 'Immediately opens the same maintenance item' },
      { action: 'Calculate', detail: 'Mentally adds frequency (e.g., 3 months) to today\'s date' },
      { action: 'Update', detail: 'Manually updates nextDueDate field' },
      { action: 'Navigate', detail: 'Switches to Reminders tab' },
      { action: 'Create', detail: 'Creates a new reminder for the next maintenance date' },
    ],
    repeatCount: 14,
    repeatPeriod: 'this month',
    confidence: 'very_high',
    suggestedFeature: 'custom_button',
    featureLabel: 'Custom Button',
    agentNudge:
      '"Every time you complete a maintenance task, you manually calculate and set the next due date plus create a reminder — 14 times this month. Want me to add a \'Complete & Schedule Next\' button that does all of this in one click?"',
    whatItBuilds:
      'A Custom Button on MaintenanceItem that: (1) logs the completion, (2) auto-calculates the next due date from the item\'s frequency, (3) updates nextDueDate, and (4) creates a linked Reminder for the new date.',
    generatedConfig: `{
  "type": "custom_button",
  "name": "Complete & Schedule Next",
  "entity": "MaintenanceItem",
  "icon": "check-circle",
  "color": "emerald",
  "placement": "record_detail",
  "actions": [
    {
      "type": "create_record",
      "entity": "MaintenanceLog",
      "fields": {
        "itemId": "{{record.id}}",
        "performedAt": "{{now}}",
        "performedBy": "{{currentUser.name}}"
      }
    },
    {
      "type": "field_update",
      "field": "lastDoneAt",
      "value": "{{now}}"
    },
    {
      "type": "field_update",
      "field": "nextDueDate",
      "value": "{{addFrequency(now, record.frequency)}}"
    },
    {
      "type": "create_record",
      "entity": "Reminder",
      "fields": {
        "title": "{{record.name}} — Due",
        "category": "MAINTENANCE",
        "priority": "MEDIUM",
        "dueDate": "{{record.nextDueDate}}",
        "earlyNotificationDays": 3
      }
    },
    {
      "type": "toast",
      "message": "Done! Next scheduled for {{formatDate(record.nextDueDate)}}"
    }
  ]
}`,
    refinement:
      '"You adjusted the next HVAC filter date to 5 weeks instead of the standard 4-week frequency. Should I add a per-item frequency override option to the button?"',
    impactMetric: '6-step process → 1 click, saves ~2 min per task',
  },
  {
    id: 'uc4',
    title: 'Smart Document Auto-Tagging by Category',
    category: 'Documents',
    categoryColor: 'from-purple-500 to-purple-600',
    categoryIcon: FileText,
    observedPattern:
      'After uploading a document, the user always manually adds tags based on the document category — IDENTITY docs get ["passport", "government", "id-proof"], INSURANCE docs get ["policy", "coverage", "renewal"], FINANCIAL docs get ["tax", "returns", "filing"].',
    patternSteps: [
      { action: 'Upload', detail: 'Uploads a document and selects a category' },
      { action: 'Edit', detail: 'Opens the document detail immediately after upload' },
      { action: 'Tag', detail: 'Manually adds 3-4 tags that always match the category' },
      { action: 'Save', detail: 'Saves the updated tags' },
    ],
    repeatCount: 18,
    repeatPeriod: 'across last 2 months',
    confidence: 'high',
    suggestedFeature: 'field_update',
    featureLabel: 'Auto Field Update',
    agentNudge:
      '"You add the same tags to documents based on their category — 18 times in 2 months. Want me to auto-populate tags when a document is uploaded based on its category?"',
    whatItBuilds:
      'An Auto Field Update rule that triggers on Document.create, maps the category to a predefined tag set, and automatically populates the tags field.',
    generatedConfig: `{
  "type": "field_update",
  "name": "Auto-Tag Documents by Category",
  "trigger": {
    "entity": "Document",
    "event": "create"
  },
  "mapping": {
    "IDENTITY": ["passport", "government", "id-proof", "personal"],
    "INSURANCE": ["policy", "coverage", "renewal", "premium"],
    "FINANCIAL": ["tax", "returns", "filing", "financial"],
    "MEDICAL": ["health", "prescription", "medical", "records"],
    "LEGAL": ["contract", "agreement", "legal", "notarized"],
    "VEHICLE": ["registration", "vehicle", "auto", "maintenance"]
  },
  "action": {
    "type": "field_update",
    "field": "tags",
    "value": "{{mapping[record.category]}}"
  }
}`,
    refinement:
      '"You added a custom tag \'sarah-medical\' to 3 documents in the MEDICAL category for Sarah. Should I add member-specific tags like \'{{member.firstName}}-{{category}}\' to the auto-tagging rule?"',
    impactMetric: 'Eliminates manual tagging, ensures consistent searchability',
  },
  {
    id: 'uc5',
    title: 'Cross-Module: Policy Expiry → Document Reminder → Renewal Tracking',
    category: 'Cross-Module',
    categoryColor: 'from-rose-500 to-rose-600',
    categoryIcon: Layers,
    observedPattern:
      'When a policy expires and is renewed, the user performs a 7-step dance across 3 modules: updates the policy dates, uploads the new policy document, links it to the policy, creates a reminder for the next renewal, and sends a notification to the family.',
    patternSteps: [
      { action: 'Policy Update', detail: 'Opens the policy, updates startDate and endDate' },
      { action: 'Status Change', detail: 'Changes status from EXPIRING_SOON back to ACTIVE' },
      { action: 'Document Upload', detail: 'Switches to Documents, uploads new policy PDF' },
      { action: 'Document Link', detail: 'Links the uploaded document to the policy record' },
      { action: 'Reminder Create', detail: 'Switches to Reminders, creates "Renew [Policy]" for next year' },
      { action: 'Notify Family', detail: 'Manually sends a notification: "Policy renewed successfully"' },
      { action: 'Old Reminder', detail: 'Finds and marks the old renewal reminder as complete' },
    ],
    repeatCount: 5,
    repeatPeriod: 'last quarter',
    confidence: 'high',
    suggestedFeature: 'custom_function',
    featureLabel: 'Custom Function (Deluge)',
    agentNudge:
      '"Renewing a policy takes you through 7 steps across 3 modules. I can build a custom function that handles the entire renewal flow — update policy, upload document, create next reminder, notify family — in one action. Want me to build it?"',
    whatItBuilds:
      'A Custom Function (Deluge script) triggered by a "Renew Policy" button that: updates policy dates, changes status, accepts document upload, auto-links it, creates next-cycle reminder, completes old reminder, and broadcasts a family notification.',
    generatedConfig: `// Custom Function: renewPolicy(policyId, newEndDate, documentFile)
// Language: Deluge / Platform Script

function renewPolicy(policyId, newEndDate, documentFile) {
  // 1. Update policy dates and status
  policy = Policy.getById(policyId);
  policy.startDate = today();
  policy.endDate = newEndDate;
  policy.status = "ACTIVE";
  policy.save();

  // 2. Upload and encrypt new policy document
  doc = Document.create({
    name: policy.name + " — Renewed " + today().format("YYYY"),
    category: "INSURANCE",
    familyId: policy.familyId,
    file: documentFile,
    tags: ["policy", "renewal", policy.provider]
  });

  // 3. Link document to policy
  policy.documents.add(doc.id);

  // 4. Complete old reminder
  oldReminders = Reminder.find({
    linkedPolicyId: policyId,
    isCompleted: false
  });
  oldReminders.forEach(r => {
    r.isCompleted = true;
    r.completedAt = now();
    r.save();
  });

  // 5. Create next renewal reminder
  Reminder.create({
    title: "Renew " + policy.name,
    category: "INSURANCE",
    priority: "CRITICAL",
    dueDate: newEndDate.subtract(30, "days"),
    channels: ["PUSH", "SMS", "WHATSAPP", "CALL"],
    linkedPolicyId: policyId,
    familyId: policy.familyId
  });

  // 6. Notify family
  Notification.broadcast({
    familyId: policy.familyId,
    title: "Policy Renewed",
    body: policy.name + " renewed until " + newEndDate,
    channel: "PUSH"
  });

  return { success: true, message: "Policy renewed!" };
}`,
    refinement:
      '"The renewal function ran for Home Insurance, but the premium amount changed. Should I add a premium update field and track premium history over renewals?"',
    impactMetric: '7 steps across 3 modules → 1 function call, saves ~15 min per renewal',
  },
  {
    id: 'uc6',
    title: 'Family Activity Dashboard — Custom View',
    category: 'Analytics',
    categoryColor: 'from-indigo-500 to-indigo-600',
    categoryIcon: BarChart3,
    observedPattern:
      'Every Monday morning, the family admin navigates through all 4 tabs (Reminders, Documents, Policies, Maintenance) to get a weekly status overview, checking what\'s overdue, upcoming, and newly completed.',
    patternSteps: [
      { action: 'Reminders Tab', detail: 'Checks overdue and upcoming reminders for the week' },
      { action: 'Policies Tab', detail: 'Reviews any policies expiring within 60 days' },
      { action: 'Documents Tab', detail: 'Checks if any new documents were uploaded' },
      { action: 'Maintenance Tab', detail: 'Reviews overdue and upcoming maintenance items' },
      { action: 'Mental Summary', detail: 'Mentally compiles a weekly status report' },
    ],
    repeatCount: 12,
    repeatPeriod: 'last 12 weeks (every Monday)',
    confidence: 'very_high',
    suggestedFeature: 'custom_view',
    featureLabel: 'Custom View',
    agentNudge:
      '"Every Monday you visit all 4 tabs to check your family\'s weekly status. Want me to create a \'Weekly Pulse\' dashboard that shows everything in one view?"',
    whatItBuilds:
      'A Custom View called "Weekly Pulse" that aggregates: overdue reminders, upcoming items for the week, expiring policies, recent document activity, and overdue maintenance — all in one consolidated dashboard with trend indicators.',
    generatedConfig: `{
  "type": "custom_view",
  "name": "Weekly Pulse",
  "icon": "activity",
  "layout": "dashboard",
  "sections": [
    {
      "title": "Attention Needed",
      "type": "alert_list",
      "queries": [
        {
          "entity": "Reminder",
          "filter": { "isCompleted": false, "dueDate": { "$lt": "today" } },
          "label": "Overdue Reminders",
          "color": "red"
        },
        {
          "entity": "MaintenanceItem",
          "filter": { "nextDueDate": { "$lt": "today" }, "isActive": true },
          "label": "Overdue Maintenance",
          "color": "orange"
        }
      ]
    },
    {
      "title": "This Week",
      "type": "timeline",
      "query": {
        "entity": "Reminder",
        "filter": { "dueDate": { "$gte": "startOfWeek", "$lte": "endOfWeek" } },
        "sort": "dueDate"
      }
    },
    {
      "title": "Policy Watch",
      "type": "card_grid",
      "query": {
        "entity": "InsurancePolicy",
        "filter": { "endDate": { "$lte": "today + 60d" }, "status": "ACTIVE" },
        "sort": "endDate"
      }
    },
    {
      "title": "Recent Activity",
      "type": "activity_feed",
      "query": {
        "entities": ["Document", "MaintenanceLog", "Notification"],
        "filter": { "createdAt": { "$gte": "startOfWeek" } },
        "limit": 10
      }
    }
  ]
}`,
    refinement:
      '"You also checked the family calendar on Google every Monday. Should I integrate Google Calendar events into the Weekly Pulse view?"',
    impactMetric: '5-tab review → 1 glance, saves ~10 min every Monday',
  },
  {
    id: 'uc7',
    title: 'Auto-Assign Reminders by Category + Family Role',
    category: 'Reminders',
    categoryColor: 'from-cyan-500 to-cyan-600',
    categoryIcon: Users,
    observedPattern:
      'The user always assigns HEALTH reminders to Sarah (Parent), SCHOOL reminders to Emma (Member), VEHICLE reminders to John (Admin), and MAINTENANCE reminders to the entire family.',
    patternSteps: [
      { action: 'Create', detail: 'Creates a new reminder and selects a category' },
      { action: 'Assign', detail: 'Always assigns the same person based on category' },
      { action: 'Repeat', detail: 'This category→person mapping is consistent across 27 reminders' },
    ],
    repeatCount: 27,
    repeatPeriod: 'across all reminders created',
    confidence: 'very_high',
    suggestedFeature: 'workflow_rule',
    featureLabel: 'Workflow Rule',
    agentNudge:
      '"You always assign HEALTH tasks to Sarah, SCHOOL to Emma, VEHICLE to John, and MAINTENANCE to everyone. Want me to auto-assign reminders by category so you never have to pick assignees manually?"',
    whatItBuilds:
      'A Workflow Rule that triggers on Reminder.create, checks the category, and auto-populates the assignees field based on a learned category-to-member mapping.',
    generatedConfig: `{
  "type": "workflow_rule",
  "name": "Auto-Assign by Category",
  "trigger": {
    "entity": "Reminder",
    "event": "create"
  },
  "rules": [
    {
      "condition": { "field": "category", "equals": "HEALTH" },
      "action": { "type": "assign_to", "members": ["sarah_id"] }
    },
    {
      "condition": { "field": "category", "equals": "SCHOOL" },
      "action": { "type": "assign_to", "members": ["emma_id"] }
    },
    {
      "condition": { "field": "category", "equals": "VEHICLE" },
      "action": { "type": "assign_to", "members": ["john_id"] }
    },
    {
      "condition": { "field": "category", "equals": "MAINTENANCE" },
      "action": { "type": "assign_to_all", "scope": "family" }
    }
  ],
  "fallback": {
    "action": { "type": "assign_to", "members": ["admin"] }
  }
}`,
    refinement:
      '"Jake (Child) just started driving. Should I add VEHICLE assignments to include Jake as well?"',
    impactMetric: 'Eliminates manual assignee selection for 90% of reminders',
  },
  {
    id: 'uc8',
    title: 'Snooze Pattern → Smart Default Snooze Duration',
    category: 'Reminders',
    categoryColor: 'from-amber-500 to-amber-600',
    categoryIcon: Timer,
    observedPattern:
      'When snoozing reminders, the user always snoozes LOW priority items for 7 days, MEDIUM for 3 days, HIGH for 1 day, and never snoozes CRITICAL items. The platform currently defaults to 1 day for all.',
    patternSteps: [
      { action: 'Snooze', detail: 'Clicks snooze on a reminder' },
      { action: 'Change Duration', detail: 'Manually adjusts snooze duration from the default (1 day)' },
      { action: 'Pattern', detail: 'Duration consistently matches priority level' },
    ],
    repeatCount: 42,
    repeatPeriod: 'last 2 months',
    confidence: 'high',
    suggestedFeature: 'custom_function',
    featureLabel: 'Custom Function',
    agentNudge:
      '"You always snooze by priority — 7d for LOW, 3d for MEDIUM, 1d for HIGH, never for CRITICAL. Want me to make the snooze button smart so it auto-selects the right duration?"',
    whatItBuilds:
      'A Custom Function that overrides the default snooze behavior, automatically setting the duration based on the reminder\'s priority level, with a "confirm" step showing the suggested duration.',
    generatedConfig: `{
  "type": "custom_function",
  "name": "Smart Snooze",
  "trigger": "button_click:snooze",
  "entity": "Reminder",
  "logic": {
    "priority_duration_map": {
      "LOW": { "days": 7, "label": "1 week" },
      "MEDIUM": { "days": 3, "label": "3 days" },
      "HIGH": { "days": 1, "label": "1 day" },
      "CRITICAL": { "days": 0, "label": "Cannot snooze", "block": true }
    },
    "steps": [
      {
        "type": "lookup",
        "value": "priority_duration_map[record.priority]"
      },
      {
        "type": "confirm",
        "message": "Snooze for {{duration.label}}?",
        "allow_override": true
      },
      {
        "type": "field_update",
        "updates": {
          "isSnoozed": true,
          "snoozedUntil": "{{now + duration.days}}d"
        }
      }
    ]
  }
}`,
    refinement:
      '"You overrode the 7-day snooze for the pet vet appointment to 2 days. Should I treat PET category snoozes differently — shorter default?"',
    impactMetric: 'Removes manual duration selection, prevents snoozing critical items',
  },
];

// ─── Feature Badge Component ───

function FeatureBadge({ feature }: { feature: PlatformFeature }) {
  const config: Record<PlatformFeature, { label: string; icon: React.ElementType; gradient: string }> = {
    workflow_rule: { label: 'Workflow Rule', icon: Workflow, gradient: 'from-blue-500 to-blue-600' },
    scheduled_automation: { label: 'Scheduled Automation', icon: Timer, gradient: 'from-teal-500 to-teal-600' },
    custom_function: { label: 'Custom Function', icon: Code2, gradient: 'from-violet-500 to-violet-600' },
    custom_button: { label: 'Custom Button', icon: MousePointerClick, gradient: 'from-orange-500 to-orange-600' },
    field_update: { label: 'Auto Field Update', icon: RefreshCw, gradient: 'from-emerald-500 to-emerald-600' },
    custom_view: { label: 'Custom View', icon: Layers, gradient: 'from-indigo-500 to-indigo-600' },
  };
  const c = config[feature];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${c.gradient} shadow-sm`}>
      <c.icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

// ─── Confidence Indicator ───

function ConfidenceBar({ level }: { level: ConfidenceLevel }) {
  const configs: Record<ConfidenceLevel, { width: string; color: string; label: string; pct: string }> = {
    medium: { width: 'w-2/3', color: 'bg-amber-400', label: 'Medium', pct: '72%' },
    high: { width: 'w-5/6', color: 'bg-blue-500', label: 'High', pct: '88%' },
    very_high: { width: 'w-[95%]', color: 'bg-emerald-500', label: 'Very High', pct: '95%' },
  };
  const c = configs[level];
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${c.width} ${c.color} rounded-full transition-all duration-700`} />
      </div>
      <span className={`text-xs font-semibold ${c.color.replace('bg-', 'text-')}`}>
        {c.pct} {c.label}
      </span>
    </div>
  );
}

// ─── Pattern Steps Visual ───

function PatternStepsVisual({ steps }: { steps: PatternStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3 relative">
          {i < steps.length - 1 && (
            <div className="absolute left-[13px] top-7 w-0.5 h-[calc(100%-4px)] bg-gray-200" />
          )}
          <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 z-10">
            <span className="text-[10px] font-bold text-gray-500">{i + 1}</span>
          </div>
          <div className="pb-4">
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
              {step.action}
            </span>
            <p className="text-sm text-gray-500 mt-1">{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Use Case Card ───

function UseCaseCard({ useCase }: { useCase: UseCase }) {
  const [expanded, setExpanded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const Icon = useCase.categoryIcon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${useCase.categoryColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <FeatureBadge feature={useCase.suggestedFeature} />
              <span className="text-xs text-gray-400">{useCase.category}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{useCase.title}</h3>
          </div>
        </div>

        {/* Observed Pattern */}
        <div className="mt-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Observed Pattern</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{useCase.observedPattern}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-gray-600">
                <strong className="text-gray-900">{useCase.repeatCount}x</strong> {useCase.repeatPeriod}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-gray-600">Confidence:</span>
            </div>
          </div>
          <div className="mt-2">
            <ConfidenceBar level={useCase.confidence} />
          </div>
        </div>

        {/* Agent Nudge */}
        <div className="mt-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Agent Suggestion</span>
              <p className="text-sm text-gray-700 mt-1 italic leading-relaxed">{useCase.agentNudge}</p>
            </div>
          </div>
          {!deployed ? (
            <div className="flex items-center gap-2 mt-3 ml-11">
              <button
                onClick={() => setDeployed(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                Yes, build it!
              </button>
              <button className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                Not now
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-4 py-2 text-xs font-medium text-primary-600 hover:text-primary-700 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition"
              >
                Show me details
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3 ml-11 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Deployed & Active</span>
              <span className="text-xs text-emerald-500 ml-auto">{useCase.impactMetric}</span>
            </div>
          )}
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-4 text-xs font-medium text-gray-400 hover:text-gray-600 transition"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Hide details' : 'View pattern steps, generated config & refinement'}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50 space-y-5">
          {/* Pattern Steps */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Repetitive Steps Detected
            </h4>
            <PatternStepsVisual steps={useCase.patternSteps} />
          </div>

          {/* What It Builds */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              What the Agent Builds
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
              {useCase.whatItBuilds}
            </p>
          </div>

          {/* Generated Config */}
          <div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700 transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              Generated Configuration
              {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showConfig && (
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
                <code>{useCase.generatedConfig}</code>
              </pre>
            )}
          </div>

          {/* Continuous Refinement */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Continuous Refinement</span>
                <p className="text-sm text-amber-800 mt-1 italic">{useCase.refinement}</p>
              </div>
            </div>
          </div>

          {/* Impact */}
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Impact</span>
              <p className="text-sm font-medium text-emerald-800 mt-0.5">{useCase.impactMetric}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Agent Pipeline Visualization ───

function AgentPipeline() {
  const stages = [
    {
      icon: Eye,
      title: 'Observe',
      subtitle: 'Silent Tracking',
      description: 'Watches UI actions across all modules — field edits, navigation, clicks, and data entry patterns',
      color: 'from-gray-500 to-gray-600',
      detail: 'Zero setup, zero friction',
    },
    {
      icon: Brain,
      title: 'Detect',
      subtitle: 'Pattern Recognition',
      description: 'Identifies recurring action sequences with statistical confidence scoring',
      color: 'from-blue-500 to-blue-600',
      detail: 'ML-powered clustering',
    },
    {
      icon: Target,
      title: 'Match',
      subtitle: 'Feature Selection',
      description: 'Maps each pattern to the best platform primitive — workflow, automation, function, button, or view',
      color: 'from-violet-500 to-violet-600',
      detail: 'Right tool for the job',
    },
    {
      icon: Lightbulb,
      title: 'Suggest',
      subtitle: 'Contextual Nudge',
      description: 'Surfaces a non-intrusive suggestion with clear value proposition and one-click approval',
      color: 'from-amber-500 to-amber-600',
      detail: 'You stay in control',
    },
    {
      icon: Zap,
      title: 'Build',
      subtitle: 'Auto-Generate',
      description: 'Generates full configuration, deploys, and activates the customization instantly',
      color: 'from-emerald-500 to-emerald-600',
      detail: 'No admin console needed',
    },
    {
      icon: RefreshCw,
      title: 'Refine',
      subtitle: 'Continuous Learning',
      description: 'Monitors the deployed customization, catches edge cases, and proposes improvements',
      color: 'from-rose-500 to-rose-600',
      detail: 'Gets smarter over time',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        How the Copilot Works
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage, i) => (
          <div key={stage.title} className="relative group">
            {i < stages.length - 1 && (
              <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 z-10">
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </div>
            )}
            <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 transition">
              <div className={`w-16 h-16 bg-gradient-to-br ${stage.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stage.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mt-3 text-sm">{stage.title}</h3>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{stage.subtitle}</span>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{stage.description}</p>
              <span className="text-[10px] text-primary-500 font-medium mt-2 bg-primary-50 px-2 py-0.5 rounded-full">
                {stage.detail}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats Summary ───

function StatsSummary() {
  const stats = [
    { label: 'Patterns Detected', value: '8', icon: Eye, color: 'bg-blue-500', trend: 'Active' },
    { label: 'Platform Features Used', value: '6', icon: Layers, color: 'bg-violet-500', trend: 'Types' },
    { label: 'Steps Eliminated', value: '39', icon: Zap, color: 'bg-emerald-500', trend: 'Per month' },
    { label: 'Time Saved', value: '~3.5 hrs', icon: Clock, color: 'bg-amber-500', trend: 'Per month' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-400 font-medium">{stat.trend}</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Feature Distribution ───

function FeatureDistribution() {
  const features: { feature: PlatformFeature; count: number; examples: string[] }[] = [
    { feature: 'workflow_rule', count: 2, examples: ['Auto-escalate reminders', 'Auto-assign by category'] },
    { feature: 'scheduled_automation', count: 1, examples: ['Policy renewal reminders'] },
    { feature: 'custom_function', count: 2, examples: ['Cross-module renewal flow', 'Smart snooze'] },
    { feature: 'custom_button', count: 1, examples: ['Complete & Schedule Next'] },
    { feature: 'field_update', count: 1, examples: ['Auto-tag documents'] },
    { feature: 'custom_view', count: 1, examples: ['Weekly Pulse dashboard'] },
  ];

  const featureConfig: Record<PlatformFeature, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    workflow_rule: { label: 'Workflow Rules', icon: Workflow, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    scheduled_automation: { label: 'Scheduled Automations', icon: Timer, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    custom_function: { label: 'Custom Functions', icon: Code2, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
    custom_button: { label: 'Custom Buttons', icon: MousePointerClick, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    field_update: { label: 'Field Updates', icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    custom_view: { label: 'Custom Views', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-400" />
        Platform Features Suggested
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map(({ feature, count, examples }) => {
          const fc = featureConfig[feature];
          return (
            <div key={feature} className={`rounded-xl p-4 border ${fc.bg} transition hover:shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <fc.icon className={`w-5 h-5 ${fc.color}`} />
                <span className={`text-sm font-semibold ${fc.color}`}>{fc.label}</span>
                <span className={`ml-auto text-xs font-bold ${fc.color} bg-white/70 px-2 py-0.5 rounded-full`}>
                  {count}
                </span>
              </div>
              <ul className="space-y-1">
                {examples.map((ex) => (
                  <li key={ex} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <div className={`w-1 h-1 rounded-full ${fc.color.replace('text-', 'bg-')}`} />
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Live Agent Demo ───

function LiveAgentDemo() {
  const [stage, setStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const demoSteps = [
    {
      label: 'Observing user actions...',
      detail: 'User created a HEALTH reminder → assigned to Sarah → 14th time this pattern',
      icon: Eye,
      color: 'text-gray-500',
    },
    {
      label: 'Pattern detected!',
      detail: 'HEALTH category → Sarah (Parent) assignment, confidence: 95%',
      icon: Brain,
      color: 'text-blue-600',
    },
    {
      label: 'Matching platform feature...',
      detail: 'Best fit: Workflow Rule (conditional field/routing logic)',
      icon: Target,
      color: 'text-violet-600',
    },
    {
      label: 'Generating suggestion...',
      detail: '"You always assign HEALTH tasks to Sarah. Auto-assign?"',
      icon: Lightbulb,
      color: 'text-amber-600',
    },
    {
      label: 'User approved — building...',
      detail: 'Generating workflow rule configuration...',
      icon: Zap,
      color: 'text-emerald-600',
    },
    {
      label: 'Deployed & monitoring!',
      detail: 'Workflow active. Watching for edge cases...',
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
  ];

  function runDemo() {
    setIsRunning(true);
    setStage(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= demoSteps.length) {
        clearInterval(interval);
        setIsRunning(false);
      } else {
        setStage(current);
      }
    }, 1500);
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Live Agent Demo</h3>
            <p className="text-sm text-gray-400">Watch the Copilot detect a pattern in real-time</p>
          </div>
        </div>
        <button
          onClick={runDemo}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-xl text-sm font-medium transition"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Run Demo'}
        </button>
      </div>

      <div className="space-y-3">
        {demoSteps.map((step, i) => {
          const isActive = i === stage && isRunning;
          const isDone = i < stage || (!isRunning && stage === demoSteps.length - 1 && i <= stage);
          const isFuture = i > stage;

          return (
            <div
              key={i}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                isActive
                  ? 'bg-white/10 scale-[1.02]'
                  : isDone
                    ? 'bg-white/5 opacity-70'
                    : 'opacity-30'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDone ? 'bg-emerald-500/20' : isActive ? 'bg-white/10 animate-pulse' : 'bg-white/5'
              }`}>
                {isDone ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <step.icon className={`w-4 h-4 ${isActive ? step.color : 'text-gray-500'}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${isDone || isActive ? 'text-white' : 'text-gray-500'}`}>
                  {step.label}
                </div>
                <div className={`text-xs ${isDone || isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step.detail}
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Filter Tabs ───

function FilterTabs({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (v: string) => void;
}) {
  const filters = [
    { id: 'all', label: 'All Use Cases', count: useCases.length },
    { id: 'workflow_rule', label: 'Workflow Rules', count: useCases.filter((u) => u.suggestedFeature === 'workflow_rule').length },
    { id: 'scheduled_automation', label: 'Scheduled', count: useCases.filter((u) => u.suggestedFeature === 'scheduled_automation').length },
    { id: 'custom_function', label: 'Functions', count: useCases.filter((u) => u.suggestedFeature === 'custom_function').length },
    { id: 'custom_button', label: 'Buttons', count: useCases.filter((u) => u.suggestedFeature === 'custom_button').length },
    { id: 'field_update', label: 'Field Updates', count: useCases.filter((u) => u.suggestedFeature === 'field_update').length },
    { id: 'custom_view', label: 'Custom Views', count: useCases.filter((u) => u.suggestedFeature === 'custom_view').length },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border transition ${
            selected === f.id
              ? 'bg-primary-50 border-primary-300 text-primary-700 font-semibold'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          {f.label}
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            selected === f.id ? 'bg-primary-200 text-primary-800' : 'bg-gray-100 text-gray-500'
          }`}>
            {f.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ───

export default function CopilotPage() {
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'all'
      ? useCases
      : useCases.filter((u) => u.suggestedFeature === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-accent-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Customization Copilot</h1>
              <p className="text-gray-400 mt-1 text-lg">Observe. Detect. Build. Refine.</p>
            </div>
          </div>
          <p className="text-gray-300 max-w-3xl text-lg leading-relaxed">
            An intelligent agent that silently watches how you use Family Nudge, detects repetitive
            patterns, picks the right platform tool for the job, and auto-generates customizations —
            from workflow rules to custom functions — so you never repeat yourself.
          </p>
          <div className="flex items-center gap-4 mt-8 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Zero-setup observation</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <Brain className="w-5 h-5 text-violet-400" />
              <span className="text-sm">ML-powered pattern detection</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm">One-click deployment</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">Continuous refinement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <StatsSummary />

        {/* Pipeline */}
        <AgentPipeline />

        {/* Live Demo */}
        <LiveAgentDemo />

        {/* Feature Distribution */}
        <FeatureDistribution />

        {/* Use Cases Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Detected Patterns & Suggestions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Each card shows a real pattern the agent would detect, the platform feature it suggests, and the exact configuration it generates
              </p>
            </div>
          </div>

          <FilterTabs selected={filter} onChange={setFilter} />

          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            {filtered.map((uc) => (
              <UseCaseCard key={uc.id} useCase={uc} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No use cases match this filter</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white text-center shadow-lg">
          <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl font-bold">Customization shouldn't require expertise</h3>
          <p className="text-primary-100 mt-3 max-w-2xl mx-auto text-lg leading-relaxed">
            The Copilot flips the script — instead of users knowing what to automate and how, the agent
            observes, decides, picks the right platform tool, builds it, and keeps refining it.
            Zero admin console. Zero scripting knowledge. Just approval.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold">8</span>
              <span className="text-sm text-primary-200">Patterns Detected</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold">6</span>
              <span className="text-sm text-primary-200">Feature Types</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold">39</span>
              <span className="text-sm text-primary-200">Steps Automated</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold">~3.5h</span>
              <span className="text-sm text-primary-200">Saved Monthly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
