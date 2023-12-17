import { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

class ViteProxyMiddleware {
  public readonly path = "/*";
  public readonly middleware = createProxyMiddleware({
    target: 'http://localhost:5173/',
    changeOrigin: true
  });
}

const generator = (): [string,RequestHandler] => {
  const instance = new ViteProxyMiddleware();
  return [instance.path,instance.middleware];
}

export {generator as ViteProxyMiddleware};