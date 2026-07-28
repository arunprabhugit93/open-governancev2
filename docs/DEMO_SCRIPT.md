# NSAIC Assurance Console — Demo Runbook & Speaker Notes

A presenter guide for walking a buyer through the live demonstration: how this
POC fits the procurement, then a click-by-click script (what to **do**, what to
**say**, what each moment **proves**).

> A styled, on-screen version of this runbook is published as an artifact — keep
> it on a second screen while you present.

---

## 1. How this fits the POC

The buyer — Malaysia's National Sovereign AI Cloud programme (MCMC) — is buying
an **AI Assurance Stack**: the machinery that decides whether an AI model may
serve a government department, and keeps that decision honest over time. Their
proposal made eight promises (C1–C8). Their brief says, in effect: *"We believe
the diagram. Now make the behaviour visible — on a model we choose, in one
continuous session, with us pulling the levers."*

This site is the **operational console** of that stack, built as a
proof-of-concept **UI**. In a real deployment the same screens sit on top of the
actual assurance engine; here the engine is simulated in the browser so we can
rehearse and show the exact demonstration the buyer asked for.

Two roles share the screen:

- **You (the Operator)** — walk the model through its lifecycle via the left nav.
- **The buyer (the Evaluator)** — makes the choices. The **Evaluator Control**
  panel (top-right) is where you hand them the wheel: they pick the model, pick
  what to break, pick the runtime event. That hand-over is the point of the brief.

**Open with:** "We're going to take one model you choose, from arrival to loss of
authorisation and out the other side as sealed evidence — and at the moment that
matters, nobody on our team will touch a keyboard."

**Before you start:** keep this guide on a second screen. `Reset session`
(bottom-left) returns a clean slate. Everything updates one shared engine — when
a number moves on one screen it has already moved everywhere. Nothing is recorded.

---

## 2. The walkthrough (eight phases)

Legend: **DO** = what to click · **SAY** = spoken line · **WATCH** = what to point at.

### 0 · Set the scene — *Overview* (C6)
- **DO:** Start on the **Overview** dashboard. Point at the `SOVEREIGN BOUNDARY · SEALED` pill and the `LIVE` badges.
- **SAY:** "This dashboard isn't a report we generate. Every number is read straight from the engine that gates models — there's no separate reporting layer to fall out of sync. Watch it move on its own later."
- **WATCH:** Assurance Index reads **0**, nothing trusted yet.

### 1 · Arrival — *Model Registry* + *Evaluator Control* (C5)
- **DO:** `Evaluator Control` → **1 · Nominate a model**, let the buyer pick one (e.g. *Selangor-8B*). Open **Model Registry** to show its record.
- **SAY:** "You choose the model, not us. Note the badge: **externally supplied**. The assurance function can't score a model we built — that independence is why it exists as a separate function."
- **WATCH:** Immutable signed metadata + content hash; status **not trusted**.

### 2 · Refusal — *Assurance Gates* + *Evaluator Control* (C1, C2)
- **DO:** `Evaluator Control` → **2 · Break something**, let the buyer **Remove** any metadata element. Switch to **Assurance Gates**. Then **3 · Attempt a bypass** — try every route.
- **SAY:** "You chose what to remove. Promotion is refused for *that* element by name — not a warning, not a queued review. A gate that only advises is a report. And there's no back door: every bypass lands in the enforcement log, refused."
- **WATCH:** The matching gate turns **red/refused**; the enforcement log fills with blocked attempts.

### 3 · Passage — *Assurance Gates* (C1)
- **DO:** `Evaluator Control` → **Make complete**, then **Run gates**. Expand a gate or two to show the evidence it produced.
- **SAY:** "Now every mandatory gate passes and the model is scored — an Assurance Index of 82. Each gate can tell you what it checked and what evidence it produced. Ask me about any of them."
- **WATCH:** All gates **green**; Assurance Index climbs to **82**.

### 4 · Authorisation — *Authorisation* + *Evaluator Control* (C4)
- **DO:** `Evaluator Control` → **4 · Authorise**, request at **PUBLIC** (granted). Switch tier to **RESTRICTED**, request the *same model* again. Open **Authorisation** to show the matrix.
- **SAY:** "Same model, same evidence — safe for a Public service, refused for a Restricted one. The threshold rises with sensitivity. And it's time-boxed — see the countdown. It expires whether or not anyone remembers to renew it."
- **WATCH:** **PUBLIC authorised** (live countdown), **RESTRICTED refused**; threshold chart shows why (index 82 clears 62/74, not 86/94).

