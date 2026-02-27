import { useState } from "react";
import { polarToCartesian, describeArc } from "../utils/geometry";
import { WHEEL_COLORS } from "../data/constants";

export default function SpinWheel({ teams, onClose, availableTeams, onTeamSelected }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const segmentAngle = 360 / teams.length;
  const spinWheel = () => {
    if (isSpinning || availableTeams.length === 0) return;
    setIsSpinning(true); setSelectedTeam(null);
    const pick = availableTeams[Math.floor(Math.random() * availableTeams.length)];
    const idx = teams.findIndex(t => t.name === pick.name);
    const targetCenter = idx * segmentAngle + segmentAngle / 2;
    // When wheel is at total rotation R, the segment at the top (pointer) is at angle: (360 - R%360) % 360
    // We want that to equal targetCenter, so: R%360 = (360 - targetCenter) % 360
    const desiredMod = ((360 - targetCenter) % 360 + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    var delta = desiredMod - currentMod;
    if (delta < 0) delta += 360;
    const spins = 360 * (6 + Math.floor(Math.random() * 4));
    const jitter = (Math.random() - 0.5) * segmentAngle * 0.45;
    setRotation(rotation + spins + delta + jitter);
    setTimeout(() => { setSelectedTeam(pick); onTeamSelected(pick); setIsSpinning(false); }, 4200);
  };
  return (
    <div className="modal-overlay">
      <div className="modal-glass" style={{maxWidth:660}}>
        <h2 style={{textAlign:"center",fontSize:28,fontWeight:800,background:"linear-gradient(90deg,#06b6d4,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4}}>SPIN THE WHEEL</h2>
        <p style={{textAlign:"center",color:"#64748b",fontSize:13,marginBottom:20}}>{availableTeams.length} team{availableTeams.length !== 1 ? "s" : ""} remaining</p>
        <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
          <div style={{position:"relative",width:340,height:340}}>
            <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"15px solid transparent",borderRight:"15px solid transparent",borderTop:"30px solid #fbbf24",filter:"drop-shadow(0 2px 8px rgba(251,191,36,0.6))",zIndex:10}}/>
            <svg viewBox="0 0 340 340" style={{width:"100%",height:"100%",transition:"transform 4s cubic-bezier(0.17,0.67,0.12,0.99)",transform:"rotate(" + rotation + "deg)",filter:isSpinning?"drop-shadow(0 0 25px rgba(6,182,212,0.7))":"drop-shadow(0 0 15px rgba(6,182,212,0.3))"}}>
              {teams.map((team, i) => {
                const sa = i * segmentAngle, ea = sa + segmentAngle;
                const avail = availableTeams.some(t => t.name === team.name);
                const lp = polarToCartesian(170, 170, 110, sa + segmentAngle / 2);
                return (<g key={i}><path d={describeArc(170,170,160,sa,ea)} fill={avail ? WHEEL_COLORS[i%WHEEL_COLORS.length] : "#2d3748"} stroke="#0f172a" strokeWidth="2" opacity={avail?1:0.25}/><text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central" fontSize="28" style={{pointerEvents:"none"}}>{team.avatar}</text></g>);
              })}
              <circle cx="170" cy="170" r="160" fill="none" stroke="#06b6d4" strokeWidth="3" opacity="0.4"/>
            </svg>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#06b6d4,#8b5cf6)",border:"3px solid #fbbf24",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,zIndex:5,boxShadow:"0 0 20px rgba(6,182,212,0.5)"}}>🎯</div>
          </div>
        </div>
        {selectedTeam && (
          <div style={{background:"linear-gradient(135deg,rgba(6,182,212,0.15),rgba(139,92,246,0.15))",border:"2px solid #06b6d4",borderRadius:12,padding:20,textAlign:"center",marginBottom:16,animation:"slideUp 0.4s ease-out"}}>
            <div style={{fontSize:11,color:"#06b6d4",letterSpacing:3,marginBottom:8}}>SELECTED TEAM</div>
            <div style={{fontSize:48,marginBottom:4}}>{selectedTeam.avatar}</div>
            <div style={{fontSize:24,fontWeight:800,color:"#06b6d4"}}>{selectedTeam.name}</div>
          </div>
        )}
        <div style={{display:"flex",gap:12}}>
          <button onClick={spinWheel} disabled={isSpinning || availableTeams.length === 0} className="btn-primary" style={{flex:1,fontSize:16}}>{isSpinning ? "🎡 SPINNING..." : availableTeams.length === 0 ? "✓ ALL PLAYED" : "🎡 SPIN!"}</button>
          <button onClick={onClose} className="btn-ghost" style={{padding:"12px 24px"}}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}