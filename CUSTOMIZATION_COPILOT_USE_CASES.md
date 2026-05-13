# Customization Copilot — Use Cases

> An agent that watches how users work and turns repetitive UI actions into platform-level customizations — zero setup, zero scripting.

---

## How It Works (Quick Recap)

```
Observe → Detect Pattern → Pick Platform Tool → Propose → Deploy → Refine
```

The agent silently monitors user behavior, identifies recurring sequences, maps them to the **best-fit platform primitive** (Workflow Rule, Field Update, Custom Function, Custom Button, Scheduled Automation, Custom View), proposes the automation in plain language, and deploys it on approval.

---

## Use Case Categories

| # | Use Case | Detected Pattern | Suggested Feature |
|---|----------|-----------------|-------------------|
| 1 | Auto-Tag High-Value Deals | Field update after threshold | **Field Update Rule** |
| 2 | Vendor Bill Routing | Route + tag after vendor match | **Workflow Rule** |
| 3 | Lead Score Recalculation | Cross-module math on change | **Custom Function** |
| 4 | Quick Convert + Assign | Repeated multi-step action | **Custom Button** |
| 5 | Stale Deal Cleanup | Time-based status changes | **Scheduled Automation** |
| 6 | Support Escalation Chain | Conditional multi-step routing | **Workflow Rule** |
| 7 | Invoice Tax Override | Conditional field calc | **Custom Function** |
| 8 | Daily Pipeline Snapshot | Recurring report extraction | **Scheduled Automation** |
| 9 | One-Click Quote PDF | Repeated generate + email | **Custom Button** |
| 10 | Smart Territory Assignment | Geo + rule-based field set | **Field Update Rule** |
| 11 | Cross-Module Contact Sync | Duplicate field entry across modules | **Custom Function** |
| 12 | Auto-Priority for Tickets | Pattern-based field setting | **Field Update Rule** |
| 13 | Deal Discount Approval Gate | Conditional hold + notify | **Workflow Rule** |
| 14 | Bulk Status Transition | Repeated list-view action | **Custom Button** |
| 15 | SLA Breach Alert | Time-based threshold trigger | **Scheduled Automation** |

---

## Detailed Use Cases

---

### USE CASE 1 — Auto-Tag High-Value Deals

**Module:** CRM — Deals

**What the agent observes:**
Every time a sales rep creates or updates a deal where the amount exceeds $50,000, they manually:
1. Open the deal record
2. Set the `Deal Priority` field to "High"
3. Set the `Review Required` checkbox to `true`
4. Add the tag "enterprise"

This sequence has been observed **34 times in the last 3 weeks** across 4 users, with 100% consistency when deal amount > $50K.

**Agent's nudge:**
> "I've noticed that every deal over $50,000 gets tagged as High priority with the enterprise label. Want me to create a field update rule that does this automatically whenever a deal is created or modified above that threshold?"

**Suggested platform feature:** **Field Update Rule**

**Generated configuration:**
```
Rule: Auto-Tag High-Value Deals
Trigger: On Create / On Edit
Module: Deals
Condition: Deal Amount > 50,000
Actions:
  → Set "Deal Priority" = "High"
  → Set "Review Required" = true
  → Add Tag "enterprise"
```

**Why Field Update (not Workflow):** No routing, no notifications, no cross-module logic — purely updating fields on the same record based on a value condition. A field update rule is the lightest-weight, most efficient primitive for this.

**Refinement cycle:**
After deployment, the agent notices the user still manually sets priority to "Medium" for deals between $25K–$50K. It proposes a tiered extension:
> "Want me to add a second tier? Deals between $25K and $50K get Priority = Medium automatically."

---

### USE CASE 2 — Vendor Bill Routing

**Module:** Finance — Bills / Accounts Payable

