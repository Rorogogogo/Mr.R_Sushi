import { useEffect, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Menu from './components/Menu'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)

  // Add class to body to ensure content is visible under fixed header
  useEffect(() => {
    document.body.classList.add('has-fixed-header')

    // Mark app as loaded after a short delay
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => {
      document.body.classList.remove('has-fixed-header')
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className={`app-container ${isLoaded ? 'app-loaded' : 'app-loading'}`}>
      <Header />
      <main className="pt-16">
        {' '}
        {/* Add padding top to account for fixed header */}
        <Hero />
        <Menu />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
