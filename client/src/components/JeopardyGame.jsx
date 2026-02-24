import { useState, useEffect } from "react";
import ParticlesBg from './ParticlesBg'
import SpinWheel from './SpinWheel'
import ConfettiBurst from './ConfettiBurst'
import CircularTimer from './CircularTimer'
import ScorePop from './ScorePop'


// =====================================================
// DATABASE CONFIGURATION
// =====================================================
const API_BASE_URL = import.meta.env.VITE_API_URL;
const QUESTIONS_PER_CATEGORY = 5;
const DIFFICULTY_LEVELS = [100, 200, 300, 400, 500];

const AVATARS = [
  "\u{1F916}","\u{1F47E}","\u{1F4BB}","\u2328\uFE0F","\u{1F5A5}\uFE0F","\u{1F5B1}\uFE0F","\u{1F4BE}","\u{1F4BF}","\u{1F4F1}","\u2699\uFE0F",
  "\u{1F3AE}","\u{1F579}\uFE0F","\u{1F441}\uFE0F","\u{1F9FF}","\u{1F52E}","\u{1F3AF}","\u{1F3B2}","\u{1F3B0}","\u{1F3EA}","\u{1F3AD}",
  "\u26A1","\u{1F525}","\u{1F4A5}","\u2728","\u2B50","\u{1F31F}","\u{1F4AB}","\u{1F320}","\u2604\uFE0F","\u{1FA90}",
  "\u{1F3C6}","\u{1F947}","\u{1F948}","\u{1F949}","\u{1F451}","\u{1F48E}","\u{1F48D}","\u{1F531}","\u2694\uFE0F","\u{1F6E1}\uFE0F",
  "\u{1F984}","\u{1F409}","\u{1F996}","\u{1F9BE}","\u{1F9E0}","\u{1F47D}","\u{1F921}","\u{1F9D9}","\u{1F977}","\u{1F9B8}",
  "\u{1F52C}","\u{1F9EA}","\u{1F9EC}","\u{1F52D}","\u{1F4E1}","\u{1F6F8}","\u{1F680}","\u{1F6F0}\uFE0F","\u269B\uFE0F","\u{1F9F2}",
];


const CAT_COLORS = ["#06b6d4","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6"];


