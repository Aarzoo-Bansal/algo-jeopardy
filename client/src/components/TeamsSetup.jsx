// TeamsSetup.jsx
import { useState } from 'react'
import ParticlesBg from './ParticlesBg'

const AVATARS = [
    "\u{1F916}", "\u{1F47E}", "\u{1F4BB}", "\u2328\uFE0F", "\u{1F5A5}\uFE0F", "\u{1F5B1}\uFE0F", "\u{1F4BE}", "\u{1F4BF}", "\u{1F4F1}", "\u2699\uFE0F",
    "\u{1F3AE}", "\u{1F579}\uFE0F", "\u{1F441}\uFE0F", "\u{1F9FF}", "\u{1F52E}", "\u{1F3AF}", "\u{1F3B2}", "\u{1F3B0}", "\u{1F3EA}", "\u{1F3AD}",
    "\u26A1", "\u{1F525}", "\u{1F4A5}", "\u2728", "\u2B50", "\u{1F31F}", "\u{1F4AB}", "\u{1F320}", "\u2604\uFE0F", "\u{1FA90}",
    "\u{1F3C6}", "\u{1F947}", "\u{1F948}", "\u{1F949}", "\u{1F451}", "\u{1F48E}", "\u{1F48D}", "\u{1F531}", "\u2694\uFE0F", "\u{1F6E1}\uFE0F",
    "\u{1F984}", "\u{1F409}", "\u{1F996}", "\u{1F9BE}", "\u{1F9E0}", "\u{1F47D}", "\u{1F921}", "\u{1F9D9}", "\u{1F977}", "\u{1F9B8}",
    "\u{1F52C}", "\u{1F9EA}", "\u{1F9EC}", "\u{1F52D}", "\u{1F4E1}", "\u{1F6F8}", "\u{1F680}", "\u{1F6F0}\uFE0F", "\u269B\uFE0F", "\u{1F9F2}",
];

export default function TeamsSetup({
    gameTitle, teams, onAddTeam, onRemoveTeam, onBack, onStart, dbError
}) {
    const [newTeamName, setNewTeamName] = useState("")
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])

    const addTeam = () => {
        if (newTeamName.trim() && teams.length < 12) {
            onAddTeam(newTeamName.trim(), selectedAvatar)
            setNewTeamName("")
            const used = [...teams.map(t => t.avatar), selectedAvatar]
            setSelectedAvatar(AVATARS.find(a => !used.includes(a)) || AVATARS[0])
        }
    }

    return (

        <div style={{ minHeight: "100vh", background: "#080c16", padding: 24, color: "#e2e8f0", fontFamily: "monospace", position: "relative", overflow: "hidden" }}>
            <ParticlesBg />
            <div className="scanlines" />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 850, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 40, paddingTop: 20 }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                        <button
                            onClick={() => window.location.href = '/admin'}
                            style={{
                                background: "#0b1a24",
                                border: "1px solid rgba(6,182,212,0.3)",
                                color: "#06b6d4",
                                borderRadius: 8,
                                padding: "8px 16px",
                                cursor: "pointer",
                                fontFamily: "monospace",
                                fontSize: 12,
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: 8
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="4 17 10 11 4 5" />
                                <line x1="12" y1="19" x2="20" y2="19" />
                            </svg>
                            ADMIN PANEL
                        </button>
                    </div>
                    <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 20, background: "#0b1a24", border: "1px solid rgba(6,182,212,0.2)", fontSize: 11, color: "#06b6d4", letterSpacing: 3, marginBottom: 16 }}>JEOPARDY GAME</div>
                    <h1 className="gradient-text" style={{ fontSize: "clamp(28px, 8vw, 56px)", fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg,#06b6d4 0%,#8b5cf6 25%,#ec4899 50%,#f59e0b 75%,#06b6d4 100%)", backgroundSize: "200% 200%", marginBottom: 16, letterSpacing: -1, animation: "glowShift 6s ease-in-out infinite" }}>{gameTitle || "JEOPARDY"}</h1>
                    <p style={{ color: "#9ba7b8", fontSize: "11px", background: "#0b1a24", display: "inline", boxDecorationBreak: "clone", padding: "6px 18px", borderRadius: "20px", letterSpacing: "3px" }}>{"> initialize_game() // v2.0"}</p>
                    {dbError && <p style={{ marginTop: 8, fontSize: 12, color: "#f59e0b" }}>⚠ {dbError}</p>}
                </div>

                <div style={{ background: "linear-gradient(145deg,rgba(15,23,42,0.8),rgba(30,41,59,0.6))", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 16, padding: 28, marginBottom: 20, backdropFilter: "blur(10px)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4" }} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#06b6d4" }}>ADD_TEAMS()</span>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", color: "#475569", fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>TEAM NAME</label>
                        <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} onKeyDown={e => e.key === "Enter" && addTeam()} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "#0f172a", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)", outline: "none", fontFamily: "monospace", fontSize: 14 }} placeholder="enter team name..." />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", color: "#475569", fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>SELECT AVATAR</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))", gap: 6 }}>
                            {AVATARS.map(av => (
                                <button key={av} onClick={() => setSelectedAvatar(av)} style={{ fontSize: 22, padding: 6, borderRadius: 8, border: selectedAvatar === av ? "2px solid #06b6d4" : "1px solid #1e293b", background: selectedAvatar === av ? "rgba(6,182,212,0.15)" : "#0f172a", cursor: "pointer", transition: "all 0.15s", transform: selectedAvatar === av ? "scale(1.15)" : "scale(1)" }}>{av}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={addTeam} disabled={!newTeamName.trim() || teams.length >= 12} className="btn-primary" style={{ width: "100%", fontSize: 15, padding: "14px 0" }}>+ ADD TEAM {teams.length >= 12 ? "(MAX 12)" : ""}</button>
                </div>

                {teams.length > 0 && (
                    <div style={{ background: "linear-gradient(145deg,rgba(15,23,42,0.8),rgba(30,41,59,0.6))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: 28, marginBottom: 20, backdropFilter: "blur(10px)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6" }} />
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#8b5cf6" }}>TEAMS[{teams.length}]</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {teams.map((team, i) => (
                                <div key={i} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 32 }}>{team.avatar}</span>
                                        <span style={{ fontSize: 16, fontWeight: 700, color: "#c4b5fd" }}>{team.name}</span>
                                    </div>
                                    <button onClick={() => onRemoveTeam(i)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontFamily: "monospace", fontWeight: 700, fontSize: 13, transition: "all 0.2s" }}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onBack}
                        style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontSize: 16, fontWeight: 700, fontFamily: "monospace", cursor: "pointer" }}>
                        ← BACK
                    </button>
                    <button onClick={onStart} disabled={teams.length === 0}
                        style={{
                            flex: 2, padding: "14px 0", borderRadius: 12, border: "none",
                            cursor: teams.length === 0 ? "not-allowed" : "pointer",
                            background: teams.length === 0 ? "#1e293b" : "linear-gradient(135deg,#ec4899,#8b5cf6,#06b6d4)",
                            color: teams.length === 0 ? "#475569" : "#fff",
                            fontSize: 18, fontWeight: 900, fontFamily: "monospace", transition: "all 0.3s",
                            boxShadow: teams.length > 0 ? "0 8px 32px rgba(139,92,246,0.3)" : "none"
                        }}>
                        START GAME ▶
                    </button>
                </div>
            </div>
        </div>
    )
}