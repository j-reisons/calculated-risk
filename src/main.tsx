import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "./main.css";

ReactDOM.createRoot(document.getElementById('calculator')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
