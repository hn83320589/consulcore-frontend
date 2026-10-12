/**
 * 沒設定 VITE_API_BASE_URL 時 axios 會改打前端自己的網域，所有 API 都 404，很難看出原因；
 * 啟動時直接報錯並指出缺少的設定。
 */
export function requireApiBaseUrl(value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error('缺少 VITE_API_BASE_URL：請參考 .env.example，在 .env.development（或部署環境變數）設定後端 API 位址')
  }
  return value
}
