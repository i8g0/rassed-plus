import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SettingsProvider } from './contexts/SettingsContext'
import { UserProvider } from './contexts/UserContext'
import { RasedProvider } from './contexts/RasedContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <SettingsProvider>
        <UserProvider>
          <RasedProvider>
            <App />
          </RasedProvider>
        </UserProvider>
      </SettingsProvider>
    </ErrorBoundary>
  </StrictMode>,
)

