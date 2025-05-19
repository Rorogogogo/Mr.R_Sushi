import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Get the root element
const rootElement = document.getElementById('root')

if (rootElement) {
  const root = createRoot(rootElement)

  // Create a function to render the app
  const renderApp = () => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  }

  // Render the app
  renderApp()
}