**What the agent observes:**
The accounts payable clerk processes incoming bills. For bills from vendors "Acme Corp", "GlobalParts Ltd", "Nexus Supply", and "Delta Logistics":
1. Sets `Project Code` to "PROJ-2024-INFRA"
2. Changes `Approval Route` to "Priya Sharma"
3. Adds internal note: "Infrastructure vendor — route to Priya"

Observed **23 times this month**, covering 92% of bills from these 4 vendors.

**Agent's nudge:**
> "Bills from Acme Corp, GlobalParts Ltd, Nexus Supply, and Delta Logistics always get Project Code PROJ-2024-INFRA and route to Priya Sharma. I can build a workflow rule that handles this automatically — including the internal note. Want me to set it up?"

**Suggested platform feature:** **Workflow Rule**

**Generated configuration:**
```
Rule: Route Infrastructure Vendor Bills
Trigger: On Create
Module: Bills
Condition: Vendor IN ["Acme Corp", "GlobalParts Ltd", "Nexus Supply", "Delta Logistics"]
Actions:
  → Field Update: "Project Code" = "PROJ-2024-INFRA"
  → Field Update: "Approval Route" = "Priya Sharma"
  → Add Note: "Infrastructure vendor — auto-routed to Priya"
  → Email Alert: Notify Priya Sharma of new bill
```

**Why Workflow Rule (not Field Update):** This involves routing (assignment to a person), notification (email alert), and a note — multiple action types beyond simple field changes. A workflow rule orchestrates these together.

**Refinement cycle:**
The agent detects that "Delta Logistics" bills under $500 are handled by the clerk directly without routing to Priya. It proposes:
> "Delta Logistics bills under $500 don't seem to need Priya's approval. Want me to add an exception so only bills >= $500 from Delta get routed?"

---

### USE CASE 3 — Lead Score Recalculation

**Module:** CRM — Leads + Activities + Emails

**What the agent observes:**
A sales manager periodically opens lead records and mentally calculates a "readiness score" based on:
- Number of emails opened (from the Emails module) — weighted ×2
- Number of calls logged (from Activities) — weighted ×5
- Days since last activity — penalty if > 14 days
- Whether the lead attended a webinar (custom field checkbox)

They then manually type the computed score into a `Lead Score` field. Observed **47 times over 2 weeks**, with the same formula applied consistently.

**Agent's nudge:**
> "I've reverse-engineered the scoring formula you use: (emails opened × 2) + (calls × 5) + (webinar bonus of 15) − (days-since-last-activity penalty). Want me to create a custom function that recalculates this automatically whenever a lead's activity changes?"

**Suggested platform feature:** **Custom Function (Deluge)**

**Generated configuration:**
```
Function: recalculate_lead_score
Trigger: On Edit (Leads), On Create (Activities linked to Lead)
Module: Leads

// Pseudocode
emails_opened = count(Emails where Lead = this_lead AND status = "opened")
calls_logged = count(Activities where Lead = this_lead AND type = "Call")
webinar_bonus = if(Lead.Attended_Webinar) then 15 else 0
days_since = daysBetween(Lead.Last_Activity_Date, today)
penalty = if(days_since > 14) then (days_since - 14) * 2 else 0

score = (emails_opened * 2) + (calls_logged * 5) + webinar_bonus - penalty

update Lead set Lead_Score = score
```

**Why Custom Function (not Workflow):** Cross-module data aggregation (Emails + Activities + Leads), arithmetic calculations, conditional logic with penalties — this exceeds what a simple workflow rule or field update can express. A Deluge custom function handles the computation natively.

**Refinement cycle:**
The agent notices the manager still manually adjusts scores for leads from the "Healthcare" industry (gives them +10 bonus). It proposes:
> "Looks like Healthcare leads get a +10 bump. Want me to add an industry multiplier to the scoring function?"

---

### USE CASE 4 — Quick Convert + Assign

**Module:** CRM — Leads

