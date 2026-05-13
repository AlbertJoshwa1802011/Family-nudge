# Customization Copilot — Use Cases

> An intelligent agent that observes how families use the platform, detects repetitive patterns, and auto-generates the right platform customization — workflow rules, field updates, custom functions, custom buttons, or scheduled automations.

---

## How to Read Each Use Case

Every use case follows this structure:

| Section | Meaning |
|---------|---------|
| **What the agent observes** | The raw user actions the agent silently tracks |
| **Pattern detected** | The recurring sequence the agent identifies with confidence |
| **Suggested platform feature** | Which primitive the agent picks and why |
| **Agent nudge** | The contextual message surfaced to the user |
| **What gets generated** | The exact configuration or code the agent builds |
| **Refinement loop** | How the agent watches and improves over time |

---

## Use Case 1 — Auto-Assign Reminders by Category

**Platform Feature: Field Update Rule**

### What the agent observes

Over four weeks, the ADMIN user creates 34 reminders. Every time the category
is `VEHICLE`, they manually set the assignee to the same family member (Dad).
Every time the category is `SCHOOL`, the assignee is always Mom. The pattern
holds with 100% consistency.

### Pattern detected

```
IF reminder.category == "VEHICLE"  → assignee is always User:dad_id   (17/17 times)
IF reminder.category == "SCHOOL"   → assignee is always User:mom_id   (12/12 times)
```

### Agent nudge

> "I noticed every Vehicle reminder gets assigned to Raj, and every School
> reminder goes to Priya — 29 times this month with no exceptions. Want me to
> auto-fill the assignee based on category?"

### What gets generated

A **Field Update Rule** on the `Reminder` entity:

```yaml
rule: auto-assign-by-category
trigger: on_create
entity: Reminder
conditions:
  - field: category
    operator: equals
    value: VEHICLE
actions:
  - type: field_update
    field: assigneeIds
    value: ["clx_raj_user_id"]

---
conditions:
  - field: category
    operator: equals
    value: SCHOOL
actions:
  - type: field_update
    field: assigneeIds
    value: ["clx_priya_user_id"]
```

### Refinement loop

Two weeks later, the user creates a `VEHICLE` reminder but reassigns it to
Mom. The agent catches the exception:

> "Your auto-assign rule fired for this Vehicle reminder, but you changed the
> assignee to Priya. Want me to add an exception when the title contains
> 'school carpool'?"

---

## Use Case 2 — Escalate Overdue High-Priority Reminders

**Platform Feature: Workflow Rule (multi-step)**

### What the agent observes

When a `HIGH` or `CRITICAL` reminder stays incomplete 2 days past its due date,
the ADMIN manually:
1. Changes the notification channel from `PUSH` to `["PUSH", "SMS", "WHATSAPP"]`
2. Re-triggers a notification
3. Adds a note in the description: "ESCALATED"

This sequence happens 11 times in 3 weeks.

### Pattern detected

```
IF reminder.priority IN ["HIGH", "CRITICAL"]
AND reminder.isCompleted == false
AND (now - reminder.dueDate) >= 2 days
THEN user manually escalates channels + re-notifies + tags description
→ 11/11 times, zero variance
```

### Agent nudge

> "High-priority reminders that stay overdue for 2+ days — you've manually
> escalated notification channels 11 times this month. Want me to create a
> workflow that auto-escalates and re-notifies after 48 hours?"

### What gets generated

A **Workflow Rule** with a time-based trigger:

```yaml
workflow: auto-escalate-overdue
trigger: time_based
schedule: every_6_hours
entity: Reminder
conditions:
  - field: priority
    operator: in
    values: [HIGH, CRITICAL]
  - field: isCompleted
    operator: equals
    value: false
  - field: dueDate
    operator: older_than
    value: 2d
  - field: channels
    operator: not_contains
    value: WHATSAPP
actions:
  - type: field_update
    field: channels
    value: ["PUSH", "SMS", "WHATSAPP"]
  - type: send_notification
    channel: SMS
    template: "OVERDUE: {{reminder.title}} was due {{reminder.dueDate | relative}}. Please complete it."
    recipients: assignees
  - type: field_append
    field: description
    value: "\n[Auto-escalated on {{now | date}}]"
```

