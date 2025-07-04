/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from 'react-dom/client'
import { App } from './App'
import './App.css'

import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router'

function start() {
  const root = createRoot(document.getElementById('root')!)
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start)
} else {
  start()
}
