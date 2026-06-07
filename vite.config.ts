import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5239',   // Your .NET backend port
        changeOrigin: true,
        secure: false,
        localAddress: '127.0.0.1',
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