// =====================================================
// MAIN GAME
// =====================================================
export default function JeopardyGame() {
  const [gameState, setGameState] = useState("setup");
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [usedQuestions, setUsedQuestions] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [cardFlipKey, setCardFlipKey] = useState(0);
  const [showWinner, setShowWinner] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [teamsPlayedThisRound, setTeamsPlayedThisRound] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState({});
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [scorePops, setScorePops] = useState({});
  const [boardReady, setBoardReady] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!API_BASE_URL) return;
    setDbLoading(true);
    Promise.all([fetch(API_BASE_URL+"/categories").then(r=>r.json()),fetch(API_BASE_URL+"/questions").then(r=>r.json())])
    .then(([cats, qs]) => {
      const sorted = cats.sort((a,b)=>a.display_order-b.display_order);
      const names = sorted.map(c=>c.name);
      const grouped = {}; names.forEach(n=>grouped[n]={});
      const pool = {};
      qs.forEach(q => { const k=q.category_name+"-"+q.difficulty; if(!pool[k])pool[k]=[]; pool[k].push(q); });
      names.forEach(cat => { DIFFICULTY_LEVELS.forEach(d => { const a = pool[cat+"-"+d]||[]; if(a.length){const p=a[Math.floor(Math.random()*a.length)]; grouped[cat][d]={q:p.question,a:p.answer,time:p.time_limit||(d<=200?30:d<=400?45:60)};} }); });
      setCategories(names); setQuestions(grouped); setDbLoading(false);
    }).catch(() => { setDbError("DB unavailable. Using built-in questions."); setDbLoading(false); });
  }, []);

  useEffect(() => {
    if (gameState === "playing") { const t = setTimeout(() => setBoardReady(true), 100); return () => clearTimeout(t); }
    setBoardReady(false);
  }, [gameState]);

  const totalQ = categories.length * QUESTIONS_PER_CATEGORY;
  const answeredQ = Object.keys(usedQuestions).length;
  const gameComplete = answeredQ === totalQ && gameState === "playing";
  const availableTeams = teams.filter(t => !teamsPlayedThisRound.some(p => p.name === t.name));

  useEffect(() => {
    let iv;
    if (timerRunning && timeLeft > 0) { iv = setInterval(() => setTimeLeft(p => { if(p<=1){setTimerRunning(false);return 0;} return p-1; }), 1000); }
    return () => clearInterval(iv);
  }, [timerRunning, timeLeft]);

  const addTeam = () => {
    if (newTeamName.trim() && teams.length < 12) {
      setTeams([...teams, { name: newTeamName.trim(), avatar: selectedAvatar, score: 0 }]);
      setNewTeamName("");
      const used = [...teams.map(t => t.avatar), selectedAvatar];
      setSelectedAvatar(AVATARS.find(a => !used.includes(a)) || AVATARS[0]);
    }
  };
  const removeTeam = i => setTeams(teams.filter((_, idx) => idx !== i));
  const updateScore = (i, amt) => {
    const t = [...teams]; t[i].score += amt; setTeams(t);
    setScorePops(p => ({...p, [i]: amt}));
    setTimeout(() => setScorePops(p => { const n = {...p}; delete n[i]; return n; }), 800);
  };
  const startGame = () => { if (teams.length > 0) setGameState("playing"); };
  const selectQuestion = (cat, pts) => {
    const key = cat + "-" + pts;
    if (!usedQuestions[key] && questions[cat] && questions[cat][pts]) {
      const qd = questions[cat][pts];
      setCurrentQuestion({ category: cat, points: pts, ...qd });
      setShowAnswer(false); setTimeLeft(qd.time); setTimerRunning(true); setCardFlipKey(0);
    }
  };
  const flipCard = e => { e.stopPropagation(); setShowAnswer(p => !p); setCardFlipKey(p => p + 1); };
  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => { setTimeLeft(currentQuestion.time); setTimerRunning(false); };
  const closeQuestion = () => {
    setUsedQuestions({...usedQuestions, [currentQuestion.category + "-" + currentQuestion.points]: true});
    setCurrentQuestion(null); setShowAnswer(false); setTimerRunning(false);
  };
  const resetGame = () => {
    setGameState("setup"); setTeams([]); setUsedQuestions({});
    setCurrentQuestion(null); setShowAnswer(false); setShowWinner(false);
    setTeamsPlayedThisRound([]); setCurrentTeam(null); setShowConfetti(false);
  };
  const handleTeamSelected = team => {
    setCurrentTeam(team);
    const np = [...teamsPlayedThisRound, team];
    setTeamsPlayedThisRound(np);
    if (np.length === teams.length) setTimeout(() => setTeamsPlayedThisRound([]), 2000);
  };
  const resetRound = () => { setTeamsPlayedThisRound([]); setCurrentTeam(null); };
  const getWinners = () => { if (!teams.length) return []; const m = Math.max(...teams.map(t => t.score)); return teams.filter(t => t.score === m); };
  const showWinnerModal = () => { setShowWinner(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); };
  const getRankMedal = idx => ["\u{1F947}","\u{1F948}","\u{1F949}"][idx] || (idx+1+"."); 
  const sortedTeams = [...teams].sort((a,b) => b.score - a.score);
  const catColorForQ = currentQuestion ? CAT_COLORS[categories.indexOf(currentQuestion.category) % CAT_COLORS.length] : "#06b6d4";


  // ======== SETUP SCREEN ========
  if (gameState === "setup") {
    return (
      <div style={{minHeight:"100vh",background:"#080c16",padding:24,color:"#e2e8f0",fontFamily:"monospace",position:"relative",overflow:"hidden"}}>
        <ParticlesBg />
        <div className="scanlines" />
        <div style={{position:"relative",zIndex:2,maxWidth:850,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40,paddingTop:20}}>
            <div style={{display:"inline-block",padding:"6px 18px",borderRadius:20,background:"#0b1a24",border:"1px solid rgba(6,182,212,0.2)",fontSize:11,color:"#06b6d4",letterSpacing:3,marginBottom:16}}>ALGORITHMS & DATA STRUCTURES</div>
            <h1 style={{fontSize:56,fontWeight:900,lineHeight:1,background:"linear-gradient(135deg,#06b6d4 0%,#8b5cf6 40%,#ec4899 80%,#f59e0b 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8,letterSpacing:-1,animation:"glowShift 6s ease-in-out infinite"}}>ALGO JEOPARDY</h1>
            <p style={{color:"#9ba7b8",fontSize:13, background:"#0b1a24", display: "inline-block"}}>{"> initialize_game() // v2.0"}</p>
            {dbError && <p style={{marginTop:8,fontSize:12,color:"#f59e0b"}}>⚠ {dbError}</p>}
          </div>

          <div style={{background:"linear-gradient(145deg,rgba(15,23,42,0.8),rgba(30,41,59,0.6))",border:"1px solid rgba(6,182,212,0.2)",borderRadius:16,padding:28,marginBottom:20,backdropFilter:"blur(10px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#06b6d4"}}/>
              <span style={{fontSize:15,fontWeight:700,color:"#06b6d4"}}>ADD_TEAMS()</span>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",color:"#475569",fontSize:11,marginBottom:6,letterSpacing:1}}>TEAM NAME</label>
              <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} onKeyDown={e => e.key === "Enter" && addTeam()} style={{width:"100%",padding:"12px 16px",borderRadius:10,background:"#0f172a",color:"#06b6d4",border:"1px solid rgba(6,182,212,0.2)",outline:"none",fontFamily:"monospace",fontSize:14}} placeholder="enter team name..."/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",color:"#475569",fontSize:11,marginBottom:6,letterSpacing:1}}>SELECT AVATAR</label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(44px, 1fr))",gap:6}}>
                {AVATARS.map(av => (
                  <button key={av} onClick={() => setSelectedAvatar(av)} style={{fontSize:22,padding:6,borderRadius:8,border:selectedAvatar===av?"2px solid #06b6d4":"1px solid #1e293b",background:selectedAvatar===av?"rgba(6,182,212,0.15)":"#0f172a",cursor:"pointer",transition:"all 0.15s",transform:selectedAvatar===av?"scale(1.15)":"scale(1)"}}>{av}</button>
                ))}
              </div>
            </div>
            <button onClick={addTeam} disabled={!newTeamName.trim()||teams.length>=12} className="btn-primary" style={{width:"100%",fontSize:15,padding:"14px 0"}}>+ ADD TEAM {teams.length>=12?"(MAX 12)":""}</button>
          </div>

          {teams.length > 0 && (
            <div style={{background:"linear-gradient(145deg,rgba(15,23,42,0.8),rgba(30,41,59,0.6))",border:"1px solid rgba(139,92,246,0.2)",borderRadius:16,padding:28,marginBottom:20,backdropFilter:"blur(10px)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#8b5cf6"}}/>
                <span style={{fontSize:15,fontWeight:700,color:"#8b5cf6"}}>TEAMS[{teams.length}]</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {teams.map((team, i) => (
                  <div key={i} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.2s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:32}}>{team.avatar}</span>
                      <span style={{fontSize:16,fontWeight:700,color:"#c4b5fd"}}>{team.name}</span>
                    </div>
                    <button onClick={() => removeTeam(i)} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontFamily:"monospace",fontWeight:700,fontSize:13,transition:"all 0.2s"}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={startGame} disabled={teams.length===0||dbLoading} style={{width:"100%",padding:"16px 0",borderRadius:12,border:"none",cursor:teams.length===0?"not-allowed":"pointer",background:teams.length===0?"#1e293b":"linear-gradient(135deg,#ec4899,#8b5cf6,#06b6d4)",color:teams.length===0?"#475569":"#fff",fontSize:18,fontWeight:900,fontFamily:"monospace",transition:"all 0.3s",boxShadow:teams.length>0?"0 8px 32px rgba(139,92,246,0.3)":"none"}}>
            {teams.length===0 ? "// add teams to start" : dbLoading ? "LOADING..." : "START_GAME()  \u25B6"}
          </button>
        </div>
      </div>
    );
  }

  // ======== GAME BOARD ========
  return (
    <div style={{minHeight:"100vh",background:"#080c16",display:"flex",flexDirection:"column",color:"#e2e8f0",fontFamily:"monospace",position:"relative"}}>
      <ParticlesBg />
      <div className="scanlines"/>
      <ConfettiBurst active={showConfetti} />

      <div style={{flex:1,padding:"16px 16px 0",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <h1 style={{fontSize:28,fontWeight:900,background:"linear-gradient(90deg,#06b6d4,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>JEOPARDY.exe</h1>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <button onClick={() => setShowWheel(true)} className="btn-action" style={{background:"rgba(139,92,246,0.12)",color:"#a78bfa",borderColor:"rgba(139,92,246,0.3)"}}>🎡 SPIN</button>
              {currentTeam && (
                <div style={{background:"rgba(6,182,212,0.1)",border:"1px solid rgba(6,182,212,0.3)",borderRadius:8,padding:"6px 14px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{currentTeam.avatar}</span>
                  <span style={{color:"#06b6d4",fontWeight:700,fontSize:13}}>{currentTeam.name}'s Turn</span>
                </div>
              )}
              <div style={{background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.15)",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#64748b"}}>
                <span style={{color:"#06b6d4",fontWeight:700}}>{answeredQ}</span>/{totalQ}
              </div>
              {gameComplete && <button onClick={showWinnerModal} className="btn-action" style={{background:"rgba(251,191,36,0.12)",color:"#fbbf24",borderColor:"rgba(251,191,36,0.3)",animation:"pulse2 1s ease-in-out infinite"}}>🏆 WINNER</button>}
              <button onClick={resetGame} className="btn-action" style={{background:"rgba(239,68,68,0.1)",color:"#f87171",borderColor:"rgba(239,68,68,0.25)"}}>RESET</button>
            </div>
          </div>

          <div style={{background:"linear-gradient(145deg,rgba(15,23,42,0.6),rgba(30,41,59,0.4))",border:"1px solid rgba(139,92,246,0.15)",borderRadius:16,padding:16,backdropFilter:"blur(10px)"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat("+categories.length+",1fr)",gap:10}}>
              {categories.map((cat, ci) => (
                <div key={cat} style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{background:"linear-gradient(135deg,"+CAT_COLORS[ci%CAT_COLORS.length]+"22,"+CAT_COLORS[ci%CAT_COLORS.length]+"08)",border:"1px solid "+CAT_COLORS[ci%CAT_COLORS.length]+"44",borderRadius:10,padding:"10px 8px",textAlign:"center",minHeight:52,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:11,fontWeight:800,color:CAT_COLORS[ci%CAT_COLORS.length],letterSpacing:0.5,lineHeight:1.3}}>{cat.toUpperCase()}</span>
                  </div>
                  {DIFFICULTY_LEVELS.map((pts, ri) => {
                    const key = cat + "-" + pts;
                    const isUsed = usedQuestions[key];
                    const hasQ = questions[cat] && questions[cat][pts];
                    const cellIdx = ci * 5 + ri;
                    const cc = CAT_COLORS[ci%CAT_COLORS.length];
                    return (
                      <button key={pts} onClick={() => selectQuestion(cat, pts)} disabled={isUsed || !hasQ}
                        style={{
                          width:"100%",aspectRatio:"1",borderRadius:10,fontSize:22,fontWeight:900,fontFamily:"monospace",
                          cursor:isUsed||!hasQ?"not-allowed":"pointer",transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)",
                          animation:boardReady?"cellAppear 0.4s ease-out "+(cellIdx*0.04)+"s both":"none",
                          border:isUsed?"1px solid #1e293b":!hasQ?"1px solid #1e293b":"1px solid "+cc+"55",
                          background:isUsed?"rgba(15,23,42,0.5)":!hasQ?"rgba(15,23,42,0.3)":"linear-gradient(135deg,"+cc+"18,"+cc+"08)",
                          color:isUsed?"#334155":!hasQ?"#1e293b":cc,
                          boxShadow:isUsed||!hasQ?"none":"inset 0 0 20px "+cc+"08, 0 2px 8px rgba(0,0,0,0.2)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                        }}
                        onMouseEnter={e => {if(!isUsed&&hasQ){e.target.style.transform="scale(1.06)";e.target.style.boxShadow="0 0 25px "+cc+"33, inset 0 0 30px "+cc+"15";}}}
                        onMouseLeave={e => {e.target.style.transform="scale(1)";e.target.style.boxShadow=isUsed||!hasQ?"none":"inset 0 0 20px "+cc+"08, 0 2px 8px rgba(0,0,0,0.2)";}}
                      >{isUsed ? "✓" : "$"+pts}</button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{background:"linear-gradient(180deg,rgba(15,23,42,0.95),rgba(8,12,22,0.98))",borderTop:"1px solid rgba(6,182,212,0.15)",padding:16,marginTop:12,position:"relative",zIndex:1}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:14,fontWeight:700,color:"#06b6d4"}}>SCOREBOARD</span>
            {teamsPlayedThisRound.length > 0 && <button onClick={resetRound} className="btn-action" style={{fontSize:11,padding:"4px 12px",background:"rgba(249,115,22,0.1)",color:"#fb923c",borderColor:"rgba(249,115,22,0.3)"}}>🔄 RESET ROUND</button>}
          </div>
          <div style={{overflowX:"auto"}}>
            <div style={{display:"flex",gap:12,paddingBottom:8}}>
              {teams.map((team, i) => {
                const played = teamsPlayedThisRound.some(t => t.name === team.name);
                const rank = sortedTeams.findIndex(t => t.name === team.name);
                return (
                  <div key={i} style={{position:"relative",background:played?"rgba(15,23,42,0.5)":"linear-gradient(145deg,rgba(15,23,42,0.8),rgba(30,41,59,0.4))",border:played?"1px solid #1e293b":"1px solid rgba(6,182,212,0.2)",borderRadius:14,padding:14,minWidth:260,opacity:played?0.4:1,transition:"all 0.3s"}}>
                    <ScorePop value={scorePops[i]} />
                    <div style={{position:"absolute",top:-6,right:10,background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"2px 8px",fontSize:12}}>{getRankMedal(rank)}</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <span style={{fontSize:38}}>{team.avatar}</span>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{color:"#e2e8f0",fontWeight:700,fontSize:14}}>{team.name}</span>
                          {played && <span style={{fontSize:9,background:"#1e293b",color:"#475569",padding:"2px 6px",borderRadius:4}}>DONE</span>}
                        </div>
                        <div style={{fontSize:28,fontWeight:900,background:"linear-gradient(90deg,#06b6d4,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>${team.score}</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4}}>
                      {DIFFICULTY_LEVELS.map(p => (<button key={p} onClick={() => updateScore(i,p)} style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",color:"#10b981",fontSize:10,fontWeight:700,padding:"6px 0",borderRadius:6,cursor:"pointer",fontFamily:"monospace",transition:"all 0.15s"}}>+{p}</button>))}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginTop:4}}>
                      {DIFFICULTY_LEVELS.map(p => (<button key={"m"+p} onClick={() => updateScore(i,-p)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",fontSize:10,fontWeight:700,padding:"6px 0",borderRadius:6,cursor:"pointer",fontFamily:"monospace",transition:"all 0.15s"}}>-{p}</button>))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showWheel && <SpinWheel teams={teams} availableTeams={availableTeams} onClose={() => setShowWheel(false)} onTeamSelected={handleTeamSelected} />}

      {/* Winner Modal */}
      {showWinner && (
        <div className="modal-overlay">
          <div className="modal-glass" style={{maxWidth:620,textAlign:"center"}}>
            <div style={{fontSize:56,animation:"celebrate 0.5s ease-in-out infinite",display:"inline-block",marginBottom:12}}>🏆</div>
            <h2 style={{fontSize:44,fontWeight:900,background:"linear-gradient(135deg,#fbbf24,#f97316,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:24}}>GAME OVER!</h2>
            {getWinners().length === 1 ? (
              <div style={{background:"linear-gradient(135deg,rgba(251,191,36,0.1),rgba(249,115,22,0.08))",border:"2px solid rgba(251,191,36,0.4)",borderRadius:16,padding:28,marginBottom:24}}>
                <div style={{fontSize:11,color:"#fbbf24",letterSpacing:3,marginBottom:12}}>CHAMPION</div>
                <div style={{fontSize:72,marginBottom:8,animation:"celebrate 0.5s ease-in-out infinite",display:"inline-block"}}>{getWinners()[0].avatar}</div>
                <div style={{fontSize:28,fontWeight:900,color:"#fbbf24",marginBottom:4}}>{getWinners()[0].name}</div>
                <div style={{fontSize:40,fontWeight:900,background:"linear-gradient(90deg,#fbbf24,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>${getWinners()[0].score}</div>
              </div>
            ) : (
              <>
                <div style={{fontSize:11,color:"#06b6d4",letterSpacing:3,marginBottom:16}}>TIE!</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat("+Math.min(getWinners().length,3)+",1fr)",gap:12,marginBottom:24}}>
                  {getWinners().map((w,idx) => (
                    <div key={idx} style={{background:"rgba(251,191,36,0.08)",border:"2px solid rgba(251,191,36,0.3)",borderRadius:14,padding:20}}>
                      <div style={{fontSize:48,marginBottom:6,animation:"celebrate 0.5s ease-in-out infinite",display:"inline-block"}}>{w.avatar}</div>
                      <div style={{fontSize:18,fontWeight:800,color:"#fbbf24",marginBottom:4}}>{w.name}</div>
                      <div style={{fontSize:28,fontWeight:900,color:"#f97316"}}>${w.score}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{background:"#0f172a",border:"1px solid rgba(6,182,212,0.2)",borderRadius:12,padding:20,marginBottom:20,textAlign:"left"}}>
              <div style={{fontSize:11,color:"#64748b",letterSpacing:2,marginBottom:12}}>FINAL STANDINGS</div>
              {sortedTeams.map((t, idx) => (
                <div key={idx} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,marginBottom:4,background:idx===0?"rgba(251,191,36,0.08)":"transparent"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{width:28,fontSize:16}}>{getRankMedal(idx)}</span>
                    <span style={{fontSize:22}}>{t.avatar}</span>
                    <span style={{color:"#e2e8f0",fontWeight:600,fontSize:14}}>{t.name}</span>
                  </div>
                  <span style={{fontSize:18,fontWeight:800,color:idx===0?"#fbbf24":"#94a3b8"}}>${t.score}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={() => setShowWinner(false)} className="btn-action" style={{flex:1,padding:"12px 0"}}>CONTINUE</button>
              <button onClick={resetGame} className="btn-primary" style={{flex:1}}>NEW GAME</button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {currentQuestion && (
        <div className="modal-overlay">
          <div className="modal-glass" style={{maxWidth:720,textAlign:"center",borderColor:catColorForQ+"33"}}>
            <div style={{display:"inline-block",padding:"4px 16px",borderRadius:20,background:catColorForQ+"15",border:"1px solid "+catColorForQ+"33",fontSize:11,color:catColorForQ,letterSpacing:2,marginBottom:12}}>{currentQuestion.category.toUpperCase()}</div>
            <div style={{fontSize:44,fontWeight:900,marginBottom:20,background:"linear-gradient(135deg,"+catColorForQ+",#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>${currentQuestion.points}</div>
            <CircularTimer timeLeft={timeLeft} totalTime={currentQuestion.time} running={timerRunning} />
            <div style={{display:"flex",gap:8,justifyContent:"center",margin:"12px 0 20px"}}>
              <button onClick={toggleTimer} className="btn-action" style={{borderColor:catColorForQ+"33",color:catColorForQ}}>{timerRunning ? "\u23F8 PAUSE" : "\u25B6 START"}</button>
              <button onClick={resetTimer} className="btn-action">↻ RESET</button>
            </div>
            <div style={{marginBottom:20}}>
              <div onClick={flipCard} style={{cursor:"pointer"}}>
                {!showAnswer ? (
                  <div key={"q-"+cardFlipKey} style={{background:"#0f172a",padding:28,borderRadius:14,border:"1px solid "+catColorForQ+"22",minHeight:180,display:"flex",alignItems:"center",justifyContent:"center",animation:"flipIn 0.5s ease-out"}}>
                    <div style={{color:"#e2e8f0",fontSize:22,fontWeight:700,lineHeight:1.5,whiteSpace:"pre-line"}}>{currentQuestion.q}</div>
                  </div>
                ) : (
                  <div key={"a-"+cardFlipKey} style={{background:"linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.05))",padding:28,borderRadius:14,border:"1px solid rgba(16,185,129,0.3)",minHeight:180,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"flipIn 0.5s ease-out"}}>
                    <div style={{fontSize:10,color:"#10b981",letterSpacing:3,marginBottom:12}}>ANSWER</div>
                    <div style={{color:"#6ee7b7",fontSize:22,fontWeight:700,lineHeight:1.5,whiteSpace:"pre-line"}}>{currentQuestion.a}</div>
                  </div>
                )}
              </div>
              <button onClick={flipCard} className="btn-action" style={{width:"100%",marginTop:10,padding:"10px 0",borderColor:catColorForQ+"33",color:catColorForQ}}>{showAnswer ? "↻ SHOW QUESTION" : "↻ REVEAL ANSWER"}</button>
            </div>
            <button onClick={closeQuestion} className="btn-ghost" style={{width:"100%",padding:"12px 0"}}>CLOSE QUESTION</button>
          </div>
        </div>
      )}
    </div>
  );
}