### Refinement loop

The agent notices that for `CRITICAL` reminders the user escalates after just
1 day, not 2:

> "For Critical reminders you usually escalate within 24 hours, not 48. Want me
> to split this into two rules — 24h for Critical, 48h for High?"

---

## Use Case 3 — Policy Expiry → Renewal Reminder + Document Request

**Platform Feature: Custom Function (cross-module logic)**

### What the agent observes

Every time an `InsurancePolicy` reaches `EXPIRING_SOON` status, the ADMIN does
three things within 10 minutes:
1. Creates a new `Reminder` titled "Renew [policy name]" with category
   `INSURANCE`, priority `HIGH`, and due date = policy end date minus 7 days
2. Sends a WhatsApp notification to the family member linked to the policy
3. Uploads a placeholder document tagged `["renewal", "pending"]` in category
   `INSURANCE`

This 3-step dance happens for 8 out of 8 expiring policies.

### Pattern detected

```
WHEN policy.status transitions to EXPIRING_SOON
THEN user creates Reminder + sends WhatsApp + creates Document placeholder
→ 8/8 policies, within 10-minute window each time
```

### Agent nudge

> "Every time a policy is about to expire, you create a renewal reminder, send
> a WhatsApp message, and set up a document placeholder — all 8 times without
> fail. Want me to build a custom function that handles all three steps
> automatically?"

### What gets generated

A **Custom Function** triggered on policy status change:

```typescript
// Auto-generated Custom Function: policy-renewal-pipeline
// Trigger: InsurancePolicy.status changes to EXPIRING_SOON

async function onPolicyExpiringSoon(policy: InsurancePolicy, ctx: PlatformContext) {
  const renewalDate = subtractDays(policy.endDate, 7);
  const linkedMember = await ctx.getFamilyMember(policy.memberId);

  // Step 1: Create renewal reminder
  const reminder = await ctx.createReminder({
    title: `Renew ${policy.name}`,
    category: 'INSURANCE',
    priority: 'HIGH',
    frequency: 'ONCE',
    channels: ['PUSH', 'SMS', 'WHATSAPP'],
    dueDate: renewalDate,
    familyId: policy.familyId,
    assigneeIds: linkedMember ? [linkedMember.userId] : [],
  });

  // Step 2: Send immediate WhatsApp notification
  await ctx.sendNotification({
    userId: linkedMember?.userId ?? ctx.currentUser.id,
    channel: 'WHATSAPP',
    title: `Policy Renewal Due`,
    body: `Your ${policy.type} policy "${policy.name}" with ${policy.provider} expires on ${formatDate(policy.endDate)}. Renewal reminder created.`,
    metadata: { policyId: policy.id, reminderId: reminder.id },
  });

  // Step 3: Create document placeholder for renewal paperwork
  await ctx.createDocumentPlaceholder({
    name: `${policy.name} - Renewal ${formatYear(policy.endDate)}`,
    category: 'INSURANCE',
    tags: ['renewal', 'pending', policy.provider.toLowerCase()],
    familyId: policy.familyId,
    memberId: policy.memberId,
  });
}
```

### Refinement loop

After 2 months, the agent notices the user always edits the auto-created
reminder to also add `["CALL"]` channel for `HEALTH` insurance specifically:

> "For Health insurance renewals, you always add a phone call notification too.
> Want me to update the function to include CALL for health policies?"

---

## Use Case 4 — Quick-Complete Routine Maintenance

**Platform Feature: Custom Button**

### What the agent observes

Every Saturday morning, the ADMIN opens the maintenance list, selects the same
3 recurring items (Water Filter, AC Filter, Garden Sprinklers), marks each as
done by:
1. Creating a `MaintenanceLog` entry with `performedAt: today`, no cost, no notes
2. Advancing `nextDueDate` based on the item's frequency

This 3-item batch completion happens every week for 6 consecutive weeks.

### Pattern detected

