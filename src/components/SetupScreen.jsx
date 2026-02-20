export default function SetupScreen() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg-primary)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:"var(--color-bg-secondary)", border:"1px solid var(--color-border-primary)", borderRadius:20, padding:"40px", maxWidth:540, width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔧</div>
          <div style={{ fontSize:22, fontWeight:800, color:"var(--color-primary-light)", marginBottom:6 }}>Supabase Setup Required</div>
          <div style={{ fontSize:13, color:"var(--color-text-tertiary)" }}>Add your Supabase credentials to the <code>.env</code> file</div>
        </div>

        {[
          ["Step 1", "Go to supabase.com → Create a new project"],
          ["Step 2", "Go to SQL Editor → paste schema.sql → click Run"],
          ["Step 3", "Go to Project Settings → API"],
          ["Step 4", 'Copy "Project URL" → paste as REACT_APP_SUPABASE_URL in .env'],
          ["Step 5", 'Copy "anon / public" key → paste as REACT_APP_SUPABASE_ANON_KEY in .env'],
          ["Step 6", "Save .env and restart: npm start"],
        ].map(([s, d]) => (
          <div key={s} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" }}>
            <span style={{ background:"var(--color-bg-hover)", color:"var(--color-primary-light)", borderRadius:8, padding:"2px 8px", fontSize:11, fontWeight:700, flexShrink:0, marginTop:1 }}>
              {s}
            </span>
            <span style={{ fontSize:13, color:"var(--color-text-secondary)" }}>{d}</span>
          </div>
        ))}

        <div style={{ marginTop:20, background:"rgba(0,0,0,0.3)", borderRadius:10, padding:"14px 16px", fontFamily:"monospace", fontSize:12, color:"var(--color-text-muted)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ color:"var(--color-text-tertiary)", marginBottom:6 }}># .env</div>
          <div>
            <span style={{ color:"#a5b4fc" }}>REACT_APP_SUPABASE_URL</span>
            <span style={{ color:"#e2e8f0" }}>=</span>
            <span style={{ color:"#4ade80" }}>https://xxxx.supabase.co</span>
          </div>
          <div>
            <span style={{ color:"#a5b4fc" }}>REACT_APP_SUPABASE_ANON_KEY</span>
            <span style={{ color:"#e2e8f0" }}>=</span>
            <span style={{ color:"#4ade80" }}>eyJhbGc...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
