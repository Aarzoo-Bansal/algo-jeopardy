import { useState, useEffect } from 'react'
import ParticlesBg from './ParticlesBg'

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
    const [editingCategory, setEditingCategory] = useState(null)
    const [editCategoryName, setEditCategoryName] = useState("")
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [editQuestionData, setEditQuestionData] = useState({})

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

    const updateCategory = (id) => {
        const originalName = categories.find(c => c.id === id)?.name

        if (!editCategoryName.trim() || editCategoryName.trim() === originalName) {
            setEditingCategory(null)
            return
        }

        fetch(API_BASE_URL + "/categories/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: editCategoryName.trim()
            })
        })
            .then(r => r.json())
            .then(() => {
                setEditingCategory(null)
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

    const updateQuestion = (id) => {
        const original = questions.find(q => q.id === id)

        if (!editQuestionData.question?.trim() || !editQuestionData.answer?.trim()) {
            setEditingQuestion(null)
            return
        }

        // Skip API call if nothing changed
        if (
            editQuestionData.question.trim() === original.question &&
            editQuestionData.answer.trim() === original.answer &&
            Number(editQuestionData.difficulty) === original.difficulty &&
            Number(editQuestionData.time_limit) === original.time_limit
        ) {
            setEditingQuestion(null)
            return
        }

        fetch(API_BASE_URL + "/questions/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: editQuestionData.question.trim(),
                answer: editQuestionData.answer.trim(),
                difficulty: Number(editQuestionData.difficulty),
                time_limit: Number(editQuestionData.time_limit)
            })
        })
            .then(r => r.json())
            .then(() => {
                setEditingQuestion(null)
                fetchData()
            })
    }



    if (loading) return <div style={{ color: "#06b6d4", padding: 40, fontFamily: "monospace" }}>Loading...</div>

    const filteredQuestions = selectedCategory
        ? questions.filter(q => q.category_id === selectedCategory)
        : questions

    return (
        <div style={{ minHeight: "100vh", background: "#080c16", padding: 24, color: "#e2e8f0", fontFamily: "monospace", position: "relative", overflow: "hidden" }}>
            <ParticlesBg />
            <div className="scanlines" />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 900, margin: "0 auto" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg,#06b6d4,#8b5cf6)" }}>ADMIN PANEL</h1>
                    <a href="/" className="admin-link">← Back to Game</a>
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

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
                        {categories.map(cat => (
                            <div key={cat.id}
                                style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "10px 14px", borderRadius: 8,
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    transition: "all 0.15s",
                                    flexWrap:"wrap",
                                    gap:8
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 10 }}>
                                    {editingCategory === cat.id ? (
                                        <input
                                            value={editCategoryName}
                                            onChange={e => setEditCategoryName(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") updateCategory(cat.id)
                                                if (e.key === "Escape") setEditingCategory(null)
                                            }}
                                            autoFocus
                                            style={{ padding: "4px 8px", borderRadius: 6, background: "#0f172a", color: "#06b6d4", border: "1px solid #06b6d4", outline: "none", fontFamily: "monospace", fontWeight: 700, flex: 1, minWidth: 150 }}
                                        />
                                    ) : (
                                        <>
                                            <span style={{ color: "#06b6d4", fontWeight: 700 }}>{cat.name}</span>
                                            <span style={{ color: "#475569", fontSize: 11 }}>({questions.filter(q => q.category_id === cat.id).length})</span>
                                        </>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    {editingCategory === cat.id ? (
                                        <>
                                            <button onClick={() => updateCategory(cat.id)}
                                                className='btn-save'>
                                                SAVE
                                            </button>
                                            <button onClick={() => setEditingCategory(null)}
                                                className='btn-cancel'>
                                                CANCEL
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onMouseDown={(e) => {
                                                e.preventDefault()
                                                setTimeout(() => { setEditingCategory(cat.id); setEditCategoryName(cat.name) }, 0)
                                            }}
                                                className="btn-edit">
                                                EDIT
                                            </button>
                                            <button onClick={() => deleteCategory(cat.id, cat.name)}
                                                className="btn-delete">
                                                DELETE
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── QUESTIONS ── */}
                <div style={{ background: "#0f172a", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: 20, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#8b5cf6" }}>QUESTIONS</h2>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <label style={{ color: "#475569", fontSize: 11 }}>FILTER:</label>
                            <select
                                value={selectedCategory || ""}
                                onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                                style={{ padding: "6px 12px", borderRadius: 8, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace", fontSize: 12, maxWidth: 100 }}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name} ({questions.filter(q => q.category_id === cat.id).length})</option>
                                ))}
                            </select>
                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontFamily: "monospace", fontSize: 11 }}
                                >
                                    ✕ CLEAR
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Add Question Form ── */}
                    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
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
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 10, maxHeight: 350, overflowY: "auto" }}>
                                                {catQuestions.map(q => (
                                                    <div key={q.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 12 }}>
                                                        {editingQuestion === q.id ? (
                                                            <>
                                                                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                                                                    <div>
                                                                        <label style={{ display: "block", color: "#475569", fontSize: 10, marginBottom: 4 }}>DIFFICULTY</label>
                                                                        <select
                                                                            value={editQuestionData.difficulty}
                                                                            onChange={e => setEditQuestionData({ ...editQuestionData, difficulty: e.target.value })}
                                                                            style={{ padding: "6px 10px", borderRadius: 6, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace" }}
                                                                        >
                                                                            {[100, 200, 300, 400, 500].map(d => (
                                                                                <option key={d} value={d}>${d}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ display: "block", color: "#475569", fontSize: 10, marginBottom: 4 }}>TIME (s)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={editQuestionData.time_limit}
                                                                            onChange={e => setEditQuestionData({ ...editQuestionData, time_limit: e.target.value })}
                                                                            style={{ width: 70, padding: "6px 10px", borderRadius: 6, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace" }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div style={{ marginBottom: 6 }}>
                                                                    <label style={{ display: "block", color: "#475569", fontSize: 10, marginBottom: 4 }}>QUESTION</label>
                                                                    <textarea
                                                                        value={editQuestionData.question}
                                                                        onChange={e => setEditQuestionData({ ...editQuestionData, question: e.target.value })}
                                                                        rows={2}
                                                                        style={{ width: "100%", padding: "6px 10px", borderRadius: 6, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace", resize: "vertical" }}
                                                                    />
                                                                </div>
                                                                <div style={{ marginBottom: 8 }}>
                                                                    <label style={{ display: "block", color: "#475569", fontSize: 10, marginBottom: 4 }}>ANSWER</label>
                                                                    <textarea
                                                                        value={editQuestionData.answer}
                                                                        onChange={e => setEditQuestionData({ ...editQuestionData, answer: e.target.value })}
                                                                        rows={2}
                                                                        style={{ width: "100%", padding: "6px 10px", borderRadius: 6, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontFamily: "monospace", resize: "vertical" }}
                                                                    />
                                                                </div>
                                                                <div style={{ display: "flex", gap: 6 }}>
                                                                    <button onClick={() => updateQuestion(q.id)}
                                                                        className='btn-save'>
                                                                        SAVE
                                                                    </button>
                                                                    <button onClick={() => setEditingQuestion(null)}
                                                                        className='btn-cancel'>
                                                                        CANCEL
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                                                                    <span style={{ color: "#06b6d4", fontSize: 11, fontWeight: 700 }}>
                                                                        ${q.difficulty} • {q.time_limit}s
                                                                    </span>
                                                                    <div style={{ display: "flex", gap: 4 }}>
                                                                        <button
                                                                            className='btn-edit'
                                                                            onClick={() => {
                                                                                setEditingQuestion(q.id)
                                                                                setEditQuestionData({
                                                                                    difficulty: q.difficulty,
                                                                                    question: q.question,
                                                                                    answer: q.answer,
                                                                                    time_limit: q.time_limit
                                                                                })
                                                                            }}>
                                                                            EDIT
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteQuestion(q.id)}
                                                                            className="btn-delete">
                                                                            DELETE
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div style={{ color: "#e2e8f0", fontSize: 13, marginBottom: 4 }}>{q.question}</div>
                                                                <div style={{ color: "#10b981", fontSize: 12 }}>Answer: {q.answer}</div>
                                                            </>
                                                        )}
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