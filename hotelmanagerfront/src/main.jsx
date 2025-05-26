// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ————— Global fetch override para evitar undefined y .accept —————
const originalFetch = window.fetch.bind(window)
window.fetch = async (...args) => {
  let res
  try {
    // intenta la petición normal
    res = await originalFetch(...args)
  } catch (err) {
    console.error('Fetch falló:', err)
    // si hay error, devolvemos un Response dummy (status 500)
    res = new Response(null, {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Accept': '' }
    })
  }
  // inyectamos la propiedad .accept si no existe
  if (res.accept === undefined) {
    Object.defineProperty(res, 'accept', {
      get: () => res.headers.get('Accept'),
      configurable: true
    })
  }
  return res
}
// ——————————————————————————————————————————————————————————————

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
