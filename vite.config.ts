import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // TypeScript 에러가 있어도 빌드 진행
    rollupOptions: {
      onwarn(warning, warn) {
        // TypeScript 관련 경고 무시
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      }
    }
  }
})
