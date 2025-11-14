import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './admin/AdminDashboard'
import UserDashboard from './user/UserDashboard'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/user" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App