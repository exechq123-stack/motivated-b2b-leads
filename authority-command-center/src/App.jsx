import { useState, useCallback } from 'react'
import {
  LayoutGrid, CalendarDays, Radar, Send,
  Check, X, Pencil, Save, ArrowRight, Clock, ExternalLink,
} from 'lucide-react'
import {
  VENTURES, SEED_DRAFTS, SEED_CALENDAR, SEED_SIGNALS, SEED_PUBLISHED,
} from './data.js'

// Small helper — the recurring gold diamond motif.
const Diamond = ({ className = '' }) => <span className={`diamond ${className}`}>◆</span>

function Pill({ venture }) {
  const v = VENTURES[venture]
  return <span className={`pill ${v.pill}`}>{v.label}</span>
}

// ============================================================
// Approval Queue
// ============================================================
function ApprovalQueue({ drafts, highlightId, onApprove, onSkip, onEdit }) {
  return (
    <div className="view">
      <div className="view-head">
        <h1>{drafts.length} draft{drafts.length === 1 ? '' : 's'} waiting for you</h1>
        <div className="sub">About 15 minutes a week. That's the whole job.</div>
      </div>

      {drafts.length === 0 ? (
        <div className="empty">
          <div className="empty-diamond">◆</div>
          <h3>You're all caught up.</h3>
          <p>New drafts arrive as the engine picks up signal.</p>
        </div>
      ) : (
        <div className="queue">
          {drafts.map((d) => (
            <DraftCard
              key={d.id}
              draft={d}
              highlight={d.id === highlightId}
              onApprove={onApprove}
              onSkip={onSkip}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DraftCard({ draft, highlight, onApprove, onSkip, onEdit }) {
  const [leaving, setLeaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(draft.body)

  const fly = (fn) => {
    setLeaving(true)
    // let the slide/fade play, then mutate state
    window.setTimeout(fn, 420)
  }

  return (
    <div className={`draft-card ${leaving ? 'leaving' : ''} ${highlight ? 'highlight' : ''}`}>
      <div className="draft-top">
        <Pill venture={draft.venture} />
        <span className="signal-source">
          <b>Drafted from:</b> {draft.signal}
        </span>
      </div>

      {editing ? (
        <textarea
          className="post-edit"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
      ) : (
        <div className="post-body">{text}</div>
      )}

      <div>
        <span className="slot"><Clock size={13} /> Suggested: {draft.slot}</span>
      </div>

      <div className="actions">
        <button className="btn btn--primary" onClick={() => fly(() => onApprove({ ...draft, body: text }))}>
          <Check size={16} /> Approve
        </button>

        {editing ? (
          <button
            className="btn btn--ghost"
            onClick={() => { setEditing(false); onEdit(draft.id, text) }}
          >
            <Save size={15} /> Save
          </button>
        ) : (
          <button className="btn btn--ghost" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Edit
          </button>
        )}

        <button className="btn btn--muted" onClick={() => fly(() => onSkip(draft.id))}>
          <X size={15} /> Skip
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Content Calendar
// ============================================================
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_NUMS = { Mon: 14, Tue: 15, Wed: 16, Thu: 17, Fri: 18, Sat: 19, Sun: 20 }

// sort blocks within a day by clock time
function timeKey(t) {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return 0
  let h = parseInt(m[1], 10) % 12
  if (/PM/i.test(m[3])) h += 12
  return h * 60 + parseInt(m[2], 10)
}

function ContentCalendar({ items }) {
  const [preview, setPreview] = useState(null)

  return (
    <div className="view">
      <div className="view-head">
        <h1>Content Calendar</h1>
        <div className="cal-caption">Publishing runs automatically. You don't post — the engine does.</div>
      </div>

      <div className="week">
        {DAYS.map((day) => {
          const blocks = items
            .filter((i) => i.day === day)
            .sort((a, b) => timeKey(a.time) - timeKey(b.time))
          const isEmpty = blocks.length === 0
          return (
            <div className={`day ${isEmpty ? 'empty-day' : ''}`} key={day}>
              <div className="day-head">
                <span className="day-name">{day}</span>
                <span className="day-num">{DAY_NUMS[day]}</span>
              </div>
              {isEmpty ? (
                <span className="cal-empty-day">—</span>
              ) : (
                blocks.map((b) => (
                  <button
                    key={b.id}
                    className={`cal-block ${VENTURES[b.venture].block}`}
                    onClick={() => setPreview(b)}
                  >
                    <div className="cal-time">{b.time}</div>
                    <div className="cal-excerpt">
                      {b.excerpt || b.body.split(/\s+/).slice(0, 6).join(' ') + '…'}
                    </div>
                  </button>
                ))
              )}
            </div>
          )
        })}
      </div>

      {preview && (
        <div className="overlay" onClick={() => setPreview(null)}>
          <div className="preview" onClick={(e) => e.stopPropagation()}>
            <div className="preview-head">
              <Pill venture={preview.venture} />
              <button className="close" onClick={() => setPreview(null)}><X size={18} /></button>
            </div>
            <div className="post-body">{preview.body}</div>
            <div className="preview-meta">
              <Clock size={13} /> {preview.day}, {preview.time} · {preview.status || 'Scheduled'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Signals
// ============================================================
function Signals({ signals, usedIds, onDraft }) {
  return (
    <div className="view">
      <div className="view-head">
        <h1>Your space, monitored around the clock.</h1>
        <div className="sub">Signals the engine is watching right now — turn any of them into a draft.</div>
      </div>

      <div className="signals">
        {signals.map((s) => {
          const used = usedIds.includes(s.id)
          return (
            <div className={`signal-card ${used ? 'used' : ''}`} key={s.id}>
              <div className="signal-main">
                <div className="signal-title">{s.topic}</div>
                <div className="signal-why">{s.why}</div>
                <span className={`trend-tag ${s.trend}`}>{s.trendLabel}</span>
              </div>
              <button className="btn btn--gold" onClick={() => onDraft(s)}>
                {used ? 'Drafted ✓' : <>Draft from this <ArrowRight size={15} /></>}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// Published / Post History — the honest "proof" view
// ============================================================
function Published({ items }) {
  return (
    <div className="view">
      <div className="view-head">
        <h1>Published</h1>
        <div className="sub">Every post the engine has sent live — your receipts, with links. New posts appear here automatically after they publish.</div>
      </div>

      <div className="published">
        {items.map((p) => (
          <div className="pub-card" key={p.id}>
            <div className="pub-meta">
              <Pill venture={p.venture} />
              <span className="pub-live"><span className="live-dot" /> Live</span>
              <span className="pub-date"><Clock size={13} /> {p.date}</span>
            </div>
            <div className="post-body">{p.body}</div>
            <a className="li-link" href={p.url} target="_blank" rel="noreferrer">
              View on LinkedIn <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Shell — sidebar, topbar, splash, toasts, state
// ============================================================
const NAV = [
  { key: 'queue', label: 'Approval Queue', icon: LayoutGrid },
  { key: 'calendar', label: 'Content Calendar', icon: CalendarDays },
  { key: 'published', label: 'Published', icon: Send },
  { key: 'signals', label: 'Signals', icon: Radar },
]

const TITLES = {
  queue: 'Approval Queue',
  calendar: 'Content Calendar',
  published: 'Published',
  signals: 'Signals',
}

export default function App() {
  const [view, setView] = useState('queue')
  const [drafts, setDrafts] = useState(SEED_DRAFTS)
  const [calendar, setCalendar] = useState(SEED_CALENDAR)
  const [usedSignals, setUsedSignals] = useState([])
  const [highlightId, setHighlightId] = useState(null)
  const [toasts, setToasts] = useState([])
  const [splash, setSplash] = useState(true)
  const [splashOut, setSplashOut] = useState(false)
  const [seq, setSeq] = useState(1)

  const pushToast = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  // Approve → remove from queue, add to calendar, toast, counter drops.
  const approve = useCallback((draft) => {
    setCalendar((c) => [
      ...c,
      {
        id: 'cal-' + draft.id,
        venture: draft.venture,
        day: draft.day,
        time: draft.time,
        excerpt: draft.body.split(/\s+/).slice(0, 6).join(' ') + '…',
        body: draft.body,
        status: 'Scheduled',
      },
    ])
    setDrafts((d) => d.filter((x) => x.id !== draft.id))
    pushToast(`Scheduled for ${draft.slot}`)
    setHighlightId(null)
  }, [pushToast])

  const skip = useCallback((id) => {
    setDrafts((d) => d.filter((x) => x.id !== id))
  }, [])

  const editDraft = useCallback((id, body) => {
    setDrafts((d) => d.map((x) => (x.id === id ? { ...x, body } : x)))
  }, [])

  // Signals "Draft from this" → new card into queue, switch to queue, highlight.
  const draftFromSignal = useCallback((signal) => {
    const nid = `sig-${signal.id}-${seq}`
    setSeq((n) => n + 1)
    const nd = {
      id: nid,
      venture: signal.venture,
      signal: signal.draft.signal,
      body: signal.draft.body,
      slot: signal.draft.slot,
      day: signal.draft.day,
      time: signal.draft.time,
    }
    setDrafts((d) => [nd, ...d])
    setUsedSignals((u) => (u.includes(signal.id) ? u : [...u, signal.id]))
    setHighlightId(nid)
    setView('queue')
    pushToast('New draft added to your queue')
    window.setTimeout(() => setHighlightId(null), 1800)
  }, [seq, pushToast])

  const enter = () => {
    setSplashOut(true)
    window.setTimeout(() => setSplash(false), 500)
  }

  return (
    <>
      {splash && (
        <div className={`splash ${splashOut ? 'out' : ''}`}>
          <div className="s-diamond">◆</div>
          <h1>Welcome back, Joe</h1>
          <div className="s-sub">Authority Command Center</div>
          <button className="enter" onClick={enter}>
            Enter Command Center <ArrowRight size={18} />
          </button>
        </div>
      )}

      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand-lockup">
            <div className="brand-line">
              <span className="brand-diamond">◆</span>
              <span className="brand-name">XHQ</span>
            </div>
            <div className="brand-sub">Authority Command Center</div>
          </div>

          <nav className="nav">
            {NAV.map((n) => {
              const Icon = n.icon
              const active = view === n.key
              return (
                <button
                  key={n.key}
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => setView(n.key)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{n.label}</span>
                  {n.key === 'queue' && drafts.length > 0 && (
                    <span className="nav-badge">{drafts.length}</span>
                  )}
                  {n.key === 'signals' && <span className="pulse-dot" />}
                </button>
              )
            })}
          </nav>

          <div className="sidebar-foot">
            <Diamond /> The engine works around the clock so you don't have to.
          </div>
        </aside>

        {/* Main */}
        <div className="main">
          <header className="topbar">
            <div className="topbar-title">
              <span className="kicker">XHQ Authority Revenue Studio</span>
              <h2>{TITLES[view]}</h2>
            </div>
            <div className="user-chip">
              <span className="name">Joe Hunter</span>
              <span className="avatar">JH</span>
            </div>
          </header>

          {view === 'queue' && (
            <ApprovalQueue
              drafts={drafts}
              highlightId={highlightId}
              onApprove={approve}
              onSkip={skip}
              onEdit={editDraft}
            />
          )}
          {view === 'calendar' && <ContentCalendar items={calendar} />}
          {view === 'published' && <Published items={SEED_PUBLISHED} />}
          {view === 'signals' && (
            <Signals signals={SEED_SIGNALS} usedIds={usedSignals} onDraft={draftFromSignal} />
          )}
        </div>
      </div>

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <Check size={16} className="check" /> {t.msg}
          </div>
        ))}
      </div>
    </>
  )
}
