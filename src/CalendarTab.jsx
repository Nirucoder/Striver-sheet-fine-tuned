import { useState, useEffect, useCallback, useRef } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/calendar";
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const COLORS = { gcal:"#818cf8", todo:"#34d399", local:"#60a5fa", weekly:"#fbbf24" };

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

function fmtDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

export default function CalendarTab({ todos = [], weekStatus = [] }) {
  const [accessToken, setAccessToken]   = useState(() => {
    const tok = localStorage.getItem("gcal_token");
    const exp = localStorage.getItem("gcal_token_exp");
    if (tok && exp && parseInt(exp) > Date.now() + 60000) return tok;
    return null;
  });
  const [tokenExpiry, setTokenExpiry]   = useState(() => {
    const e = localStorage.getItem("gcal_token_exp");
    return e ? parseInt(e) : null;
  });
  const [gcalEvents, setGcalEvents]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail]     = useState(null);
  const [newEv, setNewEv]               = useState({ title:"", description:"", startTime:"09:00", endTime:"10:00", allDay:false });
  const [localEvents, setLocalEvents]   = useLocalStorageState("studyos_cal_v1", []);
  const tokenClientRef    = useRef(null);
  const pollRef           = useRef(null);
  const gisReady          = useRef(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    if (window.google?.accounts?.oauth2) { initTokenClient(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = initTokenClient;
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch {} };
  }, []);

  function initTokenClient() {
    if (!window.google?.accounts?.oauth2 || gisReady.current) return;
    gisReady.current = true;
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) {
          // silent re-auth failed (user not logged in) — don't show error, just wait for manual connect
          if (resp.error === "interaction_required" || resp.error === "access_denied") return;
          setError(`Auth error: ${resp.error}`);
          return;
        }
        const exp = Date.now() + resp.expires_in * 1000;
        setAccessToken(resp.access_token);
        setTokenExpiry(exp);
        localStorage.setItem("gcal_token", resp.access_token);
        localStorage.setItem("gcal_token_exp", String(exp));
        setError(null);
      }
    });
    // Auto silent re-auth: if user previously connected and token is cached, get a new one silently
    const cachedExp = localStorage.getItem("gcal_token_exp");
    const hasCachedSession = localStorage.getItem("gcal_token") && cachedExp;
    if (hasCachedSession) {
      // Small delay to ensure tokenClientRef is fully ready
      setTimeout(() => {
        tokenClientRef.current?.requestAccessToken({ prompt: "" });
      }, 300);
    }
  }

  const isValid = useCallback(() =>
    !!(accessToken && tokenExpiry && tokenExpiry > Date.now() + 60000),
    [accessToken, tokenExpiry]
  );

  const signIn = (silent = false) => {
    if (!tokenClientRef.current) {
      initTokenClient();
      setTimeout(() => tokenClientRef.current?.requestAccessToken({ prompt: silent ? "" : "consent" }), 500);
      return;
    }
    tokenClientRef.current.requestAccessToken({ prompt: silent ? "" : "consent" });
  };

  const signOut = () => {
    if (accessToken && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(accessToken);
    setAccessToken(null); setTokenExpiry(null); setGcalEvents([]);
    localStorage.removeItem("gcal_token"); localStorage.removeItem("gcal_token_exp");
  };

  const fetchEvents = useCallback(async (token) => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const yr = currentDate.getFullYear(), mo = currentDate.getMonth();
      const tMin = new Date(yr, mo - 1, 1).toISOString();
      const tMax = new Date(yr, mo + 2, 0, 23, 59, 59).toISOString();
      const params = new URLSearchParams({ timeMin:tMin, timeMax:tMax, singleEvents:"true", orderBy:"startTime", maxResults:"500" });
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        { headers: { Authorization:`Bearer ${token}` } });
      if (res.status === 401) { setAccessToken(null); localStorage.removeItem("gcal_token"); localStorage.removeItem("gcal_token_exp"); setError("Session expired — please reconnect."); return; }
      if (!res.ok) throw new Error(`GCal error ${res.status}`);
      const data = await res.json();
      setGcalEvents(data.items || []);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [currentDate]);



  useEffect(() => {
    if (isValid()) {
      fetchEvents(accessToken);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchEvents(accessToken), 60000);
    }
    return () => clearInterval(pollRef.current);
  }, [accessToken, currentDate, isValid, fetchEvents]);



  async function createGCalEvent(ev) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const body = {
      summary: ev.title,
      description: ev.description || "",
      start: ev.allDay ? { date: ev.date } : { dateTime:`${ev.date}T${ev.startTime}:00`, timeZone:tz },
      end:   ev.allDay ? { date: ev.date } : { dateTime:`${ev.date}T${ev.endTime}:00`, timeZone:tz }
    };
    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method:"POST", headers:{ Authorization:`Bearer ${accessToken}`, "Content-Type":"application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("Failed to create event in GCal");
    return res.json();
  }

  async function deleteGCalEvent(id) {
    await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${id}`,
      { method:"DELETE", headers:{ Authorization:`Bearer ${accessToken}` } });
  }



  async function handleAddEvent() {
    if (!newEv.title.trim() || !selectedDate) return;
    const dateStr = fmtDate(selectedDate);
    const localEv = { id:`local_${Date.now()}`, title:newEv.title, description:newEv.description,
      date:dateStr, startTime:newEv.startTime, endTime:newEv.endTime, allDay:newEv.allDay, gcalId:null };
    if (isValid()) {
      try {
        const gcalEv = await createGCalEvent({ ...localEv });
        localEv.gcalId = gcalEv?.id;
        // Event successfully synced to GCal — don't also store in localEvents
        // (GCal fetch will return it, so storing locally causes duplicates)
        setShowAddModal(false);
        setNewEv({ title:"", description:"", startTime:"09:00", endTime:"10:00", allDay:false });
        fetchEvents(accessToken);
        return;
      } catch(e) {
        console.error("GCal create failed, saving locally:", e);
      }
    }
    // Only save locally if not synced to GCal
    setLocalEvents(p => [...p, localEv]);
    setShowAddModal(false);
    setNewEv({ title:"", description:"", startTime:"09:00", endTime:"10:00", allDay:false });
  }

  async function handleDeleteEvent(ev) {
    if (ev._src === "gcal" && isValid()) {
      // Delete directly from Google Calendar using the event's own id
      await deleteGCalEvent(ev.id).catch(console.error);
      setShowDetail(null);
      fetchEvents(accessToken);
      return;
    }
    // Local event: also remove from GCal if it was synced
    if (ev.gcalId && isValid()) await deleteGCalEvent(ev.gcalId).catch(console.error);
    setLocalEvents(p => p.filter(e => e.id !== ev.id));
    setShowDetail(null);
    if (isValid()) fetchEvents(accessToken);
  }

  function getEventsForDate(dateStr) {
    const out = [];
    const gcalIds = new Set();
    gcalEvents.forEach(ev => {
      const s = ev.start?.date || ev.start?.dateTime?.slice(0,10);
      if (s === dateStr) {
        out.push({ ...ev, _src:"gcal", _color:COLORS.gcal, _label: ev.summary || "Untitled" });
        gcalIds.add(ev.id);
      }
    });
    localEvents.forEach(ev => {
      if (ev.date === dateStr) {
        // Skip if this event was synced to GCal — it already shows via gcalEvents
        if (ev.gcalId) return;
        out.push({ ...ev, _src:"local", _color:COLORS.local, _label:ev.title });
      }
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
          {loading && <span style={{ fontSize:11, color:"#64748b" }}>↻ Syncing…</span>}
          {!isValid() ? (
            <button onClick={signIn} style={S.btn("#1e1b4b","#4338ca","#a5b4fc")}>
              Connect Google Calendar
            </button>
          ) : (
            <>
              <span style={{ fontSize:11, color:"#34d399", display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:8 }}>●</span> Google Calendar connected
              </span>
              <button onClick={() => fetchEvents(accessToken)} style={S.btn("#0f1117","#2d3154","#64748b")}>↻ Refresh</button>
              <button onClick={signOut} style={S.btn("#0f1117","#2d3154","#475569")}>Disconnect</button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid #7f1d1d", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:12, marginBottom:16, display:"flex", justifyContent:"space-between" }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer" }}>×</button>
        </div>
      )}

      {/* Sync info text */}
      <div style={{ display:"flex", gap:10, marginBottom:20, alignItems:"center", flexWrap:"wrap" }}>
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
        {[["gcal","Google Calendar"],["local","Added here"]].map(([k,lbl]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:COLORS[k] }} />
            <span style={{ fontSize:11, color:"#475569" }}>{lbl}</span>
          </div>
        ))}
        {!CLIENT_ID && (
          <span style={{ fontSize:11, color:"#f87171", marginLeft:"auto" }}>⚠ VITE_GOOGLE_CLIENT_ID not set</span>
        )}
      </div>

      {/* ── Add Event Modal ───────────────────────────────── */}
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

            {!isValid() && (
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
                {isValid() ? "Save & sync to GCal ↑" : "Save locally"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Detail Modal ────────────────────────────── */}
      {showDetail && (
        <div style={S.modal} onClick={() => setShowDetail(null)}>
          <div style={S.mBox} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", marginBottom:4 }}>
                  {showDetail._label}
                </div>
                <div style={{ fontSize:11, color: COLORS[showDetail._src] || "#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  {showDetail._src === "gcal" ? "Google Calendar" : showDetail._src === "todo" ? "To-Do item" : "Local event"}
                </div>
              </div>
              <button onClick={() => setShowDetail(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>

            <div style={{ fontSize:12, color:"#64748b", marginBottom:12 }}>
              {showDetail.start?.dateTime
                ? new Date(showDetail.start.dateTime).toLocaleString("en-IN",{ weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })
                : showDetail.start?.date || showDetail.date || ""}
            </div>

            {showDetail.description && (
              <div style={{ fontSize:13, color:"#94a3b8", marginBottom:16, lineHeight:1.6, padding:"10px 12px", background:"#0a0b0d", borderRadius:8, border:"1px solid #1a1d2e" }}>
                {showDetail.description}
              </div>
            )}

            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              {(showDetail._src === "local" || (showDetail._src === "gcal" && isValid())) && (
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
