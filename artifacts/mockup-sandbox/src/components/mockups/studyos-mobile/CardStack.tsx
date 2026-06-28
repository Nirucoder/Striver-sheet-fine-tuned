import { useState } from "react";
import {
  Home, Code2, BarChart2, Trophy, Settings,
  CheckCircle2, Circle, ChevronRight, Flame,
  ChevronLeft, Target, Bell, Search, Plus, X
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────── */
const SUBJECTS = [
  { code: "21CSC204J", name: "DSA",  color: "#6366f1", bg: "#eef2ff", solved: 68, total: 120, streak: 7 },
  { code: "21CSC305J", name: "OS",   color: "#f59e0b", bg: "#fffbeb", solved: 42, total: 80,  streak: 3 },
  { code: "21CSC306J", name: "CN",   color: "#10b981", bg: "#ecfdf5", solved: 55, total: 90,  streak: 5 },
  { code: "21CSC201J", name: "DBMS", color: "#ef4444", bg: "#fef2f2", solved: 30, total: 70,  streak: 2 },
];

const INITIAL_TODOS = [
  { id: 1, text: "Solve 3 Array problems", done: false },
  { id: 2, text: "Revise OS scheduling notes", done: false },
  { id: 3, text: "Complete CN Chapter 4", done: true },
  { id: 4, text: "Watch DBMS ER diagram video", done: false },
];

const TABS = [
  { icon: Home,     label: "Home"  },
  { icon: Code2,    label: "DSA"   },
  { icon: BarChart2,label: "Stats" },
  { icon: Trophy,   label: "Goals" },
  { icon: Settings, label: "More"  },
];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── Heatmap helpers ───────────────────────────────────────── */
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

/** Fake activity: seed deterministic activity values per day */
function activityForDay(year: number, month: number, day: number): number {
  const seed = (year * 12 + month) * 31 + day;
  const v = ((seed * 1103515245 + 12345) & 0x7fffffff) % 100;
  if (v < 35) return 0;
  if (v < 60) return 1;
  if (v < 78) return 2;
  if (v < 92) return 3;
  return 4;
}

const HEAT_COLORS = ["#e5e7eb", "#c7d2fe", "#818cf8", "#4f46e5", "#312e81"];

function Heatmap({ year, month }: { year: number; month: number }) {
  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month); // 0=Sun
  const cells: (number | null)[] = Array(startDay).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const DOW = ["S","M","T","W","T","F","S"];

  return (
    <div>
      {/* Day-of-week labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
        {DOW.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const level = activityForDay(year, month, d);
          const today = new Date();
          const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
          return (
            <div
              key={d}
              title={`${MONTH_NAMES[month]} ${d}: ${["None","Light","Medium","Good","Excellent"][level]}`}
              style={{
                aspectRatio: "1",
                borderRadius: 3,
                background: HEAT_COLORS[level],
                border: isToday ? "2px solid #6366f1" : "none",
                boxSizing: "border-box",
              }}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 9, color: "#94a3b8" }}>Less</span>
        {HEAT_COLORS.map((c, i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 9, color: "#94a3b8" }}>More</span>
      </div>
    </div>
  );
}

/* ─── Progress Ring ─────────────────────────────────────────── */
function ProgressRing({ value, size = 48, stroke = 5, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
        {Math.round(value)}%
      </text>
    </svg>
  );
}

/* ─── Component ─────────────────────────────────────────────── */
export function CardStack() {
  const [activeTab, setActiveTab]   = useState(0);
  const [expandedCard, setExpanded] = useState<number | null>(null);
  const [todos, setTodos]           = useState(INITIAL_TODOS);
  const [newTodo, setNewTodo]       = useState("");
  const [addingTodo, setAddingTodo] = useState(false);

  const now   = new Date();
  const [heatYear,  setHeatYear]  = useState(now.getFullYear());
  const [heatMonth, setHeatMonth] = useState(now.getMonth());

  function prevMonth() {
    if (heatMonth === 0) { setHeatMonth(11); setHeatYear(y => y - 1); }
    else setHeatMonth(m => m - 1);
  }
  function nextMonth() {
    if (heatMonth === 11) { setHeatMonth(0); setHeatYear(y => y + 1); }
    else setHeatMonth(m => m + 1);
  }

  function toggleTodo(id: number) {
    setTodos(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }
  function removeTodo(id: number) {
    setTodos(ts => ts.filter(t => t.id !== id));
  }
  function addTodo() {
    if (!newTodo.trim()) return;
    setTodos(ts => [...ts, { id: Date.now(), text: newTodo.trim(), done: false }]);
    setNewTodo("");
    setAddingTodo(false);
  }

  const totalSolved   = SUBJECTS.reduce((s, x) => s + x.solved, 0);
  const pendingTodos  = todos.filter(t => !t.done).length;

  return (
    <div style={{ width: 390, height: 844, fontFamily: "'Inter',sans-serif", background: "#f8fafc", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* ── Status bar ── */}
      <div style={{ height: 44, background: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>9:41</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#6366f1", letterSpacing: -0.3 }}>StudyOS</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Bell size={16} color="#64748b" />
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 10, fontWeight: 800 }}>AK</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 82 }}>

        {/* ── TODO section ── */}
        <div style={{ background: "white", borderBottom: "1px solid #f1f5f9", padding: "14px 16px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Target size={15} color="#6366f1" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>To-Do</span>
              {pendingTodos > 0 && (
                <span style={{ background: "#6366f1", color: "white", fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "1px 7px" }}>{pendingTodos}</span>
              )}
            </div>
            <button
              onClick={() => setAddingTodo(a => !a)}
              style={{ width: 26, height: 26, borderRadius: "50%", background: "#eef2ff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Plus size={13} color="#6366f1" />
            </button>
          </div>

          {/* Add input */}
          {addingTodo && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input
                autoFocus
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTodo()}
                placeholder="New task…"
                style={{ flex: 1, border: "1.5px solid #c7d2fe", borderRadius: 10, padding: "7px 10px", fontSize: 13, outline: "none", color: "#0f172a", background: "#f8fafc" }}
              />
              <button
                onClick={addTodo}
                style={{ padding: "7px 12px", borderRadius: 10, background: "#6366f1", color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >Add</button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {todos.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => toggleTodo(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
                  {t.done
                    ? <CheckCircle2 size={18} color="#10b981" />
                    : <Circle size={18} color="#cbd5e1" />}
                </button>
                <span style={{ flex: 1, fontSize: 13, color: t.done ? "#94a3b8" : "#0f172a", textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                <button onClick={() => removeTodo(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 0.4 }}>
                  <X size={12} color="#64748b" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hero strip (no rank) ── */}
        <div style={{ background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)", padding: "16px 18px 20px", color: "white" }}>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 2 }}>Good morning, Arjun 👋</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 14 }}>Your Progress</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Solved", value: totalSolved },
              { label: "Streak",  value: "7d 🔥"   },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(4px)" }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
                <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Activity Heatmap ── */}
        <div style={{ margin: "14px 14px 0", background: "white", borderRadius: 16, padding: "14px 14px 10px", boxShadow: "0 1px 4px #0000000a" }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={14} color="#475569" />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{MONTH_NAMES[heatMonth]} {heatYear}</span>
            <button
              onClick={nextMonth}
              disabled={heatYear === now.getFullYear() && heatMonth === now.getMonth()}
              style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: (heatYear === now.getFullYear() && heatMonth === now.getMonth()) ? 0.3 : 1 }}
            >
              <ChevronRight size={14} color="#475569" />
            </button>
          </div>
          <Heatmap year={heatYear} month={heatMonth} />
        </div>

        {/* ── Subject Progress ── */}
        <div style={{ padding: "14px 14px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Subject Progress</span>
            <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>See all</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {SUBJECTS.map((sub, i) => {
              const pct    = Math.round((sub.solved / sub.total) * 100);
              const isOpen = expandedCard === i;
              return (
                <div
                  key={sub.code}
                  onClick={() => setExpanded(isOpen ? null : i)}
                  style={{
                    background: "white", borderRadius: 14, padding: "13px 14px",
                    boxShadow: isOpen ? `0 4px 20px ${sub.color}22` : "0 1px 4px #0000000a",
                    border: isOpen ? `2px solid ${sub.color}44` : "2px solid transparent",
                    transition: "all 0.2s", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: sub.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: sub.color }}>{sub.name}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{sub.name}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{sub.code}</div>
                      <div style={{ marginTop: 6, height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: sub.color, borderRadius: 2, transition: "width 0.5s" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                      <ProgressRing value={pct} color={sub.color} />
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Flame size={9} color="#f59e0b" />
                        <span style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700 }}>{sub.streak}d</span>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${sub.color}22` }}>
                      <div style={{ display: "flex", gap: 7 }}>
                        {[
                          { label: "Solved",    v: sub.solved,              c: sub.color  },
                          { label: "Remaining", v: sub.total - sub.solved,  c: "#94a3b8"  },
                          { label: "Total",     v: sub.total,               c: "#0f172a"  },
                        ].map(({ label, v, c }) => (
                          <div key={label} style={{ flex: 1, background: sub.bg, borderRadius: 9, padding: "7px 8px", textAlign: "center" }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
                            <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{label}</div>
                          </div>
                        ))}
                      </div>
                      <button style={{ width: "100%", marginTop: 9, padding: "9px", borderRadius: 9, background: sub.color, color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Continue Studying →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 14 }} />
      </div>

      {/* ── Bottom Nav ── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "white", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", boxShadow: "0 -4px 16px #0000000a" }}>
        {TABS.map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            onClick={() => setActiveTab(i)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", cursor: "pointer", padding: "8px 0" }}
          >
            <Icon size={19} color={activeTab === i ? "#6366f1" : "#94a3b8"} />
            <span style={{ fontSize: 9, fontWeight: activeTab === i ? 700 : 500, color: activeTab === i ? "#6366f1" : "#94a3b8" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
