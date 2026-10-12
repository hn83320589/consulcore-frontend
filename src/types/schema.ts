import type { components } from './generated/api'

/**
 * 後端 DTO 的型別，由 openapi/openapi.json 產生（npm run gen:api）。
 * 後端契約異動時：npm run api:sync && npm run gen:api，再修正 type-check 指出的地方。
 */
export type Schemas = components['schemas']
