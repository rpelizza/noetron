# Domain Skill Template

The skeleton for a new domain skill. Sections follow the canonical order from `doctrine.md`; omit any that would be empty. Everything in `<angle brackets>` is filled from the EVIDENCE step — with real paths, real terms, real examples from this repository. `<prefix>` is read from `.noetron/domain-skills.md`.

````markdown
---
name: <prefix>-<skill-name>
description: Use when <situations, with the concrete tokens a real task would contain — paths, domain terms, symptoms>.
---

# <Skill title>

<Purpose: one or two lines — what working on this domain requires that an agent would not know.>

## Territory

| Path | What lives there |
|---|---|
| `<path>` | <role in the domain> |

## Conventions

- <How this domain does things — each convention grounded in existing code, with a pointer to a real example.>

## Invariants & traps

- **<Invariant>** — <what must always hold, and what breaks if it doesn't>.
- **Trap:** <what has bitten before, and what to do instead>.

## Verification

<How to prove work in this domain is correct — the commands to run, what output to expect, what to exercise in the running app. Reading the code is not exercising it; align with `.noetron/verification-standard.md`.>

## Related skills

- `<prefix>-<sibling>` — <one line: when to go there instead>.

---

**This skill is working if:** <two to four observable signals — properties of diffs, absence of the failure mode>.
````

## Filled example (fictional)

A knowledge-gap skill for a billing domain, shown so the shape is unambiguous:

````markdown
---
name: acme-billing-refunds
description: Use when changing refund flows — files under src/billing/refunds/, the RefundLedger model, webhook handlers for payment.refunded, or when totals in refund reports are off by cents.
---

# Acme billing: refunds

Refunds are ledger-first: every refund is a `RefundLedger` row before it is a payment-provider call. Agents that start from the provider SDK invert the flow and corrupt reconciliation.

## Territory

| Path | What lives there |
|---|---|
| `src/billing/refunds/` | Refund domain logic; one file per flow |
| `src/billing/ledger.ts` | `RefundLedger` — the source of truth |
| `src/webhooks/payment.ts` | Provider webhooks; idempotent by `event_id` |

## Conventions

- Money is integer cents end to end; `Decimal` only at the report boundary (see `reports/format.ts`).
- Every refund flow is a single exported function per file, named `refund<Reason>` — follow `refundChargeback` in `src/billing/refunds/chargeback.ts`.

## Invariants & traps

- **Ledger before provider.** The `RefundLedger` row is written and committed before the provider call; the webhook only flips its status.
- **Trap:** the provider retries webhooks. Handlers must be idempotent by `event_id` — dedupe first, then act (see `handlePaymentRefunded`).

## Verification

Run `npm run test:billing` (money-rounding suite included) and check one refund end to end in the sandbox: ledger row → provider call → webhook → status flip.

## Related skills

- `acme-billing-invoices` — invoice generation and numbering; go there for anything that renders or numbers documents.

---

**This skill is working if:** refund PRs write the ledger before the provider call without being told; webhook double-processing bugs stop appearing; refund reports reconcile to the cent.
````

## Greenfield variant

Same skeleton, three differences — the full rules are in [greenfield.md](./greenfield.md).

````markdown
---
name: <prefix>-<area>-<topic>
description: Use when <the tokens the plan's first slices will carry — package path, framework, the artifact being built>.
---

# <Skill title>

> **Doc-grounded** — written <YYYY-MM-DD> from `<lib>@<version>` documentation, before any code
> existed in this territory. Re-ground at the first diff that lands here.

<Purpose: the class of mistake this stack's defaults invite.>

## Territory (planned)

| Path | What will live there | From |
|---|---|---|
| `<path the slice creates>` | <role> | `plans/<file>#decisions` |

## Conventions the stack imposes

- **Wrong by default:** `<what an agent writes from habit>` · **In `<lib>@<version>`:** `<what the
  docs require>` — `<doc reference>`.

## Ratified decisions this skill assumes

- <decision> — `plans/<file>#decisions`. Nothing outside this list is prescribed here.
````

Everything else — Invariants & traps, Verification, Related skills, the falsifiability footer — keeps its
shape. Verification names the commands the plan's stack will provide; a command nobody has run yet is
marked `(unverified)`, exactly as in `.noetron/profile.md`.
