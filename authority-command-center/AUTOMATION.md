# App → Airtable → LinkedIn: Build Plan

_How the Authority Command Center demo becomes a live posting engine on the infrastructure already in your Make + Airtable account. This is a map, not an implementation — nothing below has been changed yet._

---

## Scope decision (locked)

**Target: Joe Hunter's personal LinkedIn profile.** `Channel` is fixed to
`LinkedIn Profile` everywhere; the `XHQ Company Page` path is not used.

Consequence: **no analytics automation.** LinkedIn exposes no analytics API for
personal profiles (impressions, engagement, profile views can't be pulled
programmatically). The demo's Analytics view has been **removed** rather than
promise numbers that can't be kept real. What stays measurable without LinkedIn:
publish count and cadence (from Airtable) and conversations/leads (from your CRM),
if you ever want a lightweight scorecard later.

## TL;DR

- The **Airtable → LinkedIn** half is already built and working in concept — the Make scenario **"XHQ Content Queue to LinkedIn"** does exactly this. It's currently **turned off and flagged invalid**, so it needs a small fix + reactivation.
- The **only real gap** is that the demo app holds its calendar in browser memory. Give it a write path to Airtable and the existing engine takes over from there.
- **Canonical base: `XHQ Content Engine` → `Content Queue`** (recommended below). The second base is a dead-end prototype.
- **Watch the Make Free plan**: 15-minute polling alone blows the 1,000-ops/month cap. Move to **webhook (event) triggering** or upgrade to Core.

---

## Recommendation: which base is the source of truth

**Use `XHQ Content Engine` → `Content Queue`** (`appanaRXysU5zMWmO` / `tblMk0VzHqtviRr7x`).

Why this one, not `XHQ LinkedIn Content Engine / Daily Posts`:

