import 'brackets-viewer/dist/brackets-viewer.min.css'
import url from 'brackets-viewer/dist/brackets-viewer.min.js?url'
import { Lazy } from '../Utilities/Lazy';

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

loadViewer();

export const BracketsViewer = new Lazy(() => globalThis.bracketsViewer);