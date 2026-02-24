import { BrowserRouter, Routes, Route } from 'react-router-dom'
import JeopardyGame from './components/JeopardyGame'
import AdminPanel from './components/AdminPanel'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JeopardyGame /> } />
        <Route path="/admin" element={<AdminPanel /> } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