**What the agent observes:**
Senior sales reps frequently perform this exact sequence on qualified leads:
1. Click "Convert Lead" 
2. Create a new Deal with stage "Qualification"
3. Assign the deal to themselves
4. Set deal `Source` = Lead's source
5. Send a template email ("Welcome aboard — next steps")
6. Log a note: "Converted from lead — initial outreach sent"

This 6-step process takes ~90 seconds each time and has been performed **18 times this week** by the same rep, and **61 times this month** across the team.

**Agent's nudge:**
> "You convert leads the same way every time — create deal, assign to yourself, copy source, send the welcome email, log a note. Want me to add a 'Quick Convert' button that does all 6 steps in one click?"

**Suggested platform feature:** **Custom Button**

**Generated configuration:**
```
Button: "Quick Convert & Assign"
Location: Lead Detail View — Top Action Bar
Module: Leads

On Click:
  → Convert Lead to Contact + Deal
  → Set Deal.Stage = "Qualification"
  → Set Deal.Owner = Current User
  → Set Deal.Source = Lead.Source
  → Send Email (Template: "Welcome aboard — next steps")
  → Add Note to Deal: "Converted from lead — initial outreach sent"
  → Show success toast: "Lead converted and outreach sent"
```

**Why Custom Button (not Workflow):** This is a user-initiated action sequence, not an event-driven trigger. The user decides *when* to convert — they just want the mechanical steps collapsed into a single click. A custom button is the right primitive for on-demand, user-triggered multi-step actions.

**Refinement cycle:**
The agent observes that 30% of the time, reps change the deal stage to "Negotiation" instead of "Qualification" for leads tagged "hot". It proposes:
> "Want the button to auto-set stage to 'Negotiation' when the lead is tagged 'hot'? I can add that conditional logic."

---

### USE CASE 5 — Stale Deal Cleanup

**Module:** CRM — Deals

**What the agent observes:**
Every Monday morning, a sales ops manager:
1. Opens the Deals list view
2. Filters for deals with `Last Activity Date` older than 30 days
3. Changes their `Stage` to "On Hold"
4. Sends a bulk email to deal owners: "Your deal has been moved to On Hold due to inactivity"
5. Adds a note: "Auto-flagged for inactivity review"

Observed **every Monday for 6 consecutive weeks**, always between 9:00–9:30 AM.

**Agent's nudge:**
> "Every Monday at ~9 AM you flag stale deals older than 30 days, set them to On Hold, and notify owners. Want me to create a scheduled automation that runs this every Monday at 9 AM automatically?"

**Suggested platform feature:** **Scheduled Automation**

**Generated configuration:**
```
Automation: Weekly Stale Deal Cleanup
Schedule: Every Monday at 09:00 AM (user's timezone)
Module: Deals

Query: Deals WHERE Last_Activity_Date < (today - 30 days) 
                AND Stage NOT IN ["Closed Won", "Closed Lost", "On Hold"]

For each matching deal:
  → Set Stage = "On Hold"
  → Send Email to Deal.Owner (Template: "Inactivity notice")
  → Add Note: "Moved to On Hold — no activity for 30+ days"

Summary: Email sales ops manager with count of deals processed
```

**Why Scheduled Automation (not Workflow):** This is time-driven, not event-driven. There's no record create/edit that triggers it — it runs on a calendar schedule scanning for a condition. Scheduled automations are purpose-built for periodic batch operations.

**Refinement cycle:**
The agent notices the manager manually reactivates deals that received a reply in the last 48 hours. It proposes:
> "Want me to add a safety check? If the deal received an email reply in the last 48 hours, skip it instead of putting it On Hold."

---

### USE CASE 6 — Support Escalation Chain

**Module:** Help Desk — Tickets

**What the agent observes:**
Support agents handle ticket escalations manually:
1. When a ticket has `Priority` = "Urgent" and `Category` = "Billing"
2. They reassign it from Tier 1 to "Billing Specialists" team
3. Change `SLA Level` to "Premium"
4. Send an internal Slack-style notification to the team lead
5. If the customer is on an Enterprise plan, they also CC the account manager