### 5 · Service — *Serving* + *Sovereignty* (C1, C8)
- **DO:** Open **Serving**, send a tenant message. Use **Reach control plane** and **Attempt prompt injection** — both blocked. Switch to **Sovereignty**, hit **Test external egress call**.
- **SAY:** "The tenant can talk to the model, but can't reach the control plane, and injection is neutralised at the guard. Nothing leaves the boundary — this external call is refused before a byte goes out. One hosted dependency would fail the claim; there are none."
- **WATCH:** Guard log shows **BLOCKED**; egress monitor shows the external destination **refused at the boundary**.

### 6 · The turn — *Authorisation* (C3)
- **DO:** On **Authorisation**, in **The turn** panel, let the buyer pick one: **red-team finding**, **drift**, or **expiry**. Don't say which you "expect". Take your hands off the keyboard.
- **SAY:** "You choose the event. We're not told which. I'm going to step back now — watch the screen and watch our hands."
- **WATCH:** The instant they click, the engine recomputes. Go straight to the next step.

### 7 · Loss — *Authorisation → Overview* (C3, C6) — **the peak**
- **DO:** Stay on **Authorisation** as the grant flips to **REVOKED** and the red *"withdrawn with no operator action"* banner appears. Click **Overview** — the dashboard already reflects it.
- **SAY:** "No one requested that. The event you introduced dropped the index, and the authorisation withdrew itself — a live decision, not a certificate. The dashboard changed with it: no refresh, no republish, nobody touched a keyboard. A manual revocation would just be a certificate with extra steps."
- **WATCH:** Grant **REVOKED**, hands-off banner, index drops, Overview heatmap flips — all unassisted.
- **This is worth ~30% of the score on its own.** Slow down, pause, let them see no one intervened.

### 8 · Evidence — *Evidence Ledger* (C7)
- **DO:** Open **Evidence Ledger**. **Verify chain** (intact). Let the buyer pick *any* row, **Tamper** it, rewrite the text, **Verify chain** again. Finish with **Export evidence**.
- **SAY:** "You pick the record — not one we prepared. When you alter it, verification detects it, and the break cascades to every record sealed after it. This is a real SHA-256 chain computed in front of you. Tamper-evidence is the ground every other evidence claim stands on."
- **WATCH:** Chain verifies **intact** → after tamper, the row and all following turn **red** ("Tamper detected").

### ★ Close on candour — *Disclosure*
- **DO:** Open **Disclosure**. Walk the two columns: genuinely computed vs. simulated.
- **SAY:** "We're stating this up front, not when challenged. The hash chain, the index, the time-boxes, the live cascade — real. Model inference, gate internals, key custody — simulated for this POC, and disclosed. We'd rather tell you what our stack doesn't yet do than have you find it."

---

## 3. The eight claims, at a glance

| Claim | Promise | Where you prove it |
|------|---------|--------------------|
| C1 | A gate, not a report — no bypass route | Assurance Gates (steps 2–3) |
| C2 | Immutable metadata; missing element ⇒ refusal | Registry / Gates (step 2) |
| C3 | Live, time-boxed authorisation; revokes itself | Authorisation (steps 6–7) |
| C4 | Thresholds rise with sensitivity | Authorisation (step 4) |
| C5 | Independent — can't score its own model | Registry (step 1) |
| C6 | Dashboard is a live read-out | Overview (steps 0, 7) |
| C7 | Tamper-evident evidence custody | Evidence Ledger (step 8) |
| C8 | Nothing leaves the sovereign boundary | Serving / Sovereignty (step 5) |

---

## 4. Where they'll push — and how to answer

The brief names the weak spots and promises to press them. Get there first.

- **"Show me the explainability, not the word."** — Open the *Generative explainability* gate; say it's behaviour- and attribution-level, and name the decision it's sufficient to support. Don't claim mechanistic.
- **"Poison the index."** — Point at the *RAG-poisoning* gate evidence: "caught 22 of 25, three flagged as residual gap." Naming what it misses is the honest answer.
- **"Are you independent if your consortium runs security?"** — Separation of duties: assurance scores, it doesn't deliver. Say who can override a failure, and that overrides are logged.
- **"Give me the latency figures."** — Decline. The SLA config doesn't exist pre-award; show the measurement path and state what would need to be true for the numbers to hold.
- **"Reverse an agent action."** — If it isn't built, say so. A block described as recovery is the one thing the brief says will cost you.

---

**If you only remember one thing:** the demonstration lives or dies on **step 7**.
Get the model authorised, hand the buyer the event, and take your hands off the
keyboard. Everything else is setup for that moment and evidence after it.
