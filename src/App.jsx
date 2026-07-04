import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home.jsx'
import { Login } from './pages/Login.jsx'
import { Quiz } from './pages/Quiz.jsx'
import { Results } from './pages/Results.jsx'
import { Ballot } from './pages/Ballot.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/results" element={<Results />} />
      <Route path="/ballot" element={<Ballot />} />
    </Routes>
  )
}

export default App
