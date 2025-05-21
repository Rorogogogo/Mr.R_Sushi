import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme/theme'
import AdminDashboard from './components/AdminDashboard'

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if already authenticated from session storage
    const adminAuth = sessionStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
      return
    }

    // If not authenticated, prompt for credentials
    const username = prompt('管理员用户名:')
    // If user cancels the prompt, redirect to home
    if (username === null) {
      setIsAuthenticated(false)
      return
    }

    const password = prompt('管理员密码:')
    // If user cancels the password prompt, redirect to home
    if (password === null) {
      setIsAuthenticated(false)
      return
    }

    // Validate credentials
    if (username === 'roro' && password === 'roro') {
      // Store auth in sessionStorage
      sessionStorage.setItem('adminAuth', 'true')
      setIsAuthenticated(true)
    } else {
      alert('用户名或密码不正确')
      setIsAuthenticated(false)
    }
  }, [])

  if (isAuthenticated === null) {
    // Still checking authentication
    return null
  }

  if (isAuthenticated === false) {
    // Redirect to home if not authenticated
    return <Navigate to="/" replace />
  }

  // User is authenticated, show admin dashboard
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AdminDashboard />
    </ThemeProvider>
  )
}

export default AdminPage