```
EVERY Saturday (±1 day):
  FOR items [Water Filter, AC Filter, Garden Sprinklers]:
    user creates MaintenanceLog(performedAt=today, cost=null, notes=null)
    user updates nextDueDate
→ 6 consecutive weeks, same items, same no-cost/no-notes pattern
```

### Agent nudge

> "Every Saturday you mark the same 3 maintenance items as done — Water Filter,
> AC Filter, and Garden Sprinklers — with no cost or notes. Want me to add a
> 'Complete Weekly Routine' button that does all three in one tap?"

### What gets generated

A **Custom Button** on the Maintenance dashboard:

```yaml
button:
  name: "Complete Weekly Routine"
  icon: "check-circle"
  color: "#10B981"
  placement: maintenance_list_toolbar
  confirmation: "Mark Water Filter, AC Filter, and Garden Sprinklers as done for today?"
  action:
    type: batch_operation
    entity: MaintenanceItem
    targets:
      - id: clx_water_filter_id
      - id: clx_ac_filter_id
      - id: clx_garden_sprinklers_id
    operations:
      - create_log:
          performedAt: "{{now}}"
          performedBy: "{{currentUser.name}}"
          cost: null
          notes: null
      - update_item:
          lastDoneAt: "{{now}}"
          nextDueDate: "{{item.nextDueDate + item.frequency}}"
```

### Refinement loop

