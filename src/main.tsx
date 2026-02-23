import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { getInitialTheme } from './utils/theme'

// 在 React 挂载前设置初始主题，避免闪白（FOUC）
const initialTheme = getInitialTheme()
document.documentElement.setAttribute('data-theme', initialTheme === 'dark' ? 'dark' : '')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
