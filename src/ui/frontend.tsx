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
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from '@/ui/components/Layout'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
