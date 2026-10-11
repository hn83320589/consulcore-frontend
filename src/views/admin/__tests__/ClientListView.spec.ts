import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { ClientProfile } from '@/types'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/services/clientService', () => ({
  default: { getClients: vi.fn().mockResolvedValue([]), createClient: vi.fn() },
}))

const { default: clientService } = await import('@/services/clientService')
const { default: ClientListView } = await import('@/views/admin/ClientListView.vue')

function created(overrides: Partial<ClientProfile>): ClientProfile {
  return { id: 1, name: '王小明', userId: null, mustChangePassword: false, ...overrides } as ClientProfile
}

function button(label: string) {
  return [...document.body.querySelectorAll('button')].find((b) => b.textContent?.trim() === label)!
}

async function createClientNamed(name: string) {
  const wrapper = mount(ClientListView, { attachTo: document.body })
  await flushPromises()
  button('新增個案').click()
  await flushPromises()
  const nameInput = document.body.querySelector<HTMLInputElement>('input[placeholder="必填"]')!
  nameInput.value = name
  nameInput.dispatchEvent(new Event('input'))
  await flushPromises()
  button('新增').click()
  await flushPromises()
  return wrapper
}

describe('ClientListView 建立個案', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('後端回傳初始帳密時，顯示給櫃檯交付', async () => {
    setActivePinia(createPinia())
    vi.mocked(clientService.createClient).mockResolvedValue(
      created({ userId: 9, initialCredentials: { username: 'client_1_1760000000', password: 'k7Xp2mQa9z' } }),
    )

    await createClientNamed('王小明')

    expect(document.body.textContent).toContain('個案帳號已建立')
    expect(document.body.textContent).toContain('k7Xp2mQa9z')
  })

  it('沒有建立帳號時不顯示帳密視窗', async () => {
    setActivePinia(createPinia())
    vi.mocked(clientService.createClient).mockResolvedValue(created({}))

    await createClientNamed('王小明')

    expect(document.body.textContent).not.toContain('個案帳號已建立')
  })
})
