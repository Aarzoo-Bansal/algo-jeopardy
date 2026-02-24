import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL

export default function AdminPanel() {
    const [categories, setCategories] = useState([])
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [newQuestion, setNewQuestion] = useState({
        category_id: "",
        difficulty: 100,
        question: "",
        answer: "",
        time_limit: 30
    })
    const [expandedCategory, setExpandedCategory] = useState(null)

    useEffect(() => { fetchData() }, [])

    const fetchData = () => {
        setLoading(true)
        Promise.all([
            fetch(API_BASE_URL + "/categories").then(r => r.json()),
            fetch(API_BASE_URL + "/questions").then(r => r.json())
        ]).then(([cats, qs]) => {
            setCategories(cats.sort((a, b) => a.name.localeCompare(b.name)))
            setQuestions(qs)
            setLoading(false)
        })
    }

    const addCategory = () => {
        if (!newCategoryName.trim())
            return

        fetch(API_BASE_URL + "/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCategoryName.trim() })
        })
            .then(r => r.json())
            .then(() => {
                setNewCategoryName("")
                fetchData()
            })
    }

    const deleteCategory = (id, name) => {
        if (!window.confirm(`Delete "${name}" and all its questions?`))
            return

        fetch(API_BASE_URL + "/categories/" + id, { method: "DELETE" })
            .then(() => {
                if (selectedCategory === id)
                    setSelectedCategory(null)
                fetchData()
            })
    }

    const addQuestion = () => {
        if (!newQuestion.category_id || !newQuestion.question.trim() || !newQuestion.answer.trim())
            return

        fetch(API_BASE_URL + "/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...newQuestion,
                category_id: Number(newQuestion.category_id),
                difficulty: Number(newQuestion.difficulty),
                time_limit: Number(newQuestion.time_limit)
            })
        })
            .then(r => r.json())
            .then(() => {
                setNewQuestion({
                    category_id: "",
                    difficulty: 100,
                    question: "",
                    answer: "",
                    time_limit: 30
                })
                fetchData()
            })
    }

    const deleteQuestion = (id) => {
        if (!window.confirm("Delete this question?"))
            return

        fetch(API_BASE_URL + "/questions/" + id, { method: "DELETE" })
            .then(() => fetchData())
    }



    if (loading) return <div style={{ color: "#06b6d4", padding: 40, fontFamily: "monospace" }}>Loading...</div>

    const filteredQuestions = selectedCategory
        ? questions.filter(q => q.category_id === selectedCategory)
        : questions

    return (
        <div style={{ minHeight: "100vh", background: "#080c16", padding: 24, color: "#e2e8f0", fontFamily: "monospace" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: "#06b6d4" }}>ADMIN PANEL</h1>
                    <a href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: 13 }}>← Back to Game</a>
                </div>

                {/* ── CATEGORIES ── */}
                <div style={{ background: "#0f172a", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#06b6d4", marginBottom: 16 }}>CATEGORIES</h2>

                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addCategory()}
                            placeholder="New category name..."
                            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", outline: "none", fontFamily: "monospace" }}
                        />
                        <button onClick={addCategory} className="btn-primary" style={{ padding: "8px 16px" }}>+ ADD</button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {categories.map(cat => (
                            <div key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                                    background: selectedCategory === cat.id ? "rgba(6,182,212,0.15)" : "#1e293b",
                                    border: selectedCategory === cat.id ? "1px solid #06b6d4" : "1px solid #334155",
                                    transition: "all 0.15s"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ color: "#06b6d4", fontWeight: 700 }}>{cat.name}</span>
                                    <span style={{ color: "#475569", fontSize: 11 }}>
                                        ({questions.filter(q => q.category_id === cat.id).length} questions)
                                    </span>
                                </div>
                                <button
                                    onClick={e => { e.stopPropagation(); deleteCategory(cat.id, cat.name) }}
                                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontFamily: "monospace", fontSize: 11 }}
                                >
                                    DELETE
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── QUESTIONS ── */}
                <div style={{ background: "#0f172a", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: 20 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#8b5cf6", marginBottom: 16 }}>
                        QUESTIONS {selectedCategory ? `— ${categories.find(c => c.id === selectedCategory)?.name}` : "— All"}
                    </h2>

                    {/* ── Add Question Form ── */}
                    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", color: "#475569", fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>CATEGORY</label>
                                <select
                                    value={newQuestion.category_id}
                                    onChange={e => setNewQuestion({ ...newQuestion, category_id: e.target.value })}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace" }}
                                >
                                    <option value="">Select category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", color: "#475569", fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>DIFFICULTY</label>
                                <select
                                    value={newQuestion.difficulty}
                                    onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                                    style={{ padding: "8px 12px", borderRadius: 8, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace" }}
                                >
                                    {[100, 200, 300, 400, 500].map(d => (
                                        <option key={d} value={d}>${d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", color: "#475569", fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>TIME (s)</label>
                                <input
                                    type="number"
                                    value={newQuestion.time_limit}
                                    onChange={e => setNewQuestion({ ...newQuestion, time_limit: e.target.value })}
                                    style={{ width: 70, padding: "8px 12px", borderRadius: 8, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace" }}
                                />
                            </div>
                        </div>
                        <textarea
                            value={newQuestion.question}
                            onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                            placeholder="Question..."
                            rows={2}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace", marginBottom: 8, resize: "vertical" }}
                        />
                        <textarea
                            value={newQuestion.answer}
                            onChange={e => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                            placeholder="Answer..."
                            rows={2}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace", marginBottom: 8, resize: "vertical" }}
                        />
                        <button onClick={addQuestion} className="btn-primary" style={{ width: "100%", padding: "8px 0" }}>+ ADD QUESTION</button>
                    </div>

                    {/* ── Question List ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {categories
                            .filter(cat => !selectedCategory || cat.id === selectedCategory)
                            .map(cat => {
                                const catQuestions = questions.filter(q => q.category_id === cat.id)
                                if (catQuestions.length === 0) return null

                                return (
                                    <div key={cat.id} style={{ border: "1px solid #334155", borderRadius: 8, overflow: "hidden" }}>
                                        <div
                                            onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                                            style={{
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                                padding: "10px 14px", cursor: "pointer",
                                                background: expandedCategory === cat.id ? "rgba(139,92,246,0.1)" : "#1e293b",
                                                transition: "all 0.15s"
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ color: expandedCategory === cat.id ? "#8b5cf6" : "#475569", transition: "transform 0.2s", display: "inline-block", transform: expandedCategory === cat.id ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                                                <span style={{ color: "#8b5cf6", fontWeight: 700 }}>{cat.name}</span>
                                                <span style={{ color: "#475569", fontSize: 11 }}>({catQuestions.length})</span>
                                            </div>
                                        </div>

                                        {expandedCategory === cat.id && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 10 }}>
                                                {catQuestions.map(q => (
                                                    <div key={q.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 12 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                                                            <span style={{ color: "#06b6d4", fontSize: 11, fontWeight: 700 }}>
                                                                ${q.difficulty} • {q.time_limit}s
                                                            </span>
                                                            <button
                                                                onClick={() => deleteQuestion(q.id)}
                                                                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontFamily: "monospace", fontSize: 11 }}
                                                            >
                                                                DELETE
                                                            </button>
                                                        </div>
                                                        <div style={{ color: "#e2e8f0", fontSize: 13, marginBottom: 4 }}>{q.question}</div>
                                                        <div style={{ color: "#10b981", fontSize: 12 }}>Answer: {q.answer}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                    </div>
                </div>
            </div>
        </div>
    )
}