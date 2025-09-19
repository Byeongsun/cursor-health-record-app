import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
        // TypeScript 에러가 있어도 빌드 진행
        rollupOptions: {
          onwarn(warning, warn) {
            // 모든 TypeScript 관련 경고 무시
            if (
              warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
              warning.code === 'UNUSED_EXTERNAL_IMPORT' ||
              warning.code === 'CIRCULAR_DEPENDENCY' ||
              warning.message?.includes('Type') ||
              warning.message?.includes('Property') ||
              warning.message?.includes('Argument')
            ) {
              return
            }
            warn(warning)
          }
        }
  }
})
