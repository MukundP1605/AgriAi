import React from 'react'
import ReactDOM from 'react-dom/client'
import ThemeApp from './ThemeApp.jsx'
import { UIThemeProvider } from './context/UIThemeContext'
// Import base theme styles first
import './themes/theme-base.css'  // Base theme system CSS
// Import theme-specific CSS files
import './themes/classic/output.css'  // Classic theme CSS
import './themes/futuristic/output.css'  // Futuristic theme CSS
// These styles will be included for both themes but can be modified later
import './themes/classic/components/gridPattern.css'  // Import grid pattern CSS
import './themes/classic/components/darkModeAnimations.css'  // Import dark mode animations

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UIThemeProvider>
      <ThemeApp />
    </UIThemeProvider>
  </React.StrictMode>,
)