Observed **38 times in the last month**, with the Enterprise plan CC step happening in 40% of cases.

**Agent's nudge:**
> "Urgent billing tickets always get routed to the Billing Specialists team with Premium SLA. Enterprise customers also get their account manager CC'd. Want me to create a workflow rule that handles this escalation chain automatically?"

**Suggested platform feature:** **Workflow Rule**

**Generated configuration:**
```
Rule: Urgent Billing Ticket Escalation
Trigger: On Create / On Edit (when Priority changes to "Urgent")
Module: Tickets
Condition: Priority = "Urgent" AND Category = "Billing"

Actions:
  → Reassign Owner to Team: "Billing Specialists"
  → Field Update: SLA Level = "Premium"
  → Instant Notification to Team Lead
  → Conditional Action:
      IF Contact.Plan = "Enterprise"
      THEN CC Account Manager (lookup from Accounts module)
```

**Why Workflow Rule:** Event-driven (ticket created/updated), conditional branching, multi-step actions including notifications and conditional CC — this is classic workflow territory.

**Refinement cycle:**
> "I've noticed 'Server Outage' tickets also follow a similar pattern but route to the Infrastructure team instead. Want me to create a parallel rule for that category?"

---

### USE CASE 7 — Invoice Tax Override for Exempt Accounts

**Module:** Finance — Invoices + Accounts

**What the agent observes:**
An accountant creates invoices and, for certain accounts flagged as tax-exempt:
1. Looks up the account's `Tax Exempt Certificate #`
2. Sets the invoice `Tax Rate` to 0%
3. Populates a `Tax Exemption Reference` field with the certificate number
4. Adjusts the `Grand Total` to remove the tax component
5. Adds a line note: "Tax exempt per certificate #[XYZ]"

Observed **19 times this month**, always for accounts where `Tax Exempt` = true in the Accounts module.

**Agent's nudge:**
> "When you invoice tax-exempt accounts, you always zero out the tax, pull in the certificate number, and recalculate the total. Want me to create a custom function that handles this automatically when an invoice is created for an exempt account?"

**Suggested platform feature:** **Custom Function (Deluge)**

**Generated configuration:**
```
Function: apply_tax_exemption
Trigger: On Create (Invoices)
Module: Invoices

// Pseudocode
account = lookup(Accounts, Invoice.Account_ID)
if (account.Tax_Exempt == true) {
    cert_number = account.Tax_Exempt_Certificate
    update Invoice set Tax_Rate = 0
    update Invoice set Tax_Exemption_Reference = cert_number
    update Invoice set Grand_Total = Invoice.Subtotal  // Remove tax
    add_line_note("Tax exempt per certificate #" + cert_number)
}
```

**Why Custom Function:** Cross-module lookup (Accounts → Invoices), arithmetic recalculation of totals, string concatenation for notes — requires procedural logic that field updates and simple workflows can't express.

---

### USE CASE 8 — Daily Pipeline Snapshot Email

**Module:** CRM — Deals (aggregate)

**What the agent observes:**
The VP of Sales opens the Deals dashboard every day at 8 AM and:
1. Filters deals by `Close Date` = this month
2. Notes total pipeline value, deal count by stage, and top 5 deals by amount
3. Copies this into an email and sends it to the leadership team

Observed **every weekday for 4 weeks**.

**Agent's nudge:**
> "You send a pipeline summary email every morning at 8 AM. Want me to schedule an automation that compiles the numbers and sends the report automatically?"

**Suggested platform feature:** **Scheduled Automation**

**Generated configuration:**
```
Automation: Daily Pipeline Snapshot
Schedule: Weekdays at 08:00 AM
Module: Deals

Actions:
  → Query: Deals WHERE Close_Date in THIS_MONTH
  → Aggregate: Total pipeline value, count by Stage
  → Sort: Top 5 by Amount (descending)
  → Compose email with formatted summary table
  → Send to: Leadership Distribution List
```

