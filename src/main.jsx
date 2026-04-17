import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
=======
import { SettingsProvider } from './contexts/SettingsContext'
import { UserProvider } from './contexts/UserContext'
>>>>>>> origin/main
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
<<<<<<< HEAD
    <App />
=======
    <SettingsProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </SettingsProvider>
>>>>>>> origin/main
  </StrictMode>,
)
