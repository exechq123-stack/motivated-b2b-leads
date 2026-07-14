# Authority Command Center — XHQ (Live Demo)

A branded, self-contained single-page demo of the **XHQ Authority Revenue Studio**.
It tells one story end to end: **Signal → Draft → Approve → Publish → Measure.**

All data is mocked in React state — no backend, no API keys. Approving, skipping,
editing, and drafting mutate that state live within a session (no persistence needed).

## The "aha" interaction
Click **Approve** on a drafted post → it slides out of the queue, lands on the
Content Calendar on its suggested date as **Scheduled**, a toast confirms the slot,
and the "drafts waiting" counter drops.

## Views
1. **Approval Queue** (home) — draft cards with Approve / Edit / Skip.
2. **Content Calendar** — week grid; approved posts land here, color-coded by venture.
3. **Signals** — "what we're watching"; *Draft from this* pushes a new card into the Queue.
4. **Analytics** — stat cards + a 6-week impressions chart + top-performing post.

## Run locally
```bash
npm install
npm run dev      # local demo (Vite dev server)
npm run build    # -> dist/ for deploy
npm run preview  # serve the production build
```

## Deploy (shareable URL)
```bash
# easiest: drag the dist/ folder onto https://app.netlify.com/drop
# or:
npx vercel --prod
```

## Stack
Vite + React (JavaScript), plain CSS with variables (`src/theme.css`),
`recharts` for the analytics chart, `lucide-react` for icons,
Fraunces + Hanken Grotesk via Google Fonts.

## Brand
Emerald + gold XHQ house palette, gold diamond (◆) accent motif.
Venture tags: Hunter Land = emerald, Pro Peptide = teal, Symphony = gold.
No vendor names surface in the UI — the client sees outcomes, not the stack.
