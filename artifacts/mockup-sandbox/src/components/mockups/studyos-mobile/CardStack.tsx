import { useState } from "react";
import {
  Home, Code2, BarChart2, Trophy, Settings,
  CheckCircle2, Circle, Flame, ChevronLeft, ChevronRight,
  Target, Bell, Plus, X, Snowflake, Shield, Lock
} from "lucide-react";

/* ── Tokens ──────────────────────────────────────────────── */
const D = {
  bg:        "#0f1117",
  surface:   "#1a1d27",
  card:      "#1e2130",
  border:    "#2a2d3e",
  muted:     "#3a3d52",
  dimText:   "#6b7280",
  subText:   "#9ca3af",
  text:      "#e2e8f0",
  bright:    "#f1f5f9",
  accent:    "#818cf8",   // indigo-400
  accentDim: "#312e81",
  green:     "#34d399",
  amber:     "#fbbf24",
  red:       "#f87171",
};

/* ── Subject data ────────────────────────────────────────── */
const SUBJECTS = [
  { code: "21CSC204J", name: "DSA",  color: "#818cf8", glow: "#818cf844", solved: 68, total: 120, streak: 7  },
  { code: "21CSC305J", name: "OS",   color: "#fbbf24", glow: "#fbbf2433", solved: 42, total: 80,  streak: 3  },
  { code: "21CSC306J", name: "CN",   color: "#34d399", glow: "#34d39933", solved: 55, total: 90,  streak: 5  },
  { code: "21CSC201J", name: "DBMS", color: "#f87171", glow: "#f8717133", solved: 30, total: 70,  streak: 2  },
];

const INITIAL_TODOS = [
  { id: 1, text: "Solve 3 Array problems",          done: false },
  { id: 2, text: "Revise OS scheduling notes",       done: false },
  { id: 3, text: "Complete CN Chapter 4",            done: true  },
  { id: 4, text: "Watch DBMS ER diagram video",      done: false },
];

const TABS = [
  { icon: Home,      label: "Home"  },
  { icon: Code2,     label: "DSA"   },
  { icon: BarChart2, label: "Stats" },
  { icon: Trophy,    label: "Goals" },
  { icon: Settings,  label: "More"  },
];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Helpers ─────────────────────────────────────────────── */
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

function activityLevel(y: number, m: number, d: number): number {
  const seed = (y * 12 + m) * 31 + d;
  const v = ((seed * 1103515245 + 12345) & 0x7fffffff) % 100;
  if (v < 35) return 0;
  if (v < 58) return 1;
  if (v < 76) return 2;
  if (v < 91) return 3;
  return 4;
}

const HEAT = ["#1e2130", "#312e81", "#4338ca", "#6366f1", "#a5b4fc"];

/* ── Sub-components ──────────────────────────────────────── */
function ProgressRing({ value, size = 46, stroke = 5, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={D.muted} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
        {Math.round(value)}%
      </text>
    </svg>
  );
}

