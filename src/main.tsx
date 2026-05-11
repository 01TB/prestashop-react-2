import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

//SBAdmin2 Style
import './assets/css/sb-admin-2.css';

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
