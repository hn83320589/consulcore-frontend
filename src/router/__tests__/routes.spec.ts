import { describe, expect, it, vi } from 'vitest'
import type { Component } from 'vue'

vi.mock('@/services/authService', () => ({ default: { getMe: vi.fn() } }))
const { default: router } = await import('@/router')

type Loader = () => Promise<{ default: Component }>
const pageRoutes = () => router.getRoutes().filter((r) => r.components?.default)

// R9：原本 27 個頁面全部在 router 載入時 import，打包成單一 870KB 的 chunk
describe('路由元件', () => {
  it('除了登入頁，所有頁面都延遲載入', () => {
    const eager = pageRoutes()
      .filter((r) => typeof r.components!.default !== 'function' && r.path !== '/login')
      .map((r) => r.path)

    expect(eager).toEqual([])
  })

  // 延遲載入後，頁面只在進入時才 import；這裡逐一載入，確保每個頁面模組都沒壞
  it('每個頁面模組都能載入', async () => {
    const loaders = pageRoutes()
      .map((r) => r.components!.default)
      .filter((c): c is Loader => typeof c === 'function')

    const modules = await Promise.all(loaders.map((load) => load()))

    expect(modules.length).toBeGreaterThan(20)
    for (const m of modules) expect(m.default).toBeTruthy()
  })
})
