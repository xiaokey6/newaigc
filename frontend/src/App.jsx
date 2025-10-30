import { Routes, Route } from 'react-router-dom'
import RequirementPage from './pages/RequirementPage.jsx'
import PlanPage from './pages/PlanPage.jsx'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6 px-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            AIGC智能旅游规划系统
          </h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <Routes>
          <Route path="/" element={<RequirementPage />} />
          <Route path="/plan" element={<PlanPage />} />
        </Routes>
      </main>
      
      <footer className="bg-gray-800 text-white py-4 px-4">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2024 AIGC旅游规划系统 - 智能出行，无忧旅程</p>
        </div>
      </footer>
    </div>
  )
}

export default App