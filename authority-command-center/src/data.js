// ============================================================
// Seed data — verbatim from build brief §5. The specificity is the point.
// Everything lives in React state; approving/skipping mutates it.
// ============================================================

// Venture metadata → drives pill + calendar block colors.
export const VENTURES = {
  hunter: { key: 'hunter', label: 'Hunter Land', pill: 'pill--hunter', block: 'v-hunter' },
  symphony: { key: 'symphony', label: 'Symphony', pill: 'pill--symphony', block: 'v-symphony' },
  peptide: { key: 'peptide', label: 'Pro Peptide', pill: 'pill--peptide', block: 'v-peptide' },
}

// ---- Approval Queue — starting drafts (3) ----
export const SEED_DRAFTS = [
  {
    id: 'd1',
    venture: 'hunter',
    signal: 'land investing as an inflation hedge (trending in your network)',
    body: `Everybody talks about hedging against inflation.
Almost nobody talks about the simplest hedge there is: dirt.

Raw land doesn't need tenants. It doesn't break. And with owner financing, you don't need a bank to say yes.

At Hunter Land Ventures, my son and I find the land most people overlook — distressed, tax-delinquent, forgotten — and make it ownable with payments that work for real people.

You don't have to be an investor to own a piece of your future. You just have to start.`,
    slot: 'Tue, 8:15 AM',
    day: 'Tue',
    time: '8:15 AM',
  },
  {
    id: 'd2',
    venture: 'symphony',
    signal: 'intentional community rising (audience question)',
    body: `I've sat in a lot of "networking" rooms over 30 years. Most of them are transactions wearing name tags.

Symphony Six is the opposite. Bourbon, cigars, and men who are tired of doing life alone — building Revenue, Resources, and Relationships that actually last.

The best deals I've ever been part of started as real friendships.

Turns out depth is the strategy.`,
    slot: 'Thu, 7:30 AM',
    day: 'Thu',
    time: '7:30 AM',
  },
  {
    id: 'd3',
    venture: 'peptide',
    signal: 'peptide sourcing conversation heating up',
    body: `20 years in medical sales taught me something that has nothing to do with medicine:

People don't buy the product. They buy the person who believes in it.

We're scaling a peptide company right now on the exact principle I've used since day one — relationships first, results follow. The science has to be real. But trust is what opens the door.`,
    slot: 'Mon, 8:00 AM',
    day: 'Mon',
    time: '8:00 AM',
  },
]

// ---- Content Calendar — pre-scheduled (3) ----
export const SEED_CALENDAR = [
  {
    id: 'c1',
    venture: 'peptide',
    day: 'Mon',
    time: '8:00 AM',
    excerpt: '20 years in medical sales taught me…',
    body: `20 years in medical sales taught me something that has nothing to do with medicine:

People don't buy the product. They buy the person who believes in it.

We're scaling a peptide company right now on the exact principle I've used since day one — relationships first, results follow. The science has to be real. But trust is what opens the door.`,
    status: 'Scheduled',
  },
  {
    id: 'c2',
    venture: 'hunter',
    day: 'Wed',
    time: '12:15 PM',
    excerpt: 'A piece of land you can actually afford…',
    body: `A piece of land you can actually afford — no bank, no gatekeeper, no permission needed.

With owner financing, ownership starts with a handshake and a payment that fits real life. That's how we do it at Hunter Land Ventures.

Your future doesn't have to wait for a loan officer.`,
    status: 'Scheduled',
  },
  {
    id: 'c3',
    venture: 'symphony',
    day: 'Fri',
    time: '7:45 AM',
    excerpt: 'The table you build before you need it…',
    body: `The table you build before you need it is the one that saves you.

Symphony Six is Nashville men choosing depth over transactions — Revenue, Resources, Relationships. Bourbon and cigars are just the excuse to show up.

Build the room before the storm. You'll be glad it's there.`,
    status: 'Scheduled',
  },
]

