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

await loadViewer();
export const BracketsViewer = globalThis.bracketsViewer;