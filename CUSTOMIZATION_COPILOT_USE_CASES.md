# Customization Copilot — Use Cases & Pattern Detection Scenarios

> **Agent Hackathon Concept:** An AI agent that silently observes user behavior across a platform, detects repetitive action patterns, and auto-generates the right platform customization — workflow rules, field updates, custom functions, custom buttons, scheduled automations, or custom views — with a single approval.

---

## Table of Contents

1. [Field Update & Auto-Fill Suggestions](#1-field-update--auto-fill-suggestions)
2. [Workflow Rule Suggestions](#2-workflow-rule-suggestions)
3. [Custom Function / Deluge Script Suggestions](#3-custom-function--deluge-script-suggestions)
4. [Custom Button Suggestions](#4-custom-button-suggestions)
5. [Scheduled Automation Suggestions](#5-scheduled-automation-suggestions)
6. [Custom View Suggestions](#6-custom-view-suggestions)
7. [Cross-Module Orchestration Suggestions](#7-cross-module-orchestration-suggestions)
8. [Refinement & Edge-Case Learning](#8-refinement--edge-case-learning)

---

## 1. Field Update & Auto-Fill Suggestions

These are patterns where the agent notices a user manually setting the same field value under the same conditions, over and over.

---

### Use Case 1.1 — Payment Terms Auto-Fill by Deal Size

**Observed Pattern:**
The agent notices that sales rep Ankit opens deals worth > $25,000 and manually sets the "Payment Terms" field to "Net 45" — 31 out of 34 times this month.

**Agent Nudge:**
> *"I noticed you set Payment Terms to 'Net 45' for deals above $25K almost every time. Want me to create a field update rule that auto-fills this for you?"*

**Platform Tool Generated:** `Field Update Rule`
```
IF Deal.Amount > 25000
THEN SET Deal.Payment_Terms = "Net 45"
```

---

### Use Case 1.2 — Auto-Tag Industry on Lead Creation

**Observed Pattern:**
Marketing coordinator Meera creates leads from trade show lists. Every time the company name contains "Pharma", "Biotech", or "Life Sciences", she manually sets the Industry field to "Healthcare". Detected 47 times across 3 weeks.

**Agent Nudge:**
> *"Leads with 'Pharma', 'Biotech', or 'Life Sciences' in the company name always get tagged as Healthcare industry. Should I auto-tag these on creation?"*

**Platform Tool Generated:** `Workflow Rule (on create)`
```
IF Lead.Company_Name CONTAINS ["Pharma", "Biotech", "Life Sciences"]
THEN SET Lead.Industry = "Healthcare"
```

---

### Use Case 1.3 — Default Owner Assignment by Territory

**Observed Pattern:**
Admin Ritu manually reassigns every new account from the Asia-Pacific region to rep Kavya. This pattern has occurred 19 times with 100% consistency.

**Agent Nudge:**
> *"Every APAC account gets reassigned to Kavya. Want me to set her as the default owner for accounts in the Asia-Pacific territory?"*

**Platform Tool Generated:** `Assignment Rule`
```
IF Account.Region = "Asia-Pacific"
THEN SET Account.Owner = "Kavya Sharma"
```

---

### Use Case 1.4 — Priority Escalation by Keyword

**Observed Pattern:**
Support agent Dev opens new tickets and manually changes priority from "Normal" to "Urgent" whenever the subject line contains "server down", "outage", or "production issue". Detected 28 times this month.

**Agent Nudge:**
> *"Tickets mentioning outage-related keywords always get marked Urgent. Should I auto-set priority for these?"*

**Platform Tool Generated:** `Field Update Rule (on create)`
```
IF Ticket.Subject CONTAINS_ANY ["server down", "outage", "production issue", "system down"]
THEN SET Ticket.Priority = "Urgent"
```

---

## 2. Workflow Rule Suggestions

These are patterns where the agent detects conditional routing, approval chains, or status transitions that repeat consistently.

---

### Use Case 2.1 — Vendor Bill Routing to Specific Approver

**Observed Pattern:**
Accounts payable clerk Sana receives bills from vendors Acme Corp, TechFlow, GreenSupply, and DataBridge. Every single time, she manually routes them to finance manager Priya for approval, adds the project code "INFRA-2026", and tags them as "Operational". This has happened 23 times this month.

**Agent Nudge:**
> *"Bills from Acme Corp, TechFlow, GreenSupply, and DataBridge always go to Priya with project code INFRA-2026. Want me to build a workflow that handles this automatically?"*

**Platform Tool Generated:** `Workflow Rule (multi-action)`
```
TRIGGER: Bill.Created
IF Bill.Vendor IN ["Acme Corp", "TechFlow", "GreenSupply", "DataBridge"]
THEN:
  SET Bill.Project_Code = "INFRA-2026"
  SET Bill.Category = "Operational"
  ROUTE Bill.Approval → "Priya Menon"
```

---

### Use Case 2.2 — Deal Stage Advancement with Notification

**Observed Pattern:**
Sales manager Rohit reviews deals that have had a demo completed (tracked by a checkbox). When the demo is marked complete AND the deal value exceeds $10,000, he always moves the stage from "Qualification" to "Proposal" and sends a Slack notification to the solutions team. Detected 16 times this quarter.

**Agent Nudge:**
> *"After demo completion on deals > $10K, you always advance to Proposal stage and notify Solutions. Should I automate this workflow?"*

**Platform Tool Generated:** `Workflow Rule (on field update)`
```
TRIGGER: Deal.Demo_Completed changed to TRUE
IF Deal.Amount > 10000 AND Deal.Stage = "Qualification"
THEN:
  SET Deal.Stage = "Proposal"
  SEND Notification → Solutions Team Channel
  CREATE Task "Prepare Proposal" assigned to Deal.Owner, due in 3 days
```

---

### Use Case 2.3 — SLA-Based Ticket Escalation

**Observed Pattern:**
Team lead Farah checks tickets every few hours. When a ticket has been in "Waiting on Support" for more than 4 hours and the customer is on a Premium plan, she manually reassigns it to a senior engineer and changes priority to "High". Detected 34 times across 2 weeks.

**Agent Nudge:**
> *"Premium tickets stuck in 'Waiting on Support' for 4+ hours always get escalated to a senior engineer. Want me to create an automatic escalation rule?"*

**Platform Tool Generated:** `Escalation Rule (time-based workflow)`
```
TRIGGER: Ticket.Status = "Waiting on Support" FOR > 4 hours
IF Ticket.Customer.Plan = "Premium"
THEN:
  SET Ticket.Priority = "High"
  REASSIGN Ticket → Senior Engineer Pool
  SEND Alert → Team Lead
```

---

### Use Case 2.4 — Auto-Close Stale Quotes

**Observed Pattern:**
Sales ops lead Nisha runs through open quotes every Friday. If a quote has been in "Sent" status for over 30 days with no customer response, she changes the status to "Expired" and sends a follow-up email to the customer. This has happened 12 times consistently over 6 weeks.

**Agent Nudge:**
> *"Quotes in 'Sent' status for 30+ days always get marked Expired with a follow-up email. Should I set this up as an automatic workflow?"*

**Platform Tool Generated:** `Workflow Rule (time-based)`
```
TRIGGER: Quote.Status = "Sent" FOR > 30 days
IF Quote.Last_Customer_Response = NULL within 30 days
THEN:
  SET Quote.Status = "Expired"
  SEND Email Template "Quote Expiry Notice" → Quote.Contact
  NOTIFY Quote.Owner "Quote #{Quote.Number} auto-expired"
```

---

## 3. Custom Function / Deluge Script Suggestions

These are patterns involving calculations, cross-module updates, data transformations, or complex business logic that go beyond simple field updates.

---

### Use Case 3.1 — Commission Calculation on Deal Close

**Observed Pattern:**
Finance coordinator Lisa manually calculates sales commission every time a deal closes. The formula: 8% for deals under $50K, 10% for $50K-$100K, 12% for deals above $100K. She then updates a custom "Commission Amount" field on the deal and creates a record in the Payroll module. Detected 41 times this quarter across 6 reps.

**Agent Nudge:**
> *"You're manually calculating commission on every closed deal using a tiered formula, then updating Payroll. Want me to create a custom function that handles this automatically?"*

**Platform Tool Generated:** `Custom Function (on Deal close)`
```python
# Triggered when Deal.Stage changes to "Closed Won"

def calculate_commission(deal):
    amount = deal.Amount
    
    if amount < 50000:
        rate = 0.08
    elif amount <= 100000:
        rate = 0.10
    else:
        rate = 0.12
    
    commission = amount * rate
    
    # Update deal record
    deal.Commission_Amount = commission
    deal.save()
    
    # Create payroll entry
    Payroll.create(
        employee=deal.Owner,
        type="Commission",
        amount=commission,
        reference=f"Deal #{deal.Number}",
        period=current_month()
    )
```

---

### Use Case 3.2 — Cross-Module Project Setup on Deal Close

**Observed Pattern:**
Project manager Arun performs a 6-step sequence every time a deal closes: (1) creates a new Project in the Projects module, (2) copies the deal's line items as project milestones, (3) assigns the account manager as project owner, (4) sets the project deadline to deal close date + 90 days, (5) creates 3 standard onboarding tasks, and (6) sends a kickoff email to the customer. Detected 11 times in the last 2 months, always identical.

**Agent Nudge:**
> *"Every closed deal triggers the same 6-step project setup. Want me to build a custom function that handles the full sequence — project creation, milestone setup, task generation, and kickoff email — in one go?"*

**Platform Tool Generated:** `Custom Function (cross-module orchestration)`
```python
def on_deal_close(deal):
    # 1. Create Project
    project = Projects.create(
        name=f"Implementation - {deal.Account.Name}",
        customer=deal.Account,
        owner=deal.Account_Manager,
        deadline=deal.Close_Date + days(90),
        budget=deal.Amount
    )
    
    # 2. Convert line items to milestones
    for item in deal.Line_Items:
        project.add_milestone(
            name=item.Product_Name,
            value=item.Amount,
            due_date=deal.Close_Date + days(item.Delivery_SLA_Days)
        )
    
    # 3. Create standard onboarding tasks
    standard_tasks = [
        ("Kickoff Call", 3), ("Requirements Gathering", 7), 
        ("Environment Setup", 14)
    ]
    for task_name, offset in standard_tasks:
        Tasks.create(
            title=task_name,
            project=project,
            assigned_to=project.Owner,
            due_date=deal.Close_Date + days(offset)
        )
    
    # 4. Send kickoff email
    send_email(
        to=deal.Contact.Email,
        template="Project Kickoff",
        variables={"project_name": project.Name, "manager": project.Owner.Name}
    )
```

---

### Use Case 3.3 — Inventory Reorder Calculation

**Observed Pattern:**
Warehouse manager Vikram checks inventory levels daily. When stock for any SKU drops below its reorder point, he calculates the order quantity using the formula: (Monthly Avg Sales × 2) − Current Stock, then creates a purchase order with the preferred vendor. Detected across 8 SKUs, 26 times this month.

**Agent Nudge:**
> *"You're manually calculating reorder quantities and creating POs when stock runs low. Want me to automate this with a custom function that monitors stock levels?"*

**Platform Tool Generated:** `Custom Function (event-driven)`
```python
def check_reorder(inventory_item):
    if inventory_item.Current_Stock <= inventory_item.Reorder_Point:
        monthly_avg = inventory_item.sales_last_90_days() / 3
        order_qty = (monthly_avg * 2) - inventory_item.Current_Stock
        
        PurchaseOrder.create(
            vendor=inventory_item.Preferred_Vendor,
            items=[{
                "sku": inventory_item.SKU,
                "quantity": ceil(order_qty),
                "unit_price": inventory_item.Last_Purchase_Price
            }],
            expected_date=today() + days(inventory_item.Lead_Time_Days)
        )
```

---

### Use Case 3.4 — Lead Scoring Composite Calculation

**Observed Pattern:**
Marketing analyst Priya manually scores leads every morning. She checks email opens (5 pts each), website visits (3 pts each), content downloads (10 pts each), webinar attendance (15 pts), and demo requests (25 pts). She sums these up, writes the score in a custom field, and moves leads scoring > 50 to "Sales Ready". Detected daily for 4 weeks across 200+ leads.

**Agent Nudge:**
> *"You're computing lead scores from 5 activity signals every morning and qualifying leads above 50. Want me to create a function that auto-scores leads in real time as activities happen?"*

**Platform Tool Generated:** `Custom Function (real-time scoring)`
```python
SCORING_WEIGHTS = {
    "email_open": 5, "website_visit": 3,
    "content_download": 10, "webinar_attendance": 15,
    "demo_request": 25
}

def recalculate_lead_score(lead):
    score = sum(
        count * SCORING_WEIGHTS[activity_type]
        for activity_type, count in lead.activity_counts().items()
        if activity_type in SCORING_WEIGHTS
    )
    
    lead.Lead_Score = score
    if score > 50 and lead.Status != "Sales Ready":
        lead.Status = "Sales Ready"
        notify(lead.Assigned_Rep, f"Lead {lead.Name} is now Sales Ready (Score: {score})")
    
    lead.save()
```

---

## 4. Custom Button Suggestions

These are patterns where the agent detects multi-step manual workflows that a user triggers on-demand — perfect for a single-click button.

---

### Use Case 4.1 — "Send to Legal" One-Click Button

**Observed Pattern:**
Contract manager Aditi handles deal contracts. For deals over $75K, she performs these steps every time: (1) changes contract status to "Legal Review", (2) assigns the legal team, (3) sets a review deadline of 5 business days, (4) attaches the latest proposal PDF, and (5) sends a notification to the legal channel. Detected 18 times this quarter.

**Agent Nudge:**
> *"You perform the same 5-step legal handoff on high-value contracts every time. Want me to create a 'Send to Legal' button that does it in one click?"*

**Platform Tool Generated:** `Custom Button on Deal record`
```
Button Label: "Send to Legal Review"
Visibility: Deal.Amount > 75000 AND Deal.Stage = "Negotiation"

On Click:
  SET Contract.Status = "Legal Review"
  SET Contract.Assigned_Team = "Legal"
  SET Contract.Review_Deadline = today() + business_days(5)
  ATTACH Deal.Latest_Proposal → Contract.Documents
  SEND Notification → #legal-reviews channel
  SHOW Success Toast: "Contract sent to Legal — review due by {deadline}"
```

---

### Use Case 4.2 — "Escalate to Manager" Button

**Observed Pattern:**
Support agent Keerthi handles tricky tickets by performing a 4-step escalation: changes priority to Critical, reassigns to her manager Suresh, adds an internal note summarizing the issue, and sends the customer a "We've escalated this" email template. Detected 14 times this month.

**Agent Nudge:**
> *"Your ticket escalation always follows the same 4 steps. Want me to create an 'Escalate to Manager' button on the ticket view?"*

**Platform Tool Generated:** `Custom Button on Ticket record`
```
Button Label: "Escalate to Manager"
Icon: AlertTriangle

On Click:
  PROMPT user for "Escalation Reason" (text input)
  SET Ticket.Priority = "Critical"
  SET Ticket.Owner = current_user().Manager
  ADD Internal Note: "Escalated by {agent} — Reason: {input.reason}"
  SEND Email Template "Escalation Acknowledgment" → Ticket.Customer
```

---

### Use Case 4.3 — "Generate Renewal Quote" Button

**Observed Pattern:**
Account manager Deepa handles subscription renewals. For each expiring contract, she: copies the existing contract's line items into a new quote, applies a 5% loyalty discount, sets the quote validity to 15 days, and emails it to the customer. Detected 9 times this renewal cycle.

**Agent Nudge:**
> *"You create renewal quotes the same way every time — copy, discount, send. Want a 'Generate Renewal Quote' button?"*

**Platform Tool Generated:** `Custom Button on Contract record`
```
Button Label: "Generate Renewal Quote"
Visibility: Contract.Status = "Active" AND Contract.Expiry_Date <= today() + days(60)

On Click:
  CREATE Quote from Contract.Line_Items
  APPLY 5% discount to all line items
  SET Quote.Valid_Until = today() + days(15)
  SET Quote.Type = "Renewal"
  SEND Email Template "Renewal Quote" → Contract.Primary_Contact
  SHOW Success: "Renewal quote #{quote.Number} sent to {contact.Name}"
```

---

### Use Case 4.4 — "Clone as Template" Button

**Observed Pattern:**
Project coordinator Raj frequently duplicates completed projects to use as templates for new clients. He clones the project, removes all dates and assignees, resets task statuses to "Not Started", and renames it with a "[TEMPLATE]" prefix. Detected 7 times over 5 weeks.

**Agent Nudge:**
> *"You keep cloning projects into templates the same way. Want a 'Clone as Template' button that handles it in one click?"*

**Platform Tool Generated:** `Custom Button on Project record`
```
Button Label: "Clone as Template"

On Click:
  CLONE Project (include tasks, milestones, exclude dates/assignees)
  SET all Task.Status = "Not Started"
  CLEAR all Task.Due_Date, Task.Assigned_To
  SET Project.Name = "[TEMPLATE] " + original.Name
  SET Project.Status = "Template"
  NAVIGATE to new Project record
```

---

## 5. Scheduled Automation Suggestions

These are time-driven patterns — actions the user performs on a recurring schedule (daily, weekly, monthly).

---

### Use Case 5.1 — Weekly Pipeline Hygiene Report

**Observed Pattern:**
Sales director Sunita runs the same report every Monday at 9 AM: filters deals stuck in the same stage for > 14 days, exports the list, and emails it to her team with the subject "Stale Deals — Action Required". Detected every Monday for 8 consecutive weeks.

**Agent Nudge:**
> *"You generate the same stale-deals report every Monday morning. Want me to schedule it to run and email your team automatically?"*

**Platform Tool Generated:** `Scheduled Automation (weekly)`
```
Schedule: Every Monday at 09:00 AM
Action:
  QUERY Deals WHERE Stage_Changed_Date < today() - days(14)
    AND Stage NOT IN ["Closed Won", "Closed Lost"]
  GENERATE Report "Stale Pipeline Deals"
  EMAIL Report → Sales Team Distribution List
    Subject: "Stale Deals — Action Required ({count} deals)"
```

---

### Use Case 5.2 — Daily Invoice Follow-Up

**Observed Pattern:**
Collections specialist Amir checks overdue invoices every morning. For invoices overdue by 7+ days, he sends a polite reminder email. For 15+ days overdue, he sends a firmer follow-up and flags the account. For 30+ days, he escalates to the finance director. Detected daily for the entire month.

**Agent Nudge:**
> *"Your daily invoice follow-ups follow a clear escalation ladder based on days overdue. Should I automate the entire collection workflow?"*

**Platform Tool Generated:** `Scheduled Automation (daily) with tiered logic`
```
Schedule: Every day at 08:30 AM

Action:
  FOR EACH Invoice WHERE Status = "Overdue":
    days_overdue = today() - Invoice.Due_Date
    
    IF days_overdue >= 30:
      SEND Email Template "Final Notice" → Invoice.Contact
      ESCALATE to Finance Director
      SET Invoice.Collection_Status = "Escalated"
    
    ELSE IF days_overdue >= 15:
      SEND Email Template "Second Reminder" → Invoice.Contact
      FLAG Account as "At Risk"
      SET Invoice.Collection_Status = "Follow-Up Required"
    
    ELSE IF days_overdue >= 7:
      SEND Email Template "Friendly Reminder" → Invoice.Contact
      SET Invoice.Collection_Status = "Reminded"
```

---

### Use Case 5.3 — Monthly License Utilization Check

**Observed Pattern:**
IT admin Pooja runs a license audit on the 1st of every month. She checks which SaaS licenses have < 20% utilization, flags them for review, and sends a summary to the procurement team. Detected on the 1st of each month for 4 months.

**Agent Nudge:**
> *"Your monthly license audit follows the same steps every time. Want me to schedule it to run automatically on the 1st?"*

**Platform Tool Generated:** `Scheduled Automation (monthly)`
```
Schedule: 1st of every month at 10:00 AM

Action:
  QUERY Licenses WHERE (Active_Users / Total_Seats) < 0.20
  FOR EACH underutilized license:
    SET License.Review_Flag = TRUE
    SET License.Last_Audit_Date = today()
  GENERATE Report "Underutilized Licenses"
  EMAIL Report → Procurement Team
    Subject: "Monthly License Audit — {count} underutilized licenses"
```

---

## 6. Custom View Suggestions

These are patterns where the agent notices the user repeatedly applying the same filters, sorts, and column selections.

---

### Use Case 6.1 — "My High-Value Open Deals" View

**Observed Pattern:**
Rep Zara opens the Deals module 12+ times per day. Every time, she applies the same filters: Owner = Me, Stage != Closed, Amount > $10,000, sorted by Close Date ascending. She does this 89 times this month.

**Agent Nudge:**
> *"You apply the same filters on Deals dozens of times a day. Want me to save this as a custom view called 'My High-Value Open Deals'?"*

**Platform Tool Generated:** `Custom View`
```
View Name: "My High-Value Open Deals"
Module: Deals
Filters: Owner = Current User, Stage ≠ Closed Won/Lost, Amount > 10000
Sort: Close Date (ascending)
Columns: Deal Name, Account, Amount, Stage, Close Date, Next Activity
Default: Set as user's default Deals view
```

---

### Use Case 6.2 — "Unassigned Tickets This Week" View

**Observed Pattern:**
Support lead Manish navigates to Tickets, filters for Status = "Open", Owner = "Unassigned", Created Date = "This Week", and sorts by Priority descending. He does this 6 times daily to triage new tickets. Detected 138 times this month.

**Agent Nudge:**
> *"You check for unassigned tickets this week constantly. Let me save this as a pinned view so it's always one click away."*

**Platform Tool Generated:** `Custom View (pinned)`
```
View Name: "Unassigned — This Week"
Module: Tickets
Filters: Status = "Open", Owner = NULL, Created = "This Week"
Sort: Priority (descending), then Created Date (ascending)
Pin: Yes (appears in sidebar)
```

---

## 7. Cross-Module Orchestration Suggestions

These are the most powerful patterns — where the agent detects workflows spanning multiple modules and picks the appropriate combination of platform tools.

---

### Use Case 7.1 — End-to-End Customer Onboarding

**Observed Pattern:**
When a deal closes, customer success manager Tanya performs an 8-step process across 4 modules over 2 days: (1) creates a Project, (2) creates 5 standard tasks, (3) sends welcome email to client, (4) schedules a kickoff call in the Calendar module, (5) creates an invoice in Billing, (6) updates the Account health score to "Onboarding", (7) adds the client to the "New Customers" campaign, and (8) sets a 30-day check-in reminder. Detected 8 times with 100% consistency.

**Agent Nudge:**
> *"Your post-sale onboarding spans 4 modules and 8 steps — and you do it the same way every time. Want me to build a full onboarding automation that triggers when a deal closes?"*

**Platform Tools Generated:**
| Step | Platform Tool |
|------|--------------|
| Trigger | Workflow Rule (Deal.Stage → Closed Won) |
| Steps 1-2 | Custom Function (project + task creation) |
| Step 3 | Email Template + Workflow Action |
| Step 4 | Calendar API Integration (Custom Function) |
| Step 5 | Custom Function (Invoice creation) |
| Steps 6-7 | Field Update + Campaign API |
| Step 8 | Scheduled Automation (30-day reminder) |

---

### Use Case 7.2 — Vendor Evaluation Pipeline

**Observed Pattern:**
Procurement officer Neha evaluates new vendors through a consistent process: (1) creates a vendor record, (2) sends a qualification questionnaire via email, (3) scores responses in a custom scoring sheet, (4) if score > 70, moves to "Approved Vendors" list, (5) creates a standard NDA task for legal, (6) sets up a payment terms record in Finance. Detected 15 times across 3 months.

**Agent Nudge:**
> *"Your vendor evaluation follows a 6-step pipeline across Vendors, Email, Tasks, and Finance. Want me to orchestrate this entire flow?"*

**Platform Tools Generated:**
| Step | Platform Tool |
|------|--------------|
| Step 1 | Custom Button ("Start Vendor Evaluation") |
| Step 2 | Workflow Rule (send questionnaire on creation) |
| Step 3 | Custom Function (scoring formula) |
| Step 4 | Workflow Rule (conditional on score) |
| Steps 5-6 | Custom Function (cross-module) |

---

## 8. Refinement & Edge-Case Learning

After deploying a customization, the agent continues monitoring to catch edge cases and propose refinements.

---

### Refinement 8.1 — Exception to Vendor Routing Rule

**Context:** The agent previously created a workflow to route bills from 4 vendors to Priya (Use Case 2.1).

**New Observation:**
Sana manually overrides the routing for Acme Corp bills that contain "consulting" in the description — she routes those to a different approver, Rahul. This has happened 4 out of the last 6 Acme Corp bills.

**Agent Nudge:**
> *"The vendor routing rule I created works great, but Acme Corp consulting bills go to Rahul instead of Priya. Want me to add an exception for consulting invoices?"*

**Refinement Applied:**
```
UPDATED RULE:
IF Bill.Vendor IN ["Acme Corp"] AND Bill.Description CONTAINS "consulting"
THEN ROUTE → "Rahul Kapoor"

ELSE IF Bill.Vendor IN ["Acme Corp", "TechFlow", "GreenSupply", "DataBridge"]
THEN ROUTE → "Priya Menon"
```

---

### Refinement 8.2 — Adjusting Lead Score Thresholds

**Context:** The agent created a lead scoring function with threshold 50 (Use Case 3.4).

**New Observation:**
Priya has been manually moving leads back from "Sales Ready" to "Nurture" when their score is between 50-60. Sales reps report that leads in this range aren't truly ready. Priya only keeps leads with scores > 65 in "Sales Ready".

**Agent Nudge:**
> *"Looks like leads scoring 50-60 keep getting moved back. Want me to raise the 'Sales Ready' threshold to 65 and add a 'Warm' status for the 50-65 range?"*

**Refinement Applied:**
```
UPDATED LOGIC:
IF score > 65 → Status = "Sales Ready"
IF score 50-65 → Status = "Warm" (new intermediate stage)
IF score < 50 → Status unchanged
```

---

### Refinement 8.3 — Time Window Restriction

**Context:** The agent created an SLA escalation rule (Use Case 2.3) that escalates Premium tickets after 4 hours.

**New Observation:**
The rule triggers at 2 AM on weekends, paging senior engineers for non-critical issues. Farah manually un-escalates these. Detected 6 times on weekends.

**Agent Nudge:**
> *"The escalation rule fires on weekends too, causing unnecessary pages. Want me to restrict it to business hours (Mon-Fri 8AM-8PM) and extend the weekend threshold to 12 hours?"*

**Refinement Applied:**
```
UPDATED RULE:
IF business_hours (Mon-Fri 08:00-20:00):
  Escalate after 4 hours
ELSE:
  Escalate after 12 hours
  Route to On-Call engineer (not full senior pool)
```

---

## Summary: Pattern → Platform Tool Mapping

| Pattern Type | Best Platform Tool | Agent Confidence Signal |
|---|---|---|
| Same field value set under same conditions | **Field Update Rule** | >80% consistency, 10+ occurrences |
| Conditional routing or approval chains | **Workflow Rule** | Consistent trigger-action pairs |
| Time-based recurring manual actions | **Scheduled Automation** | Same action, same schedule, 4+ repetitions |
| Complex calculations or cross-module data flow | **Custom Function / Deluge** | Multi-step logic, math, or API calls |
| Multi-step on-demand manual sequences | **Custom Button** | User-initiated, 3+ steps, same every time |
| Repeated filter/sort/column selections | **Custom View** | Same view configuration applied 20+ times |
| Post-deployment manual overrides | **Refinement / Exception Rule** | 3+ overrides of the same automation |

---

*This document is part of the Customization Copilot hackathon project. Each use case represents a realistic pattern that the agent would detect through behavioral observation and resolve by selecting the most appropriate platform customization tool.*