After a month, the user starts also completing a 4th item ("Smoke Detector
Check") every other Saturday:

> "You've started checking Smoke Detectors every 2 weeks alongside your weekly
> routine. Want me to add it to the button with a bi-weekly schedule, or create
> a separate 'Bi-Weekly Safety Check' button?"

---

## Use Case 5 — Smart Document Auto-Tagging

**Platform Feature: Field Update Rule**

### What the agent observes

When the user uploads documents, they consistently apply the same tags based on
document name patterns:
- Any document with "invoice" or "bill" in the name → tagged `["finance", "tax-relevant"]`
- Any document with "prescription" or "lab report" → tagged `["medical", "family-member-name"]`
- Any PDF over 2MB in the LEGAL category → tagged `["original", "keep-forever"]`

Over 45 uploads, these tagging patterns hold with 93% consistency.

### Pattern detected

```
IF document.name CONTAINS ["invoice", "bill"]
  → tags always include ["finance", "tax-relevant"]           (18/19 times)
IF document.name CONTAINS ["prescription", "lab report"]
  → tags always include ["medical"] + member name             (14/15 times)
IF document.category == "LEGAL" AND document.fileSize > 2MB
  → tags always include ["original", "keep-forever"]          (11/11 times)
```

### Agent nudge

> "I've seen you tag documents the same way 43 out of 45 times based on
> their name and category. Want me to auto-tag new uploads so you don't have
> to do it manually?"

### What gets generated

A **Field Update Rule** on the `Document` entity:

```yaml
rule: auto-tag-documents
trigger: on_create
entity: Document

rules:
  - name: financial-documents
    conditions:
      - field: name
        operator: contains_any
        values: ["invoice", "bill", "receipt", "statement"]
    actions:
      - type: field_merge
        field: tags
        value: ["finance", "tax-relevant"]

  - name: medical-documents
    conditions:
      - field: name
        operator: contains_any
        values: ["prescription", "lab report", "diagnosis", "medical"]
    actions:
      - type: field_merge
        field: tags
        value: ["medical"]
      - type: field_merge_dynamic
        field: tags
        value: "{{document.memberId | resolve_name | lowercase}}"

  - name: legal-originals
    conditions:
      - field: category
        operator: equals
        value: LEGAL
      - field: fileSize
        operator: greater_than
        value: 2097152
    actions:
      - type: field_merge
        field: tags
        value: ["original", "keep-forever"]
```

### Refinement loop

The agent notices 2 of the 45 uploads where the user removed the auto-applied
`tax-relevant` tag — both were personal reimbursement receipts:

> "You removed 'tax-relevant' from 2 receipts that were personal
> reimbursements. Want me to skip that tag when the document name includes
> 'personal' or 'reimbursement'?"

---

## Use Case 6 — After-Hours Reminder Snoozing

**Platform Feature: Scheduled Automation**

### What the agent observes

The user receives push notifications for `LOW` and `MEDIUM` priority reminders
between 9 PM and 7 AM. Every single time, they immediately snooze the reminder
to the next morning (7:30 AM). This happens 26 times in a month.

### Pattern detected

```
IF notification.sentAt BETWEEN 21:00 AND 07:00
AND reminder.priority IN ["LOW", "MEDIUM"]
THEN user snoozes to 07:30 next day
→ 26/26 times, no exceptions
```

### Agent nudge

> "You snooze every low and medium priority notification that arrives after
> 9 PM — all 26 times this month. Want me to set up a quiet hours rule that
> holds non-urgent notifications until 7:30 AM automatically?"

### What gets generated

A **Scheduled Automation** with notification filtering:

```yaml
automation: quiet-hours
type: scheduled_filter
schedule: "0 21 * * *"  # runs at 9 PM daily
duration: until_0730_next_day

conditions:
  - field: reminder.priority
    operator: in
    values: [LOW, MEDIUM]

actions:
  - type: hold_notifications
    channels: [PUSH, SMS]
    release_at: "07:30"
    release_timezone: "{{user.timezone}}"
  - type: auto_snooze
    field: snoozedUntil
    value: "{{next_day_0730}}"
    update_field: isSnoozed
    update_value: true

exceptions:
  - field: reminder.priority
    operator: in
    values: [HIGH, CRITICAL]
    action: deliver_immediately
```

### Refinement loop

During a school exam week, the user stops snoozing `SCHOOL` category reminders
even at night:

> "This week you've been checking School reminders even during quiet hours.
> Want me to exempt School-category reminders from quiet hours, or just
> temporarily during exam periods?"

---

## Use Case 7 — Vendor-Based Policy Grouping and Comparison View

**Platform Feature: Custom View**

### What the agent observes

The user repeatedly navigates to the policies list, filters by provider
("HDFC Life"), then by type ("HEALTH"), then sorts by `premiumAmount` descending.
They do this comparison flow 14 times in a month, each time for 2-3 different
providers.

### Pattern detected

```
User opens Policies → Filters by provider → Filters by type → Sorts by premium
→ 14 times, always same filter-sort sequence
→ Providers cycled: HDFC Life, LIC, ICICI Lombard
```

### Agent nudge

> "You compare insurance policies by provider and premium cost at least 3 times
> a week. Want me to create a 'Policy Comparison' view that groups policies by
> provider with premium rankings built in?"

### What gets generated

A **Custom View** definition:

```yaml
view: policy-comparison
entity: InsurancePolicy
placement: policies_tab
icon: "bar-chart-2"
label: "Compare by Provider"

layout: grouped_table
group_by: provider
sort_within_group:
  field: premiumAmount
  order: desc

columns:
  - field: name
    label: "Policy"
  - field: type
    label: "Type"
    filter: true
  - field: premiumAmount
    label: "Premium"
    format: currency
    highlight: max_in_group
  - field: premiumFrequency
    label: "Frequency"
  - field: endDate
    label: "Expires"
    format: relative_date
    conditional_color:
      red: "< 30 days"
      amber: "< 90 days"
  - field: status
    label: "Status"
    badge: true

summary_row:
  premiumAmount: sum
  label: "Total Premium per Provider"
```

### Refinement loop

The agent notices the user always opens individual policy documents right after
comparing:

> "After comparing policies, you usually open the linked documents. Want me to
> add a 'View Documents' quick-link column to the comparison view?"

---

## Use Case 8 — Cross-Module Linking: Document Upload → Policy Attachment

**Platform Feature: Custom Function (cross-module)**

### What the agent observes

When the user uploads a document in category `INSURANCE` with a tag matching a
provider name (e.g., "hdfc", "lic"), they always then navigate to the matching
`InsurancePolicy` and manually link the document. This 2-step cross-module
hop happens 19 times.

### Pattern detected

```
WHEN document uploaded with category=INSURANCE AND tags contain provider name
THEN within 3 minutes, user links document to matching policy
→ 19/19 times
```

### Agent nudge

> "Every time you upload an insurance document, you link it to the matching
> policy within minutes — 19 times without exception. Want me to auto-link
> insurance documents to their policies based on the provider tag?"

### What gets generated

A **Custom Function** on document upload:

```typescript
// Auto-generated: auto-link-insurance-documents
// Trigger: Document.onCreate WHERE category == 'INSURANCE'

async function autoLinkInsuranceDocument(doc: Document, ctx: PlatformContext) {
  const providerTags = doc.tags.filter(tag =>
    ctx.knownProviders.some(p => p.toLowerCase() === tag.toLowerCase())
  );

  if (providerTags.length === 0) return;

  const matchingPolicies = await ctx.findPolicies({
    familyId: doc.familyId,
    provider: { in: providerTags, mode: 'insensitive' },
    status: { in: ['ACTIVE', 'EXPIRING_SOON', 'PENDING_RENEWAL'] },
  });

  for (const policy of matchingPolicies) {
    await ctx.linkDocumentToPolicy(doc.id, policy.id);

    await ctx.createAuditLog({
      documentId: doc.id,
      userId: ctx.currentUser.id,
      action: 'UPDATE',
      metadata: {
        autoLinked: true,
        policyId: policy.id,
        policyName: policy.name,
        matchedOn: 'provider_tag',
      },
    });
  }

  if (matchingPolicies.length > 0) {
    await ctx.showToast({
      type: 'success',
      message: `Auto-linked to ${matchingPolicies.length} policy(ies): ${matchingPolicies.map(p => p.name).join(', ')}`,
    });
  }
}
```

### Refinement loop

The agent detects that for one provider ("Star Health"), the tag used is
sometimes "star" and sometimes "star-health":

> "Documents tagged 'star' and 'star-health' both get linked to Star Health
> policies. Want me to treat those as aliases so matching is more reliable?"

---

## Use Case 9 — Reminder Completion → Maintenance Log Sync

**Platform Feature: Workflow Rule (cross-module)**

### What the agent observes

When a reminder with category `MAINTENANCE` is marked complete, the user
always navigates to the Maintenance module, finds the matching item, and
creates a `MaintenanceLog` entry with the same completion date. This cross-module
sync happens 22 times.

### Pattern detected

```
WHEN reminder.category == "MAINTENANCE" AND reminder.isCompleted set to true
THEN within 5 minutes, user creates MaintenanceLog for matching MaintenanceItem
  WITH performedAt = reminder.completedAt
→ 22/22 times
```

### Agent nudge

> "Every time you complete a Maintenance reminder, you log it in the
> Maintenance tracker too — 22 times with the same date. Want me to create a
> workflow that auto-logs maintenance completion when you finish the reminder?"

### What gets generated

A **Workflow Rule** with cross-module action:

```yaml
workflow: sync-reminder-to-maintenance
trigger: field_change
entity: Reminder
watch_field: isCompleted
from: false
to: true

conditions:
  - field: category
    operator: equals
    value: MAINTENANCE

actions:
  - type: find_related
    entity: MaintenanceItem
    match:
      - reminder_field: title
        maintenance_field: name
        operator: fuzzy_match
        threshold: 0.8
      - reminder_field: familyId
        maintenance_field: familyId
        operator: equals
    store_as: matched_item

  - type: create_record
    entity: MaintenanceLog
    condition: "{{matched_item}} exists"
    fields:
      itemId: "{{matched_item.id}}"
      performedAt: "{{reminder.completedAt}}"
      performedBy: "{{currentUser.firstName}}"
      notes: "Auto-logged from reminder: {{reminder.title}}"

  - type: field_update
    entity: MaintenanceItem
    target: "{{matched_item.id}}"
    fields:
      lastDoneAt: "{{reminder.completedAt}}"
      nextDueDate: "{{matched_item.nextDueDate + matched_item.frequency}}"
```

### Refinement loop

The agent notices the user sometimes adds cost to the maintenance log 10
minutes after the auto-log:

> "You've added costs to 6 of the 22 auto-logged entries after the fact.
> Want me to show a quick cost input prompt when the maintenance log is
> auto-created, instead of a fully silent sync?"

---

## Use Case 10 — Priority Override for Specific Family Members

**Platform Feature: Field Update Rule (conditional)**

### What the agent observes

When creating reminders assigned to the CHILD role family member, the user
always changes the priority from whatever they initially select to `HIGH` and
adds `SMS` to channels. This manual override happens every time — 15/15
child-assigned reminders.

### Pattern detected

```
IF reminder.assigneeIds includes user with role=CHILD
THEN priority is always manually set to HIGH
AND channels always include SMS (even if initially set to PUSH only)
→ 15/15 times
```

### Agent nudge

> "Reminders for Arjun (your child account) are always set to High priority
> with SMS notifications — you've done this 15 times. Want me to automatically
> apply these settings when creating reminders for child members?"

### What gets generated

A **Field Update Rule** with role-based conditions:

```yaml
rule: child-member-priority-boost
trigger: on_create_or_update
entity: Reminder

conditions:
  - field: assigneeIds
    operator: includes_user_with_role
    value: CHILD

actions:
  - type: field_update
    field: priority
    value: HIGH
    only_if_lower: true  # Don't downgrade CRITICAL to HIGH
  - type: field_merge
    field: channels
    value: ["SMS"]  # Adds SMS if not already present
```

### Refinement loop

When the child member gets older and the user starts setting some reminders to
`MEDIUM`:

> "You've set 3 recent reminders for Arjun to Medium priority instead of
> High. Is the auto-boost still needed, or should I tone it down to only
> boost LOW→MEDIUM for child reminders?"

---

## Use Case 11 — Bulk Notification Preferences by Time of Day

**Platform Feature: Custom Function (context-aware)**

### What the agent observes

The user has a distinct pattern in how they choose notification channels based
on time of day:
- Morning reminders (due 6 AM–12 PM): always `PUSH` only
- Afternoon reminders (due 12 PM–6 PM): always `PUSH` + `SMS`
- Evening/weekend reminders: always `PUSH` + `SMS` + `WHATSAPP`

This time-aware channel selection holds across 38 reminders.

### Pattern detected

```
IF reminder.dueDate.time BETWEEN 06:00 AND 12:00 → channels = [PUSH]
IF reminder.dueDate.time BETWEEN 12:00 AND 18:00 → channels = [PUSH, SMS]
IF reminder.dueDate.time >= 18:00 OR weekend     → channels = [PUSH, SMS, WHATSAPP]
→ 35/38 times (92% confidence)
```

### Agent nudge

> "Your notification channel choices follow a time-of-day pattern — lighter in
> the morning, more aggressive in the evening. I've seen this 35 out of 38
> times. Want me to auto-set channels based on when the reminder is due?"

### What gets generated

A **Custom Function** on reminder creation:

```typescript
// Auto-generated: time-aware-channel-defaults
// Trigger: Reminder.onCreate (before save)

function setChannelsByTimeOfDay(reminder: Reminder, ctx: PlatformContext) {
  const hour = reminder.dueDate.getHours();
  const isWeekend = [0, 6].includes(reminder.dueDate.getDay());

  // User's observed preference pattern
  if (isWeekend || hour >= 18) {
    reminder.channels = ['PUSH', 'SMS', 'WHATSAPP'];
  } else if (hour >= 12) {
    reminder.channels = ['PUSH', 'SMS'];
  } else {
    reminder.channels = ['PUSH'];
  }

  // Never override explicitly set CRITICAL escalation
  if (reminder.priority === 'CRITICAL') {
    reminder.channels = ['PUSH', 'SMS', 'WHATSAPP', 'CALL'];
  }

  return reminder;
}
```

### Refinement loop

> "You set a morning reminder to PUSH+SMS last week — the first exception in
> 40 reminders. Was that intentional, or should morning defaults stay
> PUSH-only?"

---

## Use Case 12 — One-Click "Family Emergency Pack"

**Platform Feature: Custom Button (multi-entity)**

### What the agent observes

Three times in the past 2 months, during urgent situations, the user rapidly:
1. Downloads all `IDENTITY` category documents for the family
2. Views all `ACTIVE` insurance policies
3. Exports emergency contact details (family members with phone numbers)

Each time, the same 3-step sequence takes 8-12 minutes of manual navigation.

### Pattern detected

```
WHEN user downloads 3+ IDENTITY docs within 2 minutes
AND views ACTIVE policies within next 3 minutes
AND accesses family member contact list within next 3 minutes
→ "Emergency information gathering" pattern, 3/3 times
```

### Agent nudge

> "I've seen you gather identity documents, active policies, and emergency
> contacts together 3 times — looks like an emergency info pack. Want me to
> add a 'Family Emergency Pack' button that bundles everything in one tap?"

### What gets generated

A **Custom Button** on the family dashboard:

```yaml
button:
  name: "Family Emergency Pack"
  icon: "shield-alert"
  color: "#DC2626"
  placement: family_dashboard_header
  confirmation: "Generate emergency pack with all identity docs, active policies, and contacts?"
  action:
    type: composite
    steps:
      - type: query_and_bundle
        entity: Document
        conditions:
          - field: category
            operator: equals
            value: IDENTITY
          - field: isArchived
            operator: equals
            value: false
        action: prepare_download_zip
        zip_name: "emergency-identity-docs-{{now | date}}"

      - type: query_and_render
        entity: InsurancePolicy
        conditions:
          - field: status
            operator: in
            values: [ACTIVE, EXPIRING_SOON]
        render: summary_pdf
        include_fields: [name, type, provider, policyNumber, endDate, coverageDetails]

      - type: query_and_render
        entity: FamilyMember
        conditions:
          - field: isActive
            operator: equals
            value: true
        render: contact_card_list
        include_fields: [user.firstName, user.lastName, user.phone, user.email, role]

      - type: deliver
        format: combined_zip
        filename: "family-emergency-pack-{{now | date}}.zip"

  audit:
    log: true
    action: "EMERGENCY_PACK_GENERATED"
```

### Refinement loop

> "You also checked Arjun's medical documents during the last emergency
> download. Want me to add MEDICAL category documents for child members to
> the emergency pack?"

---

## Summary Matrix

| # | Use Case | Pattern Type | Platform Feature | Trigger |
|---|----------|-------------|-----------------|---------|
| 1 | Auto-assign by category | Same field value per category | **Field Update Rule** | On create |
| 2 | Escalate overdue reminders | Time-delayed manual intervention | **Workflow Rule** | Time-based |
| 3 | Policy expiry pipeline | Cross-module sequence | **Custom Function** | Status change |
| 4 | Weekly maintenance batch | Recurring same-day batch | **Custom Button** | User-initiated |
| 5 | Document auto-tagging | Name-based tag patterns | **Field Update Rule** | On create |
| 6 | Quiet hours snoozing | Time-of-day dismissals | **Scheduled Automation** | Cron schedule |
| 7 | Policy comparison view | Repeated filter-sort sequence | **Custom View** | Navigation pattern |
| 8 | Insurance doc auto-linking | Cross-module manual link | **Custom Function** | On create |
| 9 | Reminder→Maintenance sync | Cross-module completion sync | **Workflow Rule** | Field change |
| 10 | Child member priority boost | Role-based field override | **Field Update Rule** | On create/update |
| 11 | Time-aware channel defaults | Time-of-day preference | **Custom Function** | Before save |
| 12 | Emergency info pack | Multi-entity rapid access | **Custom Button** | User-initiated |

---

## Agent Confidence Thresholds

The agent uses these thresholds to decide when to surface a suggestion:

| Confidence Level | Minimum Occurrences | Consistency Rate | Action |
|-----------------|---------------------|-----------------|--------|
| **Observe** | 1–5 times | Any | Silent tracking |
| **Candidate** | 6–10 times | ≥ 80% | Internal flag, no nudge yet |
| **Suggest** | 11+ times | ≥ 85% | Surface nudge to user |
| **Strong Recommend** | 20+ times | ≥ 95% | Nudge with "highly recommended" badge |

The agent never auto-deploys without user approval. One tap = generation +
deployment + activation. Zero admin console interaction needed.
