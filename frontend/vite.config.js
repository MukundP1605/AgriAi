import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Using the standard Vite PostCSS integration
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        timeout: 120000,
        proxyTimeout: 120000,
        ws: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err.message);
            if (!res.headersSent) {
              res.writeHead(502, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({
                error: 'Proxy Error', 
                message: err.message,
                details: 'Backend connection failed'
              }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('→ Proxying:', req.method, req.url, 'to', proxyReq.path);
            // Ensure proper headers
            proxyReq.setHeader('Connection', 'close');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('← Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
