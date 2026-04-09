import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ConsultasPage from './pages/ConsultasPage'

function App() {
  return (
    <BrowserRouter>
      {/* El Navbar está fuera de las Routes para que siempre sea visible */}
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* El contenido de las páginas se renderiza aquí dentro */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/consultas" element={<ConsultasPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App