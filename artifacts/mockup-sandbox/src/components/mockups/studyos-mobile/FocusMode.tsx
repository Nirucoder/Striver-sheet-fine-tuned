import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Flame, CheckCircle2, Circle,
  Play, Lock, Star, BarChart2, Zap, ArrowRight, X
} from "lucide-react";

const TOPICS = [
  {
    subject: "DSA", code: "21CSC204J", emoji: "🧠",
    accent: "#8b5cf6", light: "#ede9fe", dark: "#4c1d95",
    chapter: "Arrays & Hashing",
    problems: [
      { id: 1, title: "Two Sum", difficulty: "Easy", done: true, xp: 10 },
      { id: 2, title: "Contains Duplicate", difficulty: "Easy", done: true, xp: 10 },
      { id: 3, title: "Valid Anagram", difficulty: "Easy", done: false, xp: 10 },
      { id: 4, title: "Group Anagrams", difficulty: "Medium", done: false, xp: 20 },
      { id: 5, title: "Top K Frequent", difficulty: "Medium", done: false, xp: 20 },
    ],
    solved: 68, total: 120, streak: 7,
  },
  {
    subject: "OS", code: "21CSC305J", emoji: "💻",
    accent: "#f59e0b", light: "#fef3c7", dark: "#78350f",
    chapter: "Process Scheduling",
    problems: [
      { id: 1, title: "FCFS Algorithm", difficulty: "Easy", done: true, xp: 10 },
      { id: 2, title: "Round Robin", difficulty: "Medium", done: true, xp: 20 },
      { id: 3, title: "Priority Scheduling", difficulty: "Medium", done: false, xp: 20 },
      { id: 4, title: "Deadlock Detection", difficulty: "Hard", done: false, xp: 40 },
    ],
    solved: 42, total: 80, streak: 3,
  },
  {
    subject: "CN", code: "21CSC306J", emoji: "🌐",
    accent: "#10b981", light: "#d1fae5", dark: "#064e3b",
    chapter: "Network Layer",
    problems: [
      { id: 1, title: "IP Addressing", difficulty: "Easy", done: true, xp: 10 },
      { id: 2, title: "Subnetting", difficulty: "Medium", done: false, xp: 20 },
      { id: 3, title: "OSPF Protocol", difficulty: "Hard", done: false, xp: 40 },
    ],
    solved: 55, total: 90, streak: 5,
  },
];

const DIFF_COLOR: Record<string, string> = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#ef4444" };

export function FocusMode() {
  const [topicIdx, setTopicIdx] = useState(0);
  const [showSheet, setShowSheet] = useState(false);

  const topic = TOPICS[topicIdx];
  const pct = Math.round((topic.solved / topic.total) * 100);
  const done = topic.problems.filter((p) => p.done).length;

  function prev() { setTopicIdx((i) => (i - 1 + TOPICS.length) % TOPICS.length); }
  function next() { setTopicIdx((i) => (i + 1) % TOPICS.length); }

  return (
    <div style={{ width: 390, height: 844, fontFamily: "'Inter', sans-serif", background: topic.light, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", transition: "background 0.4s" }}>

      {/* Dynamic Island / status */}
      <div style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: topic.dark }}>9:41</span>
        <div style={{ width: 120, height: 30, background: topic.dark, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, color: "white", fontWeight: 600, opacity: 0.9 }}>StudyOS • SRM KTR</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Flame size={14} color={topic.accent} />
          <span style={{ fontSize: 13, fontWeight: 700, color: topic.dark }}>{topic.streak}d</span>
        </div>
      </div>

      {/* Subject switcher card */}
      <div style={{ margin: "0 20px", position: "relative" }}>
        {/* Prev/Next arrows */}
        <button
          onClick={prev}
          style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 32, height: 32, borderRadius: "50%", background: "white", border: "none", boxShadow: "0 2px 8px #0000001a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft size={16} color={topic.dark} />
        </button>
        <button
          onClick={next}
          style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 32, height: 32, borderRadius: "50%", background: "white", border: "none", boxShadow: "0 2px 8px #0000001a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronRight size={16} color={topic.dark} />
        </button>

        {/* Card */}
        <div style={{ background: topic.accent, borderRadius: 24, padding: "24px 24px 20px", overflow: "hidden", position: "relative" }}>
          {/* Background decoration */}
          <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", right: 20, bottom: -40, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 32 }}>{topic.emoji}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "white", marginTop: 6, letterSpacing: -1 }}>{topic.subject}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{topic.code}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "white" }}>{pct}%</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{topic.solved}/{topic.total} done</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "white", borderRadius: 3, transition: "width 0.6s" }} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
            📖 {topic.chapter}
          </div>
        </div>

        {/* Dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
          {TOPICS.map((_, i) => (
            <div
              key={i}
              onClick={() => setTopicIdx(i)}
              style={{ width: i === topicIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === topicIdx ? topic.accent : "#d1d5db", transition: "all 0.3s", cursor: "pointer" }}
            />
          ))}
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ display: "flex", gap: 8, margin: "16px 20px 0" }}>
        {[
          { label: "XP Today", value: "120 ⚡", color: topic.accent },
          { label: "Chapter", value: `${done}/${topic.problems.length}`, color: topic.accent },
          { label: "Rank", value: "#142", color: topic.accent },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, background: "white", borderRadius: 14, padding: "10px 8px", textAlign: "center", boxShadow: "0 1px 4px #0000000a" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Problem list */}
      <div style={{ flex: 1, overflowY: "auto", margin: "16px 0 0", padding: "0 20px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: topic.dark }}>{topic.chapter}</span>
          <span style={{ fontSize: 11, color: topic.accent, fontWeight: 600 }}>All problems →</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {topic.problems.map((p, i) => (
            <div
              key={p.id}
              style={{
                background: "white", borderRadius: 14, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 1px 4px #0000000a",
                opacity: p.done ? 1 : 1,
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: p.done ? topic.accent : topic.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {p.done
                  ? <CheckCircle2 size={14} color="white" />
                  : <span style={{ fontSize: 11, fontWeight: 700, color: topic.accent }}>{i + 1}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: p.done ? "#94a3b8" : "#0f172a", textDecoration: p.done ? "line-through" : "none" }}>{p.title}</div>
                <div style={{ fontSize: 10, color: DIFF_COLOR[p.difficulty], fontWeight: 700, marginTop: 2 }}>{p.difficulty} • +{p.xp} XP</div>
              </div>
              {!p.done && (
                <button style={{ width: 30, height: 30, borderRadius: "50%", background: topic.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={10} color="white" fill="white" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: "12px 20px 32px", background: "white", borderTop: `1px solid ${topic.light}` }}>
        <button
          style={{ width: "100%", padding: "15px", borderRadius: 18, background: topic.accent, color: "white", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${topic.accent}55` }}
        >
          <Zap size={16} fill="white" />
          Continue {topic.subject}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