| | **XHQ Content Engine → Content Queue** ✅ | XHQ LinkedIn Content Engine → Daily Posts |
|---|---|---|
| Referenced by live Make scenarios | **Yes** — both Draft Generator & Queue-to-LinkedIn read/write it | No |
| Status lifecycle | **Needs Review → Approved → Published** (matches the app's Approve→Scheduled→Published story) | Status + separate Approve checkbox (ambiguous) |
| Publish routing | **Yes** — Publish Path, Format, Channel (Profile vs Company Page), First Comment | No |
| Self-documenting contract | **Yes** — table description spells out the trigger rule | No |
| Recommendation | **Canonical** | Archive, or migrate its unique fields (Theme, ICP) in as columns |

> The `Content Queue` table description says it plainly: _"Set Status to Approved to trigger publishing via Make. Make writes the live URL back and flips Status to Published."_ The app just needs to participate in that lifecycle.

---

## Target architecture

```
┌──────────────────────┐   Approve (write)   ┌──────────────────────────┐
│  Authority Command   │ ──────────────────▶ │  Airtable: Content Queue │
│  Center (the app)    │                     │  Status = Approved       │
│                      │ ◀────────────────── │  Publish Time set        │
└──────────────────────┘   poll (read back)  └───────────┬──────────────┘
        shows "Published ✓"                              │ trigger
                                                          ▼
                                        ┌──────────────────────────────────┐
                                        │ Make: "XHQ Content Queue to       │
                                        │ LinkedIn"                         │
                                        │  1. Find Approved, no URL yet     │
                                        │  2. LinkedIn → Create Post        │
                                        │  3. (add) LinkedIn → First Comment│
                                        │  4. Write URL + Status=Published  │
                                        └──────────────────────────────────┘
```

Upstream, the existing **"XHQ Draft Generator"** already fills `Post Body` from a `Hook` using Claude + the `XHQ Voice Brain` base, setting `Status = Needs Review`. So the full pipeline is:

**Draft Generator (Hook → Post Body, Needs Review) → human/app Approve → Queue-to-LinkedIn (publish) → write-back.**

---

## Field mapping: app → `Content Queue`

When **Approve** is clicked in the app, write/update one record:

| App concept | Content Queue field | Value on Approve |
|---|---|---|
| Post body | `Post Body` (multilineText) | the draft text |
| Signal source / label | `Hook` (singleLineText) | short topic label |
| Suggested slot (day + time) | `Publish Time` (dateTime) | ISO datetime of the slot |
| Venture (Hunter/Peptide/Symphony) | `Notes` or a new `Venture` field | tag string |
| — (set by Approve) | `Status` (singleSelect) | **`Approved`** |
| — (set by Approve) | `Publish Path` (singleSelect) | **`Auto (scheduler)`** |
| — (set by Approve) | `Format` (singleSelect) | **`Text`** |
| — (target account) | `Channel` (singleSelect) | `LinkedIn Profile` (fixed — personal page) |
| Lead-magnet line (optional) | `First Comment` (multilineText) | link, posted as comment #1 |
| filled by Make | `Live Post URL` (url) | leave empty → Make fills it |

**Exact single-select option names (use verbatim):**
- `Status`: `Needs Review` · `Approved` · `Published`
- `Channel`: `LinkedIn Profile` · `XHQ Company Page`
- `Format`: `Text` · `Carousel / Document` · `Image` · `Video`
- `Publish Path`: `Auto (scheduler)` · `Manual (human-publish)`
- `Post Type`: `Mindset Monday` · `SVU Tuesday` · `Authority Wednesday` · `Offer Friday` · `Personal Saturday` · `Standalone / Other`

---

## The publish trigger contract

The Queue-to-LinkedIn scenario currently fires on:

```
AND( {Status} = "Approved", {Live Post URL} = "" )
```

**Fix needed:** this does **not** yet gate on `Publish Path` or `Format`, so a Carousel/Video/Manual row would get auto-published as a plain text post. Tighten it to:

```
AND( {Status}="Approved", {Live Post URL}="", {Publish Path}="Auto (scheduler)", {Format}="Text" )
```

Non-text / manual rows then stay in the queue for a human to publish, exactly as the field descriptions intend.

---

## Two ways to connect the app to Airtable

| | **A. Make webhook (recommended)** | B. Airtable REST API direct |
|---|---|---|
| App calls on Approve | `POST` to a Make custom-webhook URL | `PATCH`/`POST` to Airtable API |
| Trigger type | Instant — no polling, **near-zero idle ops** | Still needs a poller or Airtable automation to fire Make |
| Secrets in the browser | None (webhook URL only) | Airtable token exposed unless proxied |
| Logic location | All in Make (easy to branch per channel) | Split between app and Make |
| Best when | You want event-driven + ops-efficient | You want the app to own the data layer |

**Recommendation: A.** The app POSTs the draft to a Make webhook on Approve; that scenario upserts the Airtable row **and** publishes — one instant flow, no idle polling.

---

## Make Free-plan reality (important)

Your org (`My Organization`) is on **Free**: **2 active scenarios**, **1,000 operations/month**, **15-min minimum** polling.

- A single scenario polling Airtable every 15 min = **~2,880 ops/month just idling** (96 checks/day × 30). That alone exceeds the 1,000 cap — which is likely why both scenarios are currently switched **off**.
- **Event/webhook triggering costs ops only when something actually happens** — a handful of ops per real post instead of thousands for idle checks. This is the single biggest efficiency lever.
- Two always-on pollers is not viable on Free. Options, in order of preference:
  1. **Webhook-trigger the publish path** (app → Make) and keep Draft Generator on-demand → stays comfortably under 1,000 ops.
  2. **Upgrade to Core (~$9/mo, 10,000 ops)** for headroom if you want scheduled polling too.
  3. Keep polling but drop to a few scheduled times/day instead of every 15 min.

---

## Open items before go-live

1. **Reactivate "XHQ Content Queue to LinkedIn"** — it's `isActive: false` and `isinvalid: true`. Open it, re-confirm the LinkedIn module + connection (`My LinkedIn connection – Marland Richardson`, valid to 2027), re-save. Diagnose the invalid flag.
2. **Tighten the trigger filter** to gate on `Publish Path = Auto` and `Format = Text` (see above).
3. **Add the First Comment step** — the scenario publishes the post but doesn't yet post `First Comment` as comment #1 (where the lead-magnet link is meant to go).
4. ~~Decide Profile vs Company Page~~ — **decided: personal profile.** No analytics automation follows from this (see Scope decision).
5. **Choose the app→Airtable path** (webhook vs API) and add the Approve write.
6. **Archive the second base** (`XHQ LinkedIn Content Engine / Daily Posts`) or migrate its unique fields, to avoid two competing sources of truth.
7. **Pick the trigger/ops model** (webhook vs Core upgrade) given the Free-plan cap.

---

### Reference IDs (for whoever builds it)

- Base — XHQ Content Engine: `appanaRXysU5zMWmO`
- Table — Content Queue: `tblMk0VzHqtviRr7x`
- Key field IDs: Post Body `fldz2jkrZrcgNvnC6` · Status `fldcf9cTUFC3zbWyV` · Live Post URL `fldVilDkG3zdX5oae` · Publish Time `fldkT2Gl0VoaqZ1Oy`
- Make scenarios: Queue-to-LinkedIn `4789738` · Draft Generator `4789764` (team `697896`)
- Voice Brain base (draft system prompt): `appTLEWtof6X2TPKf`
