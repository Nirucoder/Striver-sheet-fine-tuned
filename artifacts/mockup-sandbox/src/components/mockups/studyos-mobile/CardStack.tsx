import { useState } from "react";
import {
  Home, Code2, BookOpen, BarChart2, Trophy, Settings,
  CheckCircle2, Circle, ChevronRight, Flame, Star, TrendingUp,
  Zap, Target, Clock, Bell, Search
} from "lucide-react";

const SUBJECTS = [
  { code: "21CSC204J", name: "DSA", color: "#6366f1", bg: "#eef2ff", solved: 68, total: 120, streak: 7 },
  { code: "21CSC305J", name: "OS", color: "#f59e0b", bg: "#fffbeb", solved: 42, total: 80, streak: 3 },
  { code: "21CSC306J", name: "CN", color: "#10b981", bg: "#ecfdf5", solved: 55, total: 90, streak: 5 },
  { code: "21CSC201J", name: "DBMS", color: "#ef4444", bg: "#fef2f2", solved: 30, total: 70, streak: 2 },
];

const RECENT = [
  { title: "Two Sum", tag: "Array", hard: false, done: true },
  { title: "Binary Search", tag: "Search", hard: false, done: true },
  { title: "LRU Cache", tag: "HashMap", hard: true, done: false },
  { title: "Merge Intervals", tag: "Array", hard: false, done: true },
];

const TABS = [
  { icon: Home, label: "Home" },
  { icon: Code2, label: "DSA" },
  { icon: BarChart2, label: "Stats" },
  { icon: Trophy, label: "Goals" },
  { icon: Settings, label: "More" },
];

function ProgressRing({ value, size = 52, stroke = 5, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{Math.round(value)}%</text>
    </svg>
  );
}

export function CardStack() {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const totalSolved = SUBJECTS.reduce((s, x) => s + x.solved, 0);
  const totalProblems = SUBJECTS.reduce((s, x) => s + x.total, 0);

  return (
    <div style={{ width: 390, height: 844, fontFamily: "'Inter', sans-serif", background: "#f8fafc", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Status bar */}
      <div style={{ height: 44, background: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Bell size={15} color="#64748b" />
          <Search size={15} color="#64748b" />
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>AK</span>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
        {/* Hero summary strip */}
        <div style={{ background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)", padding: "20px 20px 24px", color: "white" }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Good morning, Arjun 👋</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 16 }}>Your Progress</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Solved", value: totalSolved, icon: CheckCircle2 },
              { label: "Streak", value: "7d 🔥", icon: Flame },
              { label: "Rank", value: "#142", icon: Trophy },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 12px", backdropFilter: "blur(4px)" }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
                <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Subjects */}
        <div style={{ padding: "20px 16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Subjects</span>
            <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>See all</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SUBJECTS.map((sub, i) => {
              const pct = Math.round((sub.solved / sub.total) * 100);
              const isOpen = expandedCard === i;
              return (
                <div
                  key={sub.code}
                  onClick={() => setExpandedCard(isOpen ? null : i)}
                  style={{
                    background: "white", borderRadius: 16, padding: "14px 16px",
                    boxShadow: isOpen ? `0 4px 20px ${sub.color}22` : "0 1px 4px #0000000a",
                    border: isOpen ? `2px solid ${sub.color}44` : "2px solid transparent",
                    transition: "all 0.2s", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: sub.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: sub.color }}>{sub.name}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{sub.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub.code}</div>
                      <div style={{ marginTop: 6, height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: sub.color, borderRadius: 2, transition: "width 0.5s" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <ProgressRing value={pct} color={sub.color} />
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Flame size={10} color="#f59e0b" />
                        <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600 }}>{sub.streak}d</span>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${sub.color}22` }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[
                          { label: "Solved", v: sub.solved, c: sub.color },
                          { label: "Remaining", v: sub.total - sub.solved, c: "#94a3b8" },
                          { label: "Total", v: sub.total, c: "#0f172a" },
                        ].map(({ label, v, c }) => (
                          <div key={label} style={{ flex: 1, background: sub.bg, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: c }}>{v}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{label}</div>
                          </div>
                        ))}
                      </div>
                      <button
                        style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, background: sub.color, color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                      >Continue Studying →</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Recent */}
        <div style={{ padding: "20px 16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Recent Problems</span>
            <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>View all</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RECENT.map((p) => (
              <div key={p.title} style={{ display: "flex", alignItems: "center", gap: 12, background: "white", borderRadius: 12, padding: "12px 14px", boxShadow: "0 1px 3px #0000000a" }}>
                {p.done
                  ? <CheckCircle2 size={20} color="#10b981" />
                  : <Circle size={20} color="#cbd5e1" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{p.tag}</div>
                </div>
                {p.hard && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", background: "#fef2f2", borderRadius: 6, padding: "2px 7px" }}>Hard</span>
                )}
                <ChevronRight size={14} color="#cbd5e1" />
              </div>
            ))}
          </div>
        </div>

        {/* Today's goal strip */}
        <div style={{ margin: "20px 16px 0", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, border: "1px solid #bbf7d0" }}>
          <Target size={24} color="#10b981" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Daily Goal: 3 problems</div>
            <div style={{ height: 6, background: "#d1fae5", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "66%", background: "#10b981", borderRadius: 3 }} />
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>2/3</span>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 72, background: "white", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", boxShadow: "0 -4px 20px #0000000a" }}>
        {TABS.map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            onClick={() => setActiveTab(i)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: "8px 0" }}
          >
            <Icon size={20} color={activeTab === i ? "#6366f1" : "#94a3b8"} />
            <span style={{ fontSize: 10, fontWeight: activeTab === i ? 700 : 500, color: activeTab === i ? "#6366f1" : "#94a3b8" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
