import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/auth' element={<LoginPage/>} />
        <Route path='/' element={<div>home</div>} />
        <Route path='/stats' element={<div>stats</div>} />
        {/* 
        <Route path='/' element={<HomePage/>} />
        <Route path='/stats' element={<StatsPage/>} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
