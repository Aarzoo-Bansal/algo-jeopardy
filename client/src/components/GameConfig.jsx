import ParticlesBg from './ParticlesBg'

export default function GameConfig({
    categories, questions, gameTitle, setGameTitle,
    selectedCategories, setSelectedCategories,
    selectedDifficulties, setSelectedDifficulties,
    teams, onNext
}) {
    const getCategoryQuestionCounts = (catName) => {
        return Object.keys(questions[catName] || {}).length
    }

    const totalSelected = selectedCategories.length * selectedDifficulties.length

    return (
        <div style={{ minHeight: "100vh", background: "#080c16", padding: 24, color: "#e2e8f0", fontFamily: "monospace", position: "relative", overflow: "hidden" }}>
            <ParticlesBg />
            <div className="scanlines" />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 850, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 20 }}>
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
                    <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 20, background: "#0b1a24", border: "1px solid rgba(139,92,246,0.2)", fontSize: 11, color: "#8b5cf6", letterSpacing: 3, marginBottom: 16 }}>
                        GAME SETUP
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: "clamp(28px, 8vw, 52px)", fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg,#06b6d4 0%,#8b5cf6 25%,#ec4899 50%,#f59e0b 75%,#06b6d4 100%)", backgroundSize: "200% 200%", marginBottom: 16, letterSpacing: -1, animation: "glowShift 6s ease-in-out infinite" }}>
                        Configure Game
                    </h1>
                    <p style={{ color: "#9ba7b8", fontSize: "11px", background: "#0b1a24", display: "inline", boxDecorationBreak: "clone", padding: "6px 18px", borderRadius: "20px", letterSpacing: "3px" }}>Select title, categories and difficulty levels for this session</p>
                </div>

                {/* Game Title */}
                <div style={{ background: "linear-gradient(145deg,rgba(15,23,42,0.8),rgba(30,41,59,0.6))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: 28, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#10b981" }}>GAME TITLE</span>
                    </div>
                    <input
                        type="text"
                        value={gameTitle}
                        onChange={e => setGameTitle(e.target.value)}
                        placeholder="Enter game title..."
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "#0f172a", color: "#e2e8f0", border: "1px solid rgba(16,185,129,0.2)", outline: "none", fontFamily: "monospace", fontSize: 18, fontWeight: 700 }}
                    />
                    <p style={{ color: "#475569", fontSize: 11, marginTop: 8 }}>This title appears on the game board header</p>
                </div>

                {/* Categories Selection */}
                <div style={{ background: "linear-gradient(145deg,rgba(15,23,42,0.8),rgba(30,41,59,0.6))", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 16, padding: 28, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4" }} />
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#06b6d4" }}>CATEGORIES</span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setSelectedCategories(categories.map(c => c))}
                                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "monospace", fontSize: 11 }}>
                                SELECT ALL
                            </button>
                            <button onClick={() => setSelectedCategories([])}
                                style={{ background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.3)", color: "#94a3b8", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "monospace", fontSize: 11 }}>
                                CLEAR
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {categories.map(cat => {
                            const isSelected = selectedCategories.includes(cat)
                            const questionCount = getCategoryQuestionCounts(cat)
                            const missingCount = selectedDifficulties.filter(d => !questions[cat]?.[d]).length

                            return (
                                <div key={cat}
                                    onClick={() => {
                                        if (isSelected) {
                                            setSelectedCategories(selectedCategories.filter(c => c !== cat))
                                        } else {
                                            setSelectedCategories([...selectedCategories, cat])
                                        }
                                    }}
                                    style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                                        background: isSelected ? "rgba(6,182,212,0.1)" : "#0f172a",
                                        border: isSelected ? "1px solid rgba(6,182,212,0.4)" : "1px solid #1e293b",
                                        transition: "all 0.15s"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: 4,
                                            border: isSelected ? "2px solid #06b6d4" : "2px solid #334155",
                                            background: isSelected ? "#06b6d4" : "transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 12, color: "#0f172a", fontWeight: 800,
                                            transition: "all 0.15s"
                                        }}>
                                            {isSelected && "✓"}
                                        </div>
                                        <span style={{ fontWeight: 700, color: isSelected ? "#e2e8f0" : "#64748b" }}>{cat}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {missingCount > 0 && isSelected && (
                                            <span style={{ fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                                                {missingCount} empty slot{missingCount > 1 ? "s" : ""}
                                            </span>
                                        )}
                                        <span style={{
                                            fontSize: 11,
                                            color: questionCount >= 5 ? "#10b981" : questionCount >= 3 ? "#f59e0b" : "#ef4444",
                                            background: questionCount >= 5 ? "rgba(16,185,129,0.1)" : questionCount >= 3 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                                            padding: "2px 8px", borderRadius: 4
                                        }}>
                                            {questionCount} question{questionCount !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Difficulty Selection */}
                <div style={{ background: "linear-gradient(145deg,rgba(15,23,42,0.8),rgba(30,41,59,0.6))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: 28, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6" }} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#8b5cf6" }}>DIFFICULTY LEVELS</span>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[100, 200, 300, 400, 500].map(d => {
                            const isSelected = selectedDifficulties.includes(d)
                            return (
                                <button key={d}
                                    onClick={() => {
                                        if (isSelected) {
                                            setSelectedDifficulties(selectedDifficulties.filter(x => x !== d))
                                        } else {
                                            setSelectedDifficulties([...selectedDifficulties, d].sort((a, b) => a - b))
                                        }
                                    }}
                                    style={{
                                        padding: "10px 20px", borderRadius: 10, cursor: "pointer",
                                        fontFamily: "monospace", fontWeight: 800, fontSize: 16,
                                        background: isSelected ? "rgba(139,92,246,0.15)" : "#0f172a",
                                        border: isSelected ? "2px solid #8b5cf6" : "2px solid #1e293b",
                                        color: isSelected ? "#8b5cf6" : "#475569",
                                        transition: "all 0.15s"
                                    }}
                                >
                                    ${d}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Summary */}
                <div style={{ background: "linear-gradient(145deg,rgba(15,23,42,0.8),rgba(30,41,59,0.6))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ display: "flex", gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>CATEGORIES</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: "#06b6d4" }}>{selectedCategories.length}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>DIFFICULTIES</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: "#8b5cf6" }}>{selectedDifficulties.length}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>TOTAL SLOTS</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{totalSelected}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={onNext}
                    disabled={selectedCategories.length === 0 || selectedDifficulties.length === 0}
                    style={{
                        width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                        cursor: selectedCategories.length === 0 || selectedDifficulties.length === 0 ? "not-allowed" : "pointer",
                        background: selectedCategories.length === 0 || selectedDifficulties.length === 0 ? "#1e293b" : "linear-gradient(135deg,#ec4899,#8b5cf6,#06b6d4)",
                        color: selectedCategories.length === 0 || selectedDifficulties.length === 0 ? "#475569" : "#fff",
                        fontSize: 18, fontWeight: 900, fontFamily: "monospace", transition: "all 0.3s",
                        boxShadow: selectedCategories.length > 0 && selectedDifficulties.length > 0 ? "0 8px 32px rgba(139,92,246,0.3)" : "none"
                    }}>
                    NEXT: ADD TEAMS ▶
                </button>
            </div>
        </div>
    )
}