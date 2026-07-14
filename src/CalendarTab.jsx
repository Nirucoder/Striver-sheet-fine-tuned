import { useState, useEffect, useCallback, useRef } from "react";

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const COLORS = { gcal:"#818cf8", local:"#60a5fa" };

function getCsrfToken() {
  const m = document.cookie.match(/studyos_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function fmtDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function useLocalStorageState(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  const setter = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, setter];
}

export default function CalendarTab({ todos = [], weekStatus = [] }) {
  const [connected, setConnected]       = useState(false);
  const [calEmail, setCalEmail]         = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [gcalEvents, setGcalEvents]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail]     = useState(null);
  const [newEv, setNewEv]               = useState({ title:"", description:"", startTime:"09:00", endTime:"10:00", allDay:false });
  const [localEvents, setLocalEvents]   = useLocalStorageState("studyos_cal_v1", []);
  const pollRef = useRef(null);

  // Handle ?calendar=connected or ?calendar_error= redirect from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected") {
      setConnected(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("calendar");
      window.history.replaceState({}, "", url.toString());
    }
    if (params.get("calendar_error")) {
      const code = params.get("calendar_error");
      const messages = {
        no_refresh_token: "No refresh token received — please disconnect Google Calendar in your Google Account settings, then reconnect here.",
        not_authenticated: "Your session expired. Please sign in again.",
        state_mismatch: "Security check failed. Please try connecting again.",
        server_error: "A server error occurred. Please try again.",
      };
      setError(messages[code] || `Connection failed: ${code}`);
      const url = new URL(window.location.href);
      url.searchParams.delete("calendar_error");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  // Check backend connection status on mount
  useEffect(() => {
    (async () => {
      setStatusLoading(true);
      try {
        const res = await fetch("/api/calendar/status", { credentials: "include" });
        const data = await res.json();
        setConnected(!!data.connected);
        setCalEmail(data.email || null);
      } catch {
        setConnected(false);
      } finally {
        setStatusLoading(false);
      }
    })();
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    setError(null);
    try {
      const yr = currentDate.getFullYear(), mo = currentDate.getMonth();
      const timeMin = new Date(yr, mo - 1, 1).toISOString();
      const timeMax = new Date(yr, mo + 2, 0, 23, 59, 59).toISOString();
      const res = await fetch(`/api/calendar/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "calendar_revoked") {
          setConnected(false); setCalEmail(null);
          setError("Google Calendar access was revoked. Please reconnect.");
        }
        return;
      }
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setGcalEvents(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [connected, currentDate]);

  useEffect(() => {
    if (connected) {
      fetchEvents();
      clearInterval(pollRef.current);
      pollRef.current = setInterval(fetchEvents, 60000);
    }
    return () => clearInterval(pollRef.current);
  }, [connected, currentDate, fetchEvents]);

  async function connectCalendar() {
    setError(null);
    try {
      const res = await fetch("/api/calendar/connect", { credentials: "include" });
      if (res.status === 503) {
        const data = await res.json();
        setError(data.hint || "Calendar not configured on server. Set GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI.");
        return;
      }
      if (!res.ok) { setError("Failed to start connection."); return; }
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      setError(e.message);
    }
  }

  async function disconnectCalendar() {
    try {
      await fetch("/api/calendar/disconnect", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      });
      setConnected(false); setCalEmail(null); setGcalEvents([]);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAddEvent() {
    if (!newEv.title.trim() || !selectedDate) return;
    const dateStr = fmtDate(selectedDate);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (connected) {
      try {
        const body = {
          summary: newEv.title,
          description: newEv.description || "",
          start: newEv.allDay ? { date: dateStr } : { dateTime:`${dateStr}T${newEv.startTime}:00`, timeZone:tz },
          end:   newEv.allDay ? { date: dateStr } : { dateTime:`${dateStr}T${newEv.endTime}:00`,   timeZone:tz },
        };
        const res = await fetch("/api/calendar/create-event", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        setShowAddModal(false);
        setNewEv({ title:"", description:"", startTime:"09:00", endTime:"10:00", allDay:false });
        fetchEvents();
        return;
      } catch (e) {
        console.error("GCal create failed, saving locally:", e);
      }
    }
    setLocalEvents(p => [...p, {
      id:`local_${Date.now()}`, title:newEv.title, description:newEv.description,
      date:dateStr, startTime:newEv.startTime, endTime:newEv.endTime, allDay:newEv.allDay,
    }]);
    setShowAddModal(false);
    setNewEv({ title:"", description:"", startTime:"09:00", endTime:"10:00", allDay:false });
  }

  async function handleDeleteEvent(ev) {
    if (ev._src === "gcal" && connected) {
      try {
        await fetch(`/api/calendar/delete-event?eventId=${encodeURIComponent(ev.id)}`, {
          method: "DELETE", credentials: "include",
          headers: { "x-csrf-token": getCsrfToken() },
        });
        setShowDetail(null); fetchEvents(); return;
      } catch (e) { console.error("Delete failed:", e); }
    }
    setLocalEvents(p => p.filter(e => e.id !== ev.id));
    setShowDetail(null);
    if (connected) fetchEvents();
  }

  function getEventsForDate(dateStr) {
    const out = [];
    gcalEvents.forEach(ev => {
      const s = ev.start?.date || ev.start?.dateTime?.slice(0,10);
      if (s === dateStr) out.push({ ...ev, _src:"gcal", _color:COLORS.gcal, _label:ev.summary || "Untitled" });
    });
    localEvents.forEach(ev => {
      if (ev.date === dateStr) out.push({ ...ev, _src:"local", _color:COLORS.local, _label:ev.title });
    });
    return out;
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = fmtDate(new Date());
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  const S = {
    wrap:      { padding:"24px 28px", color:"#e2e8f0", overflowY:"auto", height:"100%" },
    topBar:    { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 },
    title:     { fontSize:22, fontWeight:700, color:"#f1f5f9", display:"flex", alignItems:"center", gap:10 },
    btn:       (bg,border,color) => ({ padding:"8px 16px", background:bg, border:`1px solid ${border}`, borderRadius:8, color, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }),
    navBtn:    { background:"none", border:"1px solid #2d3154", borderRadius:6, color:"#94a3b8", padding:"6px 14px", cursor:"pointer", fontSize:18, lineHeight:1 },
    monthLbl:  { fontSize:18, fontWeight:700, color:"#f1f5f9", minWidth:200, textAlign:"center" },
    grid:      { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 },
    dayHdr:    { textAlign:"center", fontSize:10, color:"#475569", fontWeight:700, padding:"8px 0", textTransform:"uppercase", letterSpacing:"0.06em" },
    cell:      (isToday,isSel) => ({
      minHeight:88, background: isSel ? "#1e1b4b" : isToday ? "#0f1629" : "#0a0b0d",
      border:`1px solid ${isSel ? "#4338ca" : isToday ? "#312e81" : "#1a1d2e"}`,
      borderRadius:8, padding:"6px 7px", cursor:"pointer",
    }),
    emptyCell: { minHeight:88 },
    dateNum:   (isToday) => ({ fontSize:12, fontWeight: isToday?700:400, color: isToday?"#818cf8":"#475569", marginBottom:4 }),
    pill:      (color) => ({ fontSize:10, background:`${color}1a`, color, border:`1px solid ${color}33`,
      borderRadius:4, padding:"2px 5px", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block", lineHeight:1.4 }),
    modal:     { position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center" },
    mBox:      { background:"#0f1117", border:"1px solid #2d3154", borderRadius:14, padding:"28px 32px", maxWidth:440, width:"90%", boxShadow:"0 24px 60px rgba(0,0,0,0.6)" },
    input:     { width:"100%", padding:"9px 12px", background:"#1a1d2e", border:"1px solid #2d3154", borderRadius:8, color:"#e2e8f0", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:12, fontFamily:"inherit" },
    lbl:       { fontSize:10, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block", fontWeight:600 },
  };

  return (
    <div style={S.wrap}>
      {/* Top bar */}
      <div style={S.topBar}>
        <div style={S.title}>📅 Calendar</div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          {(loading || statusLoading) && <span style={{ fontSize:11, color:"#64748b" }}>↻ Syncing…</span>}
          {!statusLoading && (
            connected ? (
              <>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
                  <span style={{ fontSize:11, color:"#34d399", display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:8 }}>●</span> Google Calendar connected
                  </span>
                  {calEmail && <span style={{ fontSize:10, color:"#475569" }}>{calEmail}</span>}
                </div>
                <button onClick={fetchEvents} style={S.btn("#0f1117","#2d3154","#64748b")}>↻ Refresh</button>
                <button onClick={disconnectCalendar} style={S.btn("#0f1117","#2d3154","#475569")}>Disconnect</button>
              </>
            ) : (
              <button onClick={connectCalendar} style={S.btn("#1e1b4b","#4338ca","#a5b4fc")}>
                Connect Google Calendar
              </button>
            )
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid #7f1d1d", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:12, marginBottom:16, display:"flex", justifyContent:"space-between", gap:12 }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", flexShrink:0 }}>×</button>
        </div>
      )}

      <div style={{ display:"flex", gap:10, marginBottom:20, alignItems:"center" }}>
        <span style={{ fontSize:11, color:"#334155", marginLeft:"auto" }}>Click any date to add an event</span>
      </div>

      {/* Month navigation */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, justifyContent:"center" }}>
        <button onClick={() => setCurrentDate(new Date(year, month-1, 1))} style={S.navBtn}>‹</button>
        <div style={S.monthLbl}>{MONTHS[month]} {year}</div>
        <button onClick={() => setCurrentDate(new Date(year, month+1, 1))} style={S.navBtn}>›</button>
        <button onClick={() => setCurrentDate(new Date())} style={{ ...S.navBtn, fontSize:11, padding:"6px 12px" }}>Today</button>
      </div>

      {/* Day headers */}
      <div style={S.grid}>
        {DAYS.map(d => <div key={d} style={S.dayHdr}>{d}</div>)}
      </div>

      {/* Calendar cells */}
      <div style={S.grid}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} style={S.emptyCell} />;
          const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isToday = dateStr === today;
          const isSel   = selectedDate && fmtDate(selectedDate) === dateStr;
          const evs     = getEventsForDate(dateStr);
          return (
            <div key={dateStr} style={S.cell(isToday, isSel)}
              onClick={() => { setSelectedDate(new Date(year, month, day)); setShowAddModal(true); }}>
              <div style={S.dateNum(isToday)}>{isToday ? <b>{day}</b> : day}</div>
              {evs.slice(0,3).map((ev,j) => (
                <div key={ev.id||j} style={S.pill(ev._color)}
                  onClick={e => { e.stopPropagation(); setShowDetail(ev); }}>
                  {ev._label}
                </div>
              ))}
              {evs.length > 3 && <div style={{ fontSize:9, color:"#475569", marginTop:1 }}>+{evs.length-3} more</div>}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:20, marginTop:18, flexWrap:"wrap" }}>
        {[["gcal","Google Calendar"],["local","Added here (offline)"]].map(([k,lbl]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:COLORS[k] }} />
            <span style={{ fontSize:11, color:"#475569" }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* ── Add Event Modal ─── */}
      {showAddModal && (
        <div style={S.modal} onClick={() => setShowAddModal(false)}>
          <div style={S.mBox} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>
                Add Event — {selectedDate?.toLocaleDateString("en-IN",{ weekday:"short", month:"short", day:"numeric" })}
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background:"none", border:"none", color:"#64748b", fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>

            <label style={S.lbl}>Title *</label>
            <input style={S.input} placeholder="e.g. Solve Arrays problems" value={newEv.title}
              onChange={e => setNewEv(p=>({...p,title:e.target.value}))} autoFocus
              onKeyDown={e => e.key==="Enter" && handleAddEvent()} />

            <label style={S.lbl}>Description</label>
            <input style={S.input} placeholder="Optional notes" value={newEv.description}
              onChange={e => setNewEv(p=>({...p,description:e.target.value}))} />

            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"#94a3b8", marginBottom:12 }}>
              <input type="checkbox" checked={newEv.allDay} onChange={e => setNewEv(p=>({...p,allDay:e.target.checked}))} />
              All-day event
            </label>

            {!newEv.allDay && (
              <div style={{ display:"flex", gap:12, marginBottom:4 }}>
                <div style={{ flex:1 }}>
                  <label style={S.lbl}>Start</label>
                  <input type="time" style={S.input} value={newEv.startTime}
                    onChange={e => setNewEv(p=>({...p,startTime:e.target.value}))} />
                </div>
                <div style={{ flex:1 }}>
                  <label style={S.lbl}>End</label>
                  <input type="time" style={S.input} value={newEv.endTime}
                    onChange={e => setNewEv(p=>({...p,endTime:e.target.value}))} />
                </div>
              </div>
            )}

            {!connected && (
              <div style={{ fontSize:11, color:"#fbbf24", marginBottom:14, padding:"8px 10px", background:"rgba(251,191,36,0.06)", borderRadius:6, border:"1px solid rgba(251,191,36,0.2)" }}>
                ⚠ Connect Google Calendar to sync this event to your phone too
              </div>
            )}

            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 }}>
              <button onClick={() => setShowAddModal(false)}
                style={{ padding:"9px 20px", background:"none", border:"1px solid #2d3154", borderRadius:8, color:"#64748b", cursor:"pointer", fontSize:13 }}>
                Cancel
              </button>
              <button onClick={handleAddEvent}
                style={{ padding:"9px 20px", background:"#1e1b4b", border:"1px solid #4338ca", borderRadius:8, color:"#a5b4fc", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                {connected ? "Save & sync to GCal ↑" : "Save locally"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Detail Modal ─── */}
      {showDetail && (
        <div style={S.modal} onClick={() => setShowDetail(null)}>
          <div style={S.mBox} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", marginBottom:4 }}>
                  {showDetail._label}
                </div>
                <div style={{ fontSize:11, color: COLORS[showDetail._src] || "#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  {showDetail._src === "gcal" ? "Google Calendar" : "Local event"}
                </div>
              </div>
              <button onClick={() => setShowDetail(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>

            <div style={{ fontSize:12, color:"#64748b", marginBottom:12 }}>
              {showDetail.start?.dateTime
                ? new Date(showDetail.start.dateTime).toLocaleString("en-IN",{ weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })
                : showDetail.start?.date || showDetail.date || ""}
            </div>

            {(showDetail.description || showDetail.summary !== showDetail._label) && (
              <div style={{ fontSize:13, color:"#94a3b8", marginBottom:16, lineHeight:1.6, padding:"10px 12px", background:"#0a0b0d", borderRadius:8, border:"1px solid #1a1d2e" }}>
                {showDetail.description || ""}
              </div>
            )}

            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              {(showDetail._src === "local" || (showDetail._src === "gcal" && connected)) && (
                <button onClick={() => handleDeleteEvent(showDetail)}
                  style={{ padding:"8px 16px", background:"rgba(248,113,113,0.08)", border:"1px solid #7f1d1d", borderRadius:8, color:"#f87171", cursor:"pointer", fontSize:12 }}>
                  🗑 Delete
                </button>
              )}
              {showDetail._src === "gcal" && showDetail.htmlLink && (
                <a href={showDetail.htmlLink} target="_blank" rel="noreferrer"
                  style={{ padding:"8px 16px", background:"#1e1b4b", border:"1px solid #4338ca", borderRadius:8, color:"#a5b4fc", cursor:"pointer", fontSize:12, textDecoration:"none" }}>
                  Open in Google Calendar ↗
                </a>
              )}
              <button onClick={() => setShowDetail(null)}
                style={{ padding:"8px 16px", background:"none", border:"1px solid #2d3154", borderRadius:8, color:"#64748b", cursor:"pointer", fontSize:12 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
