import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '../output.css'  // Using the generated Tailwind CSS output file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
