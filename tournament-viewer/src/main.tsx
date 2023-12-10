import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './App.tsx'

import './global.css'
import 'brackets-viewer/dist/brackets-viewer.min.css'
import url from 'brackets-viewer/dist/brackets-viewer.min.js?url'

// We have to shim this in since vite won't do this manipulation via index.html
function loadViewer() {
  return new Promise<void>((resolve,reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      resolve();
    }
    script.onerror = reject;
    document.head.append(script);
  });
}

async function start() {
  await loadViewer();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

start();

