import { isSessionValid } from "./authUtils.js";

export default function AccountSyncModal({ session, syncStatus, onForcePush, onForcePull, onClose, lastSynced }) {
  const tokenValid = isSessionValid(session);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#0f1117",border:"1px solid #2d3154",borderRadius:16,padding:"28px",maxWidth:480,width:"93%",boxShadow:"0 32px 80px rgba(0,0,0,0.8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9"}}>Cloud Sync</div>
          <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",color:"#64748b",fontSize:22,cursor:"pointer"}}>X</button>
        </div>

        <div style={{fontSize:12,color:"#64748b",marginBottom:18,lineHeight:1.7,padding:"11px 13px",background:"rgba(129,140,248,0.05)",border:"1px solid #1e2030",borderRadius:8}}>
          Progress is linked to your Google account. Sign in with the same account on another device and your saved data loads automatically. Changes are kept up to date in the background.
        </div>

        <div style={{padding:"12px 16px",background:tokenValid?"rgba(52,211,153,0.06)":"rgba(251,191,36,0.06)",border:`1px solid ${tokenValid?"#065f46":"#92400e"}`,borderRadius:10,marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
          {session?.picture && <img src={session.picture} alt="" style={{width:34,height:34,borderRadius:"50%"}} />}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,color:tokenValid?"#34d399":"#fbbf24"}}>
              {tokenValid ? `\u2713 Syncing as ${session.name || session.email}` : "\u26A0 Sync pauses until your app login refreshes"}
            </div>
            <div style={{fontSize:11,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis"}}>{session?.email}</div>
          </div>
          {tokenValid && <span style={{fontSize:10,color:"#34d399"}}>Automatic</span>}
        </div>
        {!tokenValid && (
          <div style={{marginBottom:16,padding:"12px",background:"rgba(251,191,36,0.04)",border:"1px solid #92400e",borderRadius:10,fontSize:11,color:"#fbbf24",lineHeight:1.6,textAlign:"center"}}>
            Sync uses the same Google profile you used to enter the app. Once your app login is active again, your progress continues syncing automatically.
          </div>
        )}

        {tokenValid && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <button onClick={onForcePush} style={{padding:"11px",background:"#1e1b4b",border:"1px solid #4338ca",borderRadius:9,color:"#a5b4fc",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save now</button>
            <button onClick={onForcePull} style={{padding:"11px",background:"#0f2918",border:"1px solid #166534",borderRadius:9,color:"#86efac",fontSize:12,fontWeight:600,cursor:"pointer"}}>Check for updates</button>
          </div>
        )}

        {lastSynced && (
          <div style={{marginBottom:syncStatus?12:0,padding:"8px 12px",background:"rgba(52,211,153,0.06)",border:"1px solid #065f46",borderRadius:8,fontSize:12,color:"#34d399"}}>
            Last synced: {new Date(lastSynced).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
          </div>
        )}

        {syncStatus && (
          <div style={{padding:"10px 14px",borderRadius:8,fontSize:13,background:syncStatus.startsWith("\u2713")?"rgba(52,211,153,0.08)":syncStatus.startsWith("\u2717")?"rgba(248,113,113,0.08)":"rgba(129,140,248,0.08)",color:syncStatus.startsWith("\u2713")?"#34d399":syncStatus.startsWith("\u2717")?"#f87171":"#818cf8",border:`1px solid ${syncStatus.startsWith("\u2713")?"#065f46":syncStatus.startsWith("\u2717")?"#7f1d1d":"#312e81"}`}}>
            {syncStatus}
          </div>
        )}
      </div>
    </div>
  );
}
