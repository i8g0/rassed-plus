import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SettingsProvider } from './contexts/SettingsContext'
import { UserProvider } from './contexts/UserContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </SettingsProvider>
  </StrictMode>,
)
