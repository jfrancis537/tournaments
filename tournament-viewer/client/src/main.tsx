import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './App.tsx'
import { SocketManager } from './Managers/SocketManager.ts'

import './global.css'


async function run() {
  await SocketManager.initAPIs();
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

run();