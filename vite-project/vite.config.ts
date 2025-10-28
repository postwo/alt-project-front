import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // sockjs-client가 Node.js의 global을 찾을 때 window 객체를 사용하도록 대체합니다.
    global: 'window',
  },
});
