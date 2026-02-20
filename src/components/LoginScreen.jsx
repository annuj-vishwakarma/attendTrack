import { useState } from 'react';

export default function LoginScreen({ users, login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const found = users.find(u => u.username === username && u.password === password);
      if (found) {
        login(found);
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      {/* Background blobs */}
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)", top:-100, left:-100, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,0.1),transparent 70%)", bottom:-50, right:-50, pointerEvents:"none" }}/>

      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow:"0 8px 24px rgba(99,102,241,0.4)", marginBottom:12, fontSize:22 }}>
            📋
          </div>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.5px", background:"linear-gradient(135deg,#a5b4fc,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            AttendTrack Pro
          </div>
          <div style={{ fontSize:11, color:"var(--color-text-muted)", marginTop:3 }}>Organisation Attendance Management</div>
        </div>

        {/* Username */}
        <div style={{ marginBottom:12 }}>
          <label className="field-label">Username</label>
          <input
            className="field-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter username"
            autoFocus
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom:18, position:"relative" }}>
          <label className="field-label">Password</label>
          <input
            className="field-input"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password"
          />
          <span
            onClick={() => setShowPw(s => !s)}
            style={{ position:"absolute", right:12, top:30, cursor:"pointer", color:"var(--color-text-tertiary)", fontSize:12, userSelect:"none" }}
          >
            {showPw ? 'Hide' : 'Show'}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:"var(--color-danger-bg)", border:"1px solid var(--color-danger-border)", borderRadius:8, padding:"9px 13px", fontSize:13, color:"var(--color-danger-text)", marginBottom:13 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ width:"100%", padding:"12px", fontSize:14 }}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        {/* Hint */}
        <div style={{ marginTop:14, padding:"10px 13px", background:"rgba(99,102,241,0.08)", borderRadius:10, border:"1px solid rgba(99,102,241,0.15)" }}>
          <div style={{ fontSize:10, color:"var(--color-text-tertiary)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>Default Credentials</div>
          <div style={{ fontSize:12, color:"var(--color-text-muted)" }}>
            Username: <span style={{ color:"var(--color-text-secondary)", fontWeight:700 }}>admin</span>
            &nbsp;|&nbsp;
            Password: <span style={{ color:"var(--color-text-secondary)", fontWeight:700 }}>admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
