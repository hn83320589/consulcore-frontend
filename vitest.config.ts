import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

// 固定時區：日期換算的 bug 只在 UTC+8 出現，CI runner 預設是 UTC，不固定就測不出來
process.env.TZ = 'Asia/Taipei'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      root: fileURLToPath(new URL('./', import.meta.url)),
      include: ['src/**/__tests__/*.spec.ts'],
      // .env.development 不進版控；測試不連真的 API，給一個固定值讓 httpService 能建立
      env: { VITE_API_BASE_URL: 'http://localhost:5037/api' },
    },
  }),
)