---

### USE CASE 9 — One-Click Quote Generation

**Module:** CRM — Deals + Quotes

**What the agent observes:**
When a deal reaches the "Proposal" stage, the sales rep:
1. Clicks into the deal
2. Creates a new Quote record linked to the deal
3. Copies all line items from the deal's Products sub-form
4. Generates a PDF using the "Standard Quote" template
5. Attaches the PDF to the deal record
6. Sends the PDF via email to the primary contact

Observed **27 times this month** across 5 reps, always when deal stage = "Proposal".

**Agent's nudge:**
> "Every time a deal hits 'Proposal', you create a quote, generate a PDF, and email it. Want me to add a 'Generate & Send Quote' button on the deal page?"

**Suggested platform feature:** **Custom Button**

**Generated configuration:**
```
Button: "Generate & Send Quote"
Location: Deal Detail View
Visibility: Show only when Stage = "Proposal"

On Click:
  → Create Quote linked to Deal
  → Copy line items from Deal.Products
  → Generate PDF (Template: "Standard Quote")
  → Attach PDF to Deal record
  → Send Email to Deal.Primary_Contact with PDF attachment
  → Toast: "Quote sent to [Contact Name]"
```

---

### USE CASE 10 — Smart Territory Assignment

**Module:** CRM — Leads / Contacts

**What the agent observes:**
When new leads come in, a sales ops coordinator:
1. Checks the lead's `State` field
2. Based on state, sets the `Territory` field (e.g., "West Coast", "Midwest", "Southeast")
3. Assigns the lead owner to the territory manager

The mapping is consistent: CA/OR/WA → "West Coast" (owner: Jake), IL/OH/MI → "Midwest" (owner: Sarah), FL/GA/NC → "Southeast" (owner: Marcus). Observed **56 times this month** with zero exceptions.

**Agent's nudge:**
> "Lead territory assignment follows a clear state-to-region mapping. I can create a field update rule that auto-assigns territory and owner based on the lead's state. Want me to set it up?"

**Suggested platform feature:** **Field Update Rule**

**Generated configuration:**
```
Rule: Auto-Assign Territory by State
Trigger: On Create
Module: Leads

Condition Set 1: State IN ["CA", "OR", "WA"]
  → Set Territory = "West Coast"
  → Set Owner = "Jake Thompson"

Condition Set 2: State IN ["IL", "OH", "MI"]
  → Set Territory = "Midwest"
  → Set Owner = "Sarah Chen"

Condition Set 3: State IN ["FL", "GA", "NC"]
  → Set Territory = "Southeast"
  → Set Owner = "Marcus Williams"
```

---

### USE CASE 11 — Cross-Module Contact Sync

**Module:** CRM — Contacts + Accounts + Deals

**What the agent observes:**
When a user updates a Contact's phone number or email, they also:
1. Navigate to the linked Account record and update the `Primary Contact Phone/Email`
2. Open each active Deal under that account and update the `Contact Email` field
3. Navigate to the linked Support Tickets and update the `Reporter Email`

Observed **14 times in 2 weeks** — the same data is manually copied to 3–4 related records every time.

**Agent's nudge:**
> "When you update a contact's phone or email, you always sync it to the linked Account, Deals, and Tickets. Want me to create a custom function that propagates contact changes across all linked records automatically?"

**Suggested platform feature:** **Custom Function (Deluge)**

**Generated configuration:**
```
Function: sync_contact_info_across_modules
Trigger: On Edit (Contacts) — when Phone or Email changes
Module: Contacts

// Pseudocode
if (old.Email != new.Email OR old.Phone != new.Phone) {
    // Update linked Account
    account = lookup(Accounts, Contact.Account_ID)
    if (account.Primary_Contact == Contact.ID) {
        update account set Primary_Contact_Email = new.Email
        update account set Primary_Contact_Phone = new.Phone
    }
    
    // Update active Deals
    deals = fetch(Deals WHERE Contact = Contact.ID AND Stage != "Closed")
    for each deal in deals {
        update deal set Contact_Email = new.Email
    }
    
    // Update open Tickets
    tickets = fetch(Tickets WHERE Reporter = Contact.ID AND Status != "Closed")
    for each ticket in tickets {
        update ticket set Reporter_Email = new.Email
    }
}
```

