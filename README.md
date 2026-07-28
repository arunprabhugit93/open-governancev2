# NSAIC Assurance Console — POC UI

A proof-of-concept **user interface** for the National Sovereign AI Cloud
Infrastructure (NSAIC) **AI Assurance Stack**. It is built against an
anticipated buyer brief whose central demand is not a tour of an architecture,
but a **demonstration of behaviour**: a model taken through its whole lifecycle,
live, in one continuous session, with the evaluator choosing what breaks.

> This repository is **UI only**. There is no real assurance backend, no real
> model inference, and no real key custody. Everything runs client-side. What is
> genuinely computed versus simulated is disclosed in-app under **Disclosure**
> (and summarised below).

## What it demonstrates

The console is built around a single **reactive engine** (`src/lib/store.ts`).
Every view is a pure subscriber, so introducing an event cascades through the
whole console with **no refresh and no republish step** — which is precisely the
property the buyer scores most heavily.

| Claim | Property | Where you watch it happen |
|------|----------|---------------------------|
| C1 | Gate, not report — no bypass route | **Assurance Gates**: incomplete model blocked; bypass attempts refused |
| C2 | Immutable metadata; gate refuses if missing | **Model Registry** / **Gates**: remove any element → matching gate fails |
| **C3** | **Live, renewable, time-boxed authorisation** | **Authorisation**: a runtime event revokes a live grant *unassisted* |
| C4 | Thresholds rise with sensitivity | **Authorisation**: same model, PUBLIC authorised, RESTRICTED refused |
| C5 | Independent assurance function | **Registry**: every candidate is externally supplied (not vendor-trained) |
| C6 | Dashboard is a live read-out | **Overview**: every figure derived from the same engine |
| C7 | Tamper-evident audit custody | **Evidence Ledger**: real SHA-256 chain; tamper any record → detected |
| C8 | Sovereign boundary holds | **Sovereignty**: all flows internal; external calls refused at the boundary |

### The eight-phase demonstration
Arrival → Refusal → Passage → Authorisation → Service → **The Turn** → Loss →
Evidence. Drive it from the **Demonstration** view, or fire any action out of
sequence from the **Evaluator Control** drawer (top bar) — nothing is
hard-scripted, so unscripted attempts work.

## Genuinely computed vs. simulated

**Real (in-browser):** the SHA-256 hash-chained evidence ledger and its tamper
detection, the derived Assurance Index, time-box countdowns and expiry, and the
reactive revocation cascade.

**Simulated (disclosed up-front):** model inference outputs, gate check
internals, network egress enforcement, and key custody / HSM.

## Tech stack

Vite · React 18 · TypeScript · Tailwind CSS · Zustand · Framer Motion ·
Recharts · lucide-react. No backend; deployable as static files.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

### A 60-second walkthrough
1. Open **Evaluator Control** (top bar). Nominate a model, **Make complete**, **Run gates**.
2. **Request authorisation** at PUBLIC → authorised. Switch tier to RESTRICTED, request again → refused (C4).
3. Go to **Authorisation**. Under *The turn*, introduce **a red-team finding**.
   Watch the live grant revoke itself, no keyboard touched (C3), and the
   **Overview** dashboard follow with no refresh (C6).
4. Go to **Evidence Ledger**. **Verify chain** (intact) → **Tamper** any record →
   **Verify chain** again → the alteration and every record after it fail (C7).

## Project layout

```
src/
  lib/        types, seed data, the reactive engine (store), SHA-256 hash chain
  components/ app shell, evaluator drawer, gauges, auth matrix, UI primitives
  views/      the eight console views + environment disclosure
  hooks/      theme, time-box heartbeat
```
