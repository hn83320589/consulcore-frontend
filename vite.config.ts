import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { requireApiBaseUrl } from './src/utils/apiBaseUrl'

// 正式建置時就檢查 API 位址：否則要等部署後打開頁面才會發現（執行時 httpService 也會再檢查一次）
const requireApiBaseUrlOnBuild: Plugin = {
  name: 'require-api-base-url',
  configResolved(config) {
    if (config.command === 'build') requireApiBaseUrl(config.env.VITE_API_BASE_URL)
  },
}

export default defineConfig({
  plugins: [vue(), requireApiBaseUrlOnBuild],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
