import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { SocketManager } from './Managers/SocketManager.ts'

import './global.css'
import { CssVarsProvider, extendTheme, useColorScheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';


const EntryPoint: React.FC = () => {

  return (
    <React.StrictMode>
      <CssVarsProvider disableNestedContext defaultMode='light' defaultColorScheme='light'>
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </React.StrictMode>
  )
}

async function run() {
  await SocketManager.initAPIs();
  ReactDOM.createRoot(document.getElementById('root')!).render(<EntryPoint />)
}

run();