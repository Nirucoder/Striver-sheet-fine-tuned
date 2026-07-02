const STATUS_TEXT = {
  idle: "All changes saved",
  saving: "Saving changes…",
  retrying: "Connection issue — retrying…",
  saved: "All changes saved",
  offline: "Offline — changes will sync when you reconnect",
  error: "Couldn't reach the cloud — will retry automatically",
};

function statusTone(status) {
  if (status === "error") return { fg: "#f87171", bg: "rgba(248,113,113,0.08)", border: "#7f1d1d" };
  if (status === "offline" || status === "retrying")
    return { fg: "#fbbf24", bg: "rgba(251,191,36,0.06)", border: "#92400e" };
  return { fg: "#34d399", bg: "rgba(52,211,153,0.08)", border: "#065f46" };
}

/**
 * Cloud Sync status panel. Sync is fully automatic now, so this is read-only:
 * it shows who you're syncing as, the live status, and when you last synced.
 */
export default function AccountSyncModal({ user, status, lastSynced, onClose }) {
  const tone = statusTone(status);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#0f1117",border:"1px solid #2d3154",borderRadius:16,padding:"28px",maxWidth:480,width:"93%",boxShadow:"0 32px 80px rgba(0,0,0,0.8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9"}}>Cloud Sync</div>
          <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",color:"#64748b",fontSize:22,cursor:"pointer"}}>X</button>
        </div>

        <div style={{fontSize:12,color:"#64748b",marginBottom:18,lineHeight:1.7,padding:"11px 13px",background:"rgba(129,140,248,0.05)",border:"1px solid #1e2030",borderRadius:8}}>
          Progress is linked to your Google account and synced automatically in the background. Sign in with the same account on another device and your data loads on its own — there is nothing to save manually.
        </div>

        <div style={{padding:"12px 16px",background:"rgba(52,211,153,0.06)",border:"1px solid #065f46",borderRadius:10,marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
          {user?.picture && <img src={user.picture} alt="" style={{width:34,height:34,borderRadius:"50%"}} />}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,color:"#34d399"}}>
              Syncing as {user?.name || user?.email || "your account"}
            </div>
            <div style={{fontSize:11,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.email}</div>
          </div>
          <span style={{fontSize:10,color:"#34d399"}}>Automatic</span>
        </div>

        <div style={{padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:lastSynced?12:0,background:tone.bg,color:tone.fg,border:`1px solid ${tone.border}`}}>
          {STATUS_TEXT[status] || STATUS_TEXT.idle}
        </div>

        {lastSynced && (
          <div style={{padding:"8px 12px",background:"rgba(52,211,153,0.06)",border:"1px solid #065f46",borderRadius:8,fontSize:12,color:"#34d399"}}>
            Last synced: {new Date(lastSynced).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
          </div>
        )}
      </div>
    </div>
  );
}