function Heatmap({ year, month }: { year: number; month: number }) {
  const days = daysInMonth(year, month);
  const start = firstDayOfMonth(year, month);
  const cells: (number | null)[] = Array(start).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const DOW = ["S","M","T","W","T","F","S"];
  const today = new Date();

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:4 }}>
        {DOW.map((l, i) => (
          <div key={i} style={{ textAlign:"center", fontSize:9, color: D.dimText, fontWeight:600 }}>{l}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const lv = activityLevel(year, month, d);
          const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
          return (
            <div key={d} style={{
              aspectRatio:"1", borderRadius:3,
              background: HEAT[lv],
              border: isToday ? `1.5px solid ${D.accent}` : "none",
              boxSizing:"border-box",
            }} />
          );
        })}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:8, justifyContent:"flex-end" }}>
        <span style={{ fontSize:9, color: D.dimText }}>Less</span>
        {HEAT.map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:2, background:c, border:`1px solid ${D.border}` }} />)}
        <span style={{ fontSize:9, color: D.dimText }}>More</span>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export function CardStack() {
  const [activeTab, setActiveTab]      = useState(0);
  const [expandedCard, setExpanded]    = useState<number|null>(null);
  const [todos, setTodos]              = useState(INITIAL_TODOS);
  const [newTodo, setNewTodo]          = useState("");
  const [addingTodo, setAddingTodo]    = useState(false);
  const [freezeUsed, setFreezeUsed]    = useState(false);
  const [freezeConfirm, setFreezeConfirm] = useState(false);

  const now = new Date();
  const [heatYear,  setHeatYear]  = useState(now.getFullYear());
  const [heatMonth, setHeatMonth] = useState(now.getMonth());

  function prevMonth() {
    if (heatMonth === 0) { setHeatMonth(11); setHeatYear(y => y-1); }
    else setHeatMonth(m => m-1);
  }
  function nextMonth() {
    if (heatYear === now.getFullYear() && heatMonth === now.getMonth()) return;
    if (heatMonth === 11) { setHeatMonth(0); setHeatYear(y => y+1); }
    else setHeatMonth(m => m+1);
  }

  function toggleTodo(id: number) { setTodos(ts => ts.map(t => t.id===id ? {...t, done:!t.done} : t)); }
  function removeTodo(id: number) { setTodos(ts => ts.filter(t => t.id!==id)); }
  function addTodo() {
    if (!newTodo.trim()) return;
    setTodos(ts => [...ts, { id: Date.now(), text: newTodo.trim(), done: false }]);
    setNewTodo(""); setAddingTodo(false);
  }

  const totalSolved  = SUBJECTS.reduce((s,x) => s+x.solved, 0);
  const totalStreak  = 7;
  const freezesLeft  = freezeUsed ? 1 : 2;
  const pendingCount = todos.filter(t => !t.done).length;
  const atCurrentMonth = heatYear === now.getFullYear() && heatMonth === now.getMonth();

  return (
    <div style={{ width:390, height:844, fontFamily:"'Inter',sans-serif", background: D.bg, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative", color: D.text }}>

      {/* ── Status bar ── */}
      <div style={{ height:44, background: D.surface, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px", borderBottom:`1px solid ${D.border}`, flexShrink:0 }}>
        <span style={{ fontSize:13, fontWeight:700, color: D.bright }}>9:41</span>
        <span style={{ fontSize:14, fontWeight:800, background:"linear-gradient(90deg,#818cf8,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>StudyOS</span>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Bell size={16} color={D.dimText} />
          <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"white", fontSize:10, fontWeight:800 }}>AK</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:82 }}>

        {/* ══ HERO: Solved + Streak at top ══ */}
        <div style={{ background: D.surface, borderBottom:`1px solid ${D.border}`, padding:"16px 16px 14px" }}>
          <div style={{ fontSize:11, color: D.dimText, marginBottom:10 }}>Good morning, Arjun 👋</div>

          {/* Stat pills row */}
          <div style={{ display:"flex", gap:8 }}>
            {/* Solved */}
            <div style={{ flex:1, background: D.card, borderRadius:14, padding:"12px 14px", border:`1px solid ${D.border}` }}>
              <div style={{ fontSize:24, fontWeight:900, color: D.accent, letterSpacing:-1 }}>{totalSolved}</div>
              <div style={{ fontSize:10, color: D.dimText, marginTop:2 }}>Problems Solved</div>
            </div>

            {/* Streak + Freeze */}
            <div style={{ flex:1, background: D.card, borderRadius:14, padding:"12px 14px", border:`1px solid ${D.border}`, position:"relative" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:24, fontWeight:900, color: D.amber, letterSpacing:-1, display:"flex", alignItems:"center", gap:5 }}>
                    {totalStreak}
                    <Flame size={18} color={D.amber} fill={D.amber} />
                  </div>
                  <div style={{ fontSize:10, color: D.dimText, marginTop:2 }}>Day Streak</div>
                </div>
                {/* Freeze badge */}
                <button
                  onClick={() => !freezeUsed && setFreezeConfirm(true)}
                  title="Use Streak Freeze"
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:1,
                    background: freezeUsed ? D.muted : "#1e3a5f",
                    border: `1px solid ${freezeUsed ? D.border : "#3b82f6"}`,
                    borderRadius:9, padding:"5px 7px", cursor: freezeUsed ? "default":"pointer"
                  }}
                >
                  {freezeUsed
                    ? <Lock size={12} color={D.dimText} />
                    : <Snowflake size={12} color="#60a5fa" />}
                  <span style={{ fontSize:8, fontWeight:700, color: freezeUsed ? D.dimText : "#60a5fa" }}>
                    {freezeUsed ? "Used" : `${freezesLeft}x`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Streak freeze protect banner */}
          {!freezeUsed && (
            <div style={{ marginTop:8, background:"#0c1a2e", borderRadius:10, padding:"7px 12px", display:"flex", alignItems:"center", gap:8, border:"1px solid #1d4ed855" }}>
              <Shield size={13} color="#60a5fa" />
              <span style={{ fontSize:11, color:"#93c5fd", flex:1 }}>Streak Freeze protects you for 1 missed day</span>
              <span style={{ fontSize:10, color: D.dimText }}>{freezesLeft}/2 left</span>
            </div>
          )}
        </div>

        {/* ══ FREEZE CONFIRM MODAL ══ */}
        {freezeConfirm && (
          <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)" }}>
            <div style={{ width:390, background: D.surface, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", border:`1px solid ${D.border}` }}>
              <div style={{ textAlign:"center", marginBottom:16 }}>
                <Snowflake size={36} color="#60a5fa" style={{ margin:"0 auto 10px" }} />
                <div style={{ fontSize:18, fontWeight:800, color: D.bright, marginBottom:6 }}>Use Streak Freeze?</div>
                <div style={{ fontSize:13, color: D.subText, lineHeight:1.5 }}>
                  This will protect your {totalStreak}-day streak if you miss tomorrow. You have <strong style={{ color:"#93c5fd" }}>{freezesLeft} freeze{freezesLeft > 1 ? "s" : ""}</strong> remaining.
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button
                  onClick={() => setFreezeConfirm(false)}
                  style={{ flex:1, padding:"12px", borderRadius:12, background: D.card, color: D.subText, border:`1px solid ${D.border}`, fontSize:14, fontWeight:600, cursor:"pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setFreezeUsed(true); setFreezeConfirm(false); }}
                  style={{ flex:1, padding:"12px", borderRadius:12, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", color:"white", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px #3b82f644" }}
                >
                  ❄️ Activate Freeze
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ TO-DO ══ */}
        <div style={{ margin:"12px 14px 0", background: D.card, borderRadius:16, border:`1px solid ${D.border}`, overflow:"hidden" }}>
          <div style={{ padding:"13px 14px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <Target size={14} color={D.accent} />
                <span style={{ fontSize:13, fontWeight:700, color: D.bright }}>To-Do</span>
                {pendingCount > 0 && (
                  <span style={{ background: D.accent, color:"white", fontSize:10, fontWeight:700, borderRadius:20, padding:"1px 7px" }}>{pendingCount}</span>
                )}
              </div>
              <button
                onClick={() => setAddingTodo(a => !a)}
                style={{ width:26, height:26, borderRadius:"50%", background: D.muted, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
              >
                <Plus size={13} color={D.accent} />
              </button>
            </div>

            {addingTodo && (
              <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                <input
                  autoFocus value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && addTodo()}
                  placeholder="New task…"
                  style={{ flex:1, background: D.surface, border:`1.5px solid ${D.accent}55`, borderRadius:10, padding:"8px 10px", fontSize:12, outline:"none", color: D.text }}
                />
                <button onClick={addTodo} style={{ padding:"8px 12px", borderRadius:10, background: D.accent, color:"white", border:"none", fontSize:12, fontWeight:700, cursor:"pointer" }}>Add</button>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {todos.map((t, i) => (
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 0", borderBottom: i < todos.length-1 ? `1px solid ${D.border}` : "none" }}>
                  <button onClick={() => toggleTodo(t.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, flexShrink:0 }}>
                    {t.done
                      ? <CheckCircle2 size={17} color={D.green} />
                      : <Circle size={17} color={D.muted} />}
                  </button>
                  <span style={{ flex:1, fontSize:13, color: t.done ? D.dimText : D.text, textDecoration: t.done ? "line-through":"none" }}>{t.text}</span>
                  <button onClick={() => removeTodo(t.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, opacity:0.4 }}>
                    <X size={12} color={D.subText} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ ACTIVITY HEATMAP ══ */}
        <div style={{ margin:"12px 14px 0", background: D.card, borderRadius:16, padding:"14px", border:`1px solid ${D.border}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <button onClick={prevMonth} style={{ width:28, height:28, borderRadius:"50%", background: D.muted, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <ChevronLeft size={14} color={D.text} />
            </button>
            <span style={{ fontSize:13, fontWeight:700, color: D.bright }}>{MONTH_NAMES[heatMonth]} {heatYear}</span>
            <button
              onClick={nextMonth}
              style={{ width:28, height:28, borderRadius:"50%", background: D.muted, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity: atCurrentMonth ? 0.3 : 1 }}
            >
              <ChevronRight size={14} color={D.text} />
            </button>
          </div>
          <Heatmap year={heatYear} month={heatMonth} />
        </div>

        {/* ══ SUBJECT PROGRESS ══ */}
        <div style={{ padding:"12px 14px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontSize:13, fontWeight:700, color: D.bright }}>Subject Progress</span>
            <span style={{ fontSize:11, color: D.accent, fontWeight:600 }}>See all</span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {SUBJECTS.map((sub, i) => {
              const pct    = Math.round((sub.solved / sub.total) * 100);
              const isOpen = expandedCard === i;
              return (
                <div
                  key={sub.code}
                  onClick={() => setExpanded(isOpen ? null : i)}
                  style={{
                    background: isOpen ? D.surface : D.card,
                    borderRadius:14, padding:"13px 14px",
                    border: `1px solid ${isOpen ? sub.color + "55" : D.border}`,
                    boxShadow: isOpen ? `0 0 20px ${sub.glow}` : "none",
                    transition:"all 0.2s", cursor:"pointer",
                  }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    {/* Icon badge */}
                    <div style={{ width:40, height:40, borderRadius:11, background: sub.color + "22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${sub.color}33` }}>
                      <span style={{ fontSize:11, fontWeight:900, color: sub.color }}>{sub.name}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:13, fontWeight:700, color: D.bright }}>{sub.name}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                          <Flame size={9} color={D.amber} />
                          <span style={{ fontSize:9, color: D.amber, fontWeight:700 }}>{sub.streak}d</span>
                        </div>
                      </div>
                      <div style={{ fontSize:10, color: D.dimText, marginTop:1 }}>{sub.code}</div>
                      <div style={{ marginTop:6, height:3, background: D.muted, borderRadius:2, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background: sub.color, borderRadius:2, transition:"width 0.5s", boxShadow:`0 0 6px ${sub.color}88` }} />
                      </div>
                    </div>
                    <ProgressRing value={pct} color={sub.color} />
                  </div>

                  {isOpen && (
                    <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${sub.color}22` }}>
                      <div style={{ display:"flex", gap:7 }}>
                        {[
                          { label:"Solved",    v: sub.solved,             c: sub.color  },
                          { label:"Left",      v: sub.total - sub.solved, c: D.dimText  },
                          { label:"Total",     v: sub.total,              c: D.subText  },
                        ].map(({ label, v, c }) => (
                          <div key={label} style={{ flex:1, background: D.bg, borderRadius:9, padding:"8px 0", textAlign:"center", border:`1px solid ${D.border}` }}>
                            <div style={{ fontSize:16, fontWeight:800, color:c }}>{v}</div>
                            <div style={{ fontSize:9, color: D.dimText, marginTop:1 }}>{label}</div>
                          </div>
                        ))}
                      </div>
                      <button style={{ width:"100%", marginTop:10, padding:"10px", borderRadius:10, background: sub.color, color:"white", border:"none", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 14px ${sub.glow}` }}>
                        Continue {sub.name} →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height:14 }} />
      </div>

      {/* ── Bottom Nav ── */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:70, background: D.surface, borderTop:`1px solid ${D.border}`, display:"flex", alignItems:"center", backdropFilter:"blur(12px)" }}>
        {TABS.map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            onClick={() => setActiveTab(i)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, border:"none", background:"none", cursor:"pointer", padding:"8px 0" }}
          >
            {activeTab === i && (
              <div style={{ position:"absolute", width:32, height:2, background: D.accent, borderRadius:1, bottom:68, boxShadow:`0 0 8px ${D.accent}` }} />
            )}
            <Icon size={19} color={activeTab === i ? D.accent : D.dimText} />
            <span style={{ fontSize:9, fontWeight: activeTab === i ? 700 : 500, color: activeTab === i ? D.accent : D.dimText }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