---

### USE CASE 12 — Auto-Priority for Support Tickets

**Module:** Help Desk — Tickets

**What the agent observes:**
Support agents set ticket priority based on implicit rules they follow in their heads:
- Subject contains "down" or "outage" or "can't login" → **Critical**
- Customer plan = "Enterprise" → bump priority by one level
- Ticket created outside business hours → **High** (if not already Critical)

Observed **over 100 assignments in 1 month** with 95% consistency.

**Agent's nudge:**
> "Your team sets ticket priority using a consistent pattern based on keywords, customer plan, and time of day. I can create a field update rule that applies these criteria automatically. Want me to build it?"

**Suggested platform feature:** **Field Update Rule**

**Generated configuration:**
```
Rule: Smart Ticket Priority
Trigger: On Create
Module: Tickets

Condition 1: Subject contains ("down" OR "outage" OR "can't login")
  → Set Priority = "Critical"

Condition 2: Contact.Account.Plan = "Enterprise" AND Priority != "Critical"
  → Bump Priority by 1 level

Condition 3: Created outside 9AM–6PM AND Priority NOT IN ["Critical", "High"]
  → Set Priority = "High"
```

---

### USE CASE 13 — Deal Discount Approval Gate

**Module:** CRM — Deals

**What the agent observes:**
When a sales rep sets a discount above 15%, the sales manager:
1. Gets a message from the rep (manually)
2. Opens the deal
3. Reviews the discount
4. Either approves (sets `Discount Approved` = true) or rejects (resets discount to 15%)
5. Sends an email to the rep with the decision

This back-and-forth happens **12 times a week**.

**Agent's nudge:**
> "Discounts over 15% always need manager approval, and it's handled via manual messages. Want me to create a workflow that automatically holds the deal, notifies the manager, and waits for approval?"

**Suggested platform feature:** **Workflow Rule (with Approval Process)**

**Generated configuration:**
```
Rule: Discount Approval Gate
Trigger: On Edit — when Discount_Percentage changes
Module: Deals
Condition: Discount_Percentage > 15

Actions:
  → Set Deal.Stage = "Pending Approval" (hold)
  → Set Discount_Approved = false
  → Notify Sales Manager with deal details + discount %
  → Create Approval Task assigned to Sales Manager
  
On Approval:
  → Set Discount_Approved = true
  → Restore Deal.Stage to previous value
  → Notify Rep: "Discount approved"

On Rejection:
  → Set Discount_Percentage = 15 (reset to max allowed)
  → Notify Rep: "Discount capped at 15% — manager declined"
```

---

### USE CASE 14 — Bulk Status Transition

**Module:** Project Management — Tasks

**What the agent observes:**
A project manager selects multiple tasks in list view at the end of each sprint and:
1. Changes `Status` from "In Review" to "Done"
2. Sets `Completed Date` to today
3. Clears the `Assignee` field
4. Adds a note: "Closed in Sprint [X] review"

Observed **every 2 weeks** (sprint cadence), processing 15–25 tasks each time.

**Agent's nudge:**
> "At the end of each sprint, you bulk-close reviewed tasks the same way. Want me to add a 'Close Sprint Tasks' button to the list view that handles all of this in one click?"

**Suggested platform feature:** **Custom Button (List View)**

**Generated configuration:**
```
Button: "Close Sprint Tasks"
Location: Tasks List View — Bulk Action Bar
Visibility: Show when selected tasks have Status = "In Review"

On Click (for each selected task):
  → Set Status = "Done"
  → Set Completed_Date = today()
  → Clear Assignee
  → Add Note: "Closed in sprint review — [current date]"
  → Show summary toast: "X tasks closed"
```