// ---- Signals feed (4 cards) ----
// Each carries a canned "Draft from this" (short, Joe's voice) to push into the Queue.
export const SEED_SIGNALS = [
  {
    id: 's1',
    topic: 'Land investing as an inflation hedge',
    why: 'Three people in your network posted on this in the last week. Strong moment to plant your flag.',
    trend: 'up',
    trendLabel: '↑ trending',
    venture: 'hunter',
    draft: {
      signal: 'land investing as an inflation hedge (trending in your network)',
      body: `Inflation eats cash. It doesn't eat dirt.

While everyone debates rates, raw land just sits there — no tenants, no repairs, quietly holding value. And with owner financing, you don't need a bank's blessing to own it.

At Hunter Land Ventures we find the overlooked parcels and make them ownable on terms that fit real life.

The best hedge is the one you can actually afford to start today.`,
      slot: 'Wed, 8:15 AM',
      day: 'Wed',
      time: '8:15 AM',
    },
  },
  {
    id: 's2',
    topic: 'Peptides & physician sourcing',
    why: 'Doctors in your orbit are asking who they can trust. Authority gap you can fill.',
    trend: 'question',
    trendLabel: 'audience question',
    venture: 'peptide',
    draft: {
      signal: 'peptides & physician sourcing (audience question)',
      body: `Every physician I talk to asks the same quiet question about peptides: who can I actually trust?

After 20 years in medical sales, I'll tell you what I told them — sourcing is a trust problem before it's a science problem. The chemistry has to be right. But the relationship is what lets a doctor sleep at night.

That's the standard we're building the company on. Transparency first. Results follow.`,
      slot: 'Thu, 8:00 AM',
      day: 'Thu',
      time: '8:00 AM',
    },
  },
  {
    id: 's3',
    topic: 'EQ in sales leadership',
    why: 'A thread on emotional intelligence is taking off. This is your lane.',
    trend: 'up',
    trendLabel: '↑ trending',
    venture: 'symphony',
    draft: {
      signal: 'EQ in sales leadership (trending)',
      body: `I've logged more than 10,000 hours coaching sales teams. Here's the uncomfortable truth:

Your best rep isn't your smartest rep. It's your most self-aware one.

You can teach product all day. Emotional intelligence — reading the room, managing yourself under pressure, actually listening — is what separates a good month from a career.

Hire for it. Coach for it. Everything else is downstream.`,
      slot: 'Fri, 8:15 AM',
      day: 'Fri',
      time: '8:15 AM',
    },
  },
  {
    id: 's4',
    topic: 'Owner-financing questions spiking',
    why: 'Buyers keep asking how financing works. Educational post = inbound leads.',
    trend: 'question',
    trendLabel: 'audience question',
    venture: 'hunter',
    draft: {
      signal: 'owner-financing questions spiking (audience question)',
      body: `"How does owner financing actually work?" I get this question every single week now.

Simple version: I'm the bank. You put a little down, we agree on a monthly payment, and you start building ownership from day one — no credit committee, no gatekeeper.

At Hunter Land Ventures that's the whole point. Make land ownable for people the banks ignored.

Got a question about it? Ask below. I read every one.`,
      slot: 'Mon, 12:15 PM',
      day: 'Mon',
      time: '12:15 PM',
    },
  },
]

// NOTE: Analytics view intentionally removed. This demo posts to Joe Hunter's
// personal LinkedIn profile, and LinkedIn exposes no analytics API for personal
// profiles — so a live, automated dashboard isn't possible. Rather than show
// numbers that can't be kept real, the view was cut. The story ends at Publish.

// ---- Published / Post History ----
// The honest "proof it worked" view: posts the engine has already sent live.
// Maps 1:1 onto Content Queue rows where Status = "Published" and Live Post URL
// is filled — which the existing Make scenario writes back automatically. No
// LinkedIn analytics needed; these are the receipts, not vanity metrics.
export const SEED_PUBLISHED = [
  {
    id: 'p1',
    venture: 'hunter',
    date: 'Fri, Jul 11 · 8:15 AM',
    body: `"How does owner financing actually work?" I get this every week now.

Simple version: I'm the bank. A little down, a monthly payment we both agree on, and you start building ownership from day one — no credit committee, no gatekeeper.

At Hunter Land Ventures that's the whole point: make land ownable for the people the banks ignored.`,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7488210847123730411',
  },
  {
    id: 'p2',
    venture: 'symphony',
    date: 'Wed, Jul 9 · 7:30 AM',
    body: `The table you build before you need it is the one that saves you.

Symphony Six is Nashville men choosing depth over transactions — Revenue, Resources, Relationships. Bourbon and cigars are just the excuse to show up.

Build the room before the storm. You'll be glad it's there.`,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7487350847123730435',
  },
  {
    id: 'p3',
    venture: 'peptide',
    date: 'Mon, Jul 7 · 8:00 AM',
    body: `Every physician I talk to asks the same quiet question about peptides: who can I actually trust?

After 20 years in medical sales, I'll tell you — sourcing is a trust problem before it's a science problem. The chemistry has to be right. But the relationship is what lets a doctor sleep at night.`,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7486140847123730402',
  },
  {
    id: 'p4',
    venture: 'hunter',
    date: 'Sat, Jul 5 · 9:00 AM',
    body: `Inflation eats cash. It doesn't eat dirt.

While everyone debates rates, raw land just sits there — no tenants, no repairs, quietly holding value. And with owner financing, you don't need a bank's blessing to own it.

The best hedge is the one you can actually afford to start today.`,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7485010847123730488',
  },
]
