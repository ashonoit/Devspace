import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {GoogleOAuthProvider} from "@react-oauth/google"
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.ts'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH20_CLIENT_ID!}>
            <App />
        </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
