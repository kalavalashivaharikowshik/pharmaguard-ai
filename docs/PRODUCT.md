# PharmaGuard AI — Product Case

This page explains **what** PharmaGuard AI does and **why**, written for product readers rather than engineers. The [README](../README.md) covers how it is built.

## 1. The problem

When a medicine batch becomes unsafe (recalled, expired or counterfeit), three things go wrong:

1. **Nobody knows where every unit is.** Stock has moved from manufacturer to distributor to hundreds of pharmacies and hospitals, and each keeps its own records.
2. **Recalls are slow and manual.** They run on phone calls, emails and spreadsheets, and there is no single view of who has acted and who has not.
3. **Unsafe stock still gets sold.** At the pharmacy counter there is no quick check that a batch is genuine, in date and not recalled.

The result is risk to patients, regulatory penalties and wasted stock.

## 2. Who it is for

| User | Main job | Biggest pain today | What PharmaGuard gives them |
|---|---|---|---|
| **Manufacturer** | Release batches, run recalls | Cannot see where stock went after the distributor | Batch registry, full trace of every unit, recall tasks |
| **Distributor** | Move stock to pharmacies and hospitals | Recall notices arrive late and unclear | Transfer workflow with stock checks, clear recall tasks with deadlines |
| **Pharmacy / Hospital** | Sell or dispense safely | No fast way to check a batch at the counter | One-tap QR scan verdict on the phone |
| **Regulator** | Make sure recalls finish | No live view of recall progress | Compliance dashboard, violation log, automatic escalation of overdue holders |
| **Admin** | Run the platform | Onboarding organisations safely | Registration with approval, role-based access |

The split between surfaces follows the users: **planners** (manufacturer, regulator) work at a desk and get the **web dashboard**; **counter and field staff** (pharmacy, hospital) get the **mobile app** with scanning at its centre.

## 3. Key user journeys

**A. Counter check (pharmacy).** Scan the batch QR → get **Safe**, **Expiring soon**, **Blocked** or **Counterfeit** with the reason → sale is allowed or stopped. Every blocked attempt is logged.

**B. Recall (manufacturer or regulator).**
1. Start a recall for a batch and choose severity.
2. The system finds every holder and unit.
3. Each holder gets a task with a deadline based on severity (24 hours for the most serious, up to 7 days).
4. Holders are notified by push, SMS and email.
5. Overdue tasks are escalated to the regulator; the recall closes on its own when every holder is done.

**C. Expiry.** Holders are warned 30 days before expiry; expired batches are blocked automatically and go into the return/disposal flow.

## 4. How features were prioritised

| Priority | Feature | Why |
|---|---|---|
| Must have | Batch registry, transfers, inventory | Nothing else works without knowing where stock is |
| Must have | QR scan verdict at the counter | Directly stops unsafe sales, the outcome that matters most |
| Must have | Recall tasks with deadlines and escalation | Turns a manual process into a tracked one |
| Should have | Expiry warnings and auto-blocking | Prevents a common, predictable problem |
| Should have | Tamper-proof batch record (blockchain) | Catches database edits and fake batches; builds trust between companies |
| Could have | AI risk scores, demand forecast, chat assistant | Helps planning, but the core safety loop works without it (rule-based fallback) |
| Later | Live government drug-database integration | Needs partnerships outside a student project |

## 5. How success would be measured

| Goal | Metric (KPI) |
|---|---|
| Recalls finish faster | Median time from recall start to 100% of holders done |
| Recalls finish completely | % of recalled units confirmed quarantined, returned or destroyed |
| Unsafe sales are stopped | Blocked sale attempts per 1,000 scans; unsafe sales that got through (target 0) |
| Less expired waste | Units expiring in stock as % of units received |
| People actually use it | Weekly active pharmacies; scans per pharmacy per week |
| Holders act on time | % of recall tasks done before deadline; number of escalations |

**North-star metric:** *% of unsafe units removed from circulation within the recall deadline.*

## 6. Trade-offs and decisions

- **Embedded blockchain by default, public chain optional.** Zero setup for a demo and no gas costs, while keeping the same tamper check. A public network (e.g. Sepolia) can be switched on later.
- **AI is advisory, rules decide.** Risk scores come from transparent rules so every number can be explained; Gemini adds the written summary. If the AI is down, the safety features still work.
- **Role-limited AI assistant.** It only answers from data that user's role may see, so a pharmacy cannot see a competitor's stock.
- **Push, SMS and email for recalls.** More channels cost more, but a missed recall notice is far more expensive.

## 7. What I would do next

1. Interview 5–10 pharmacists and distributors to check the scan flow and recall deadlines match how they really work.
2. Add funnel analytics (scan → verdict → action) to find where users drop off.
3. Test whether a 12-hour reminder before the deadline cuts escalations.
4. Pilot with one distributor and its pharmacies and measure the KPIs above.

## 8. Why this maps to e-commerce supply chains

The same problems appear in any large supply chain: knowing where inventory sits, moving it between nodes, stopping a bad item reaching a customer, and running returns and disposals on time. The recall flow is effectively a **reverse-logistics** workflow, and the expiry and stock-out insights are **inventory-planning** problems.