---

### USE CASE 15 — SLA Breach Alert

**Module:** Help Desk — Tickets

**What the agent observes:**
A support lead checks the ticket queue **3 times per day** and manually identifies tickets approaching their SLA deadline. For tickets within 2 hours of breach:
1. Sends a Slack/email alert to the assigned agent
2. CCs the team lead
3. Updates the ticket with a note: "SLA breach imminent — escalating"
4. Bumps priority to "Urgent" if not already

Observed **consistently for 5 weeks**, with the lead checking at ~10 AM, 2 PM, and 5 PM.

**Agent's nudge:**
> "You check for SLA-approaching tickets 3 times a day and manually escalate them. Want me to create a scheduled automation that runs every 2 hours, finds at-risk tickets, and handles the escalation automatically?"

**Suggested platform feature:** **Scheduled Automation**

**Generated configuration:**
```
Automation: SLA Breach Prevention
Schedule: Every 2 hours during business hours (9 AM – 6 PM)
Module: Tickets

Query: Tickets WHERE Status != "Closed" 
       AND SLA_Deadline < (now + 2 hours)
       AND SLA_Deadline > now
       AND SLA_Breached = false

For each matching ticket:
  → Set Priority = "Urgent" (if not already)
  → Send Alert to Ticket.Owner: "SLA breach in < 2 hours"
  → CC Team Lead
  → Add Note: "SLA breach imminent — auto-escalated"
```

---

## Pattern Detection Confidence Model

The agent uses a scoring model to decide when to surface a suggestion:

| Signal | Weight | Example |
|--------|--------|---------|
| **Repetition count** | High | Action performed 20+ times |
| **Consistency** | High | Same steps in same order, > 90% of the time |
| **User spread** | Medium | Multiple users doing the same thing |
| **Time pattern** | Medium | Always at 9 AM, always on Mondays |
| **Exception rate** | Negative | If 30% of cases diverge, lower confidence |
| **Recency** | Medium | Patterns from last 30 days weighted higher |

**Threshold to suggest:** Confidence score > 85% AND repetition count > 10.

---

## Platform Tool Selection Logic

```
Is the pattern user-initiated (on demand)?
  └─ YES → Custom Button
  └─ NO → Is it time-driven (recurring schedule)?
       └─ YES → Scheduled Automation
       └─ NO → Is it event-driven (record create/edit)?
            └─ YES → Does it require cross-module data or calculations?
                 └─ YES → Custom Function (Deluge)
                 └─ NO → Does it involve notifications, routing, or approvals?
                      └─ YES → Workflow Rule
                      └─ NO → Field Update Rule
```

---

## Agent Refinement Examples (Post-Deployment Learning)

| Original Automation | Edge Case Detected | Proposed Refinement |
|---------------------|-------------------|---------------------|
| Auto-tag deals > $50K as "High" | Deals from "Government" sector always set to "Critical" regardless of amount | Add sector-based override |
| Route vendor bills to Priya | New vendor "OmniTech" follows same pattern but isn't in the rule | Add OmniTech to vendor list |
| Weekly stale deal cleanup | Deals with scheduled follow-up calls still getting flagged | Exclude deals with future scheduled activities |
| SLA breach alert | Agent on PTO — alert goes to unavailable person | Route to backup agent when primary is OOO |
| Territory assignment by state | New states added (TX, AZ) not covered | Propose new territory "Southwest" or expand "West Coast" |

---

## Summary: The Agent's Superpower

Traditional customization requires users to:
1. **Know** a problem exists
2. **Know** which platform tool solves it
3. **Know** how to configure that tool
4. **Have** admin access to do it

The Customization Copilot flips every step:
1. **Detects** the problem through observation
2. **Selects** the right tool through reasoning
3. **Generates** the configuration automatically
4. **Deploys** it with one-click approval

> The best customization is the one the user never had to think about.
