import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { SocketManager } from './Managers/SocketManager.ts'

import './global.css'
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';


async function run() {
  await SocketManager.initAPIs();
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <CssVarsProvider defaultMode='system'>
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </React.StrictMode>,
  )
}

run();