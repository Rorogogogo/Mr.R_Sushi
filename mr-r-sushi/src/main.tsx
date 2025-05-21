import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import AdminPage from './AdminPage'

// Get the root element
const rootElement = document.getElementById('root')

if (rootElement) {
  const root = createRoot(rootElement)

  // Create a function to render the app
  const renderApp = () => {
    root.render(
      <StrictMode>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </StrictMode>
    )
  }

  // Render the app
  renderApp()
}
