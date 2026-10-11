// 個案詳情頁各區塊「能看」與「要不要去抓資料」用同一套規則，避免顯示與請求不一致：
// - 晤談紀錄、備忘屬臨床私密資料，只給治療中的心理師（owner 雖有權限仍刻意不抓）
// - 收費依 billing.view；稽核只給 owner；指派心理師的人員清單需要 staff.manage
export interface ClientDetailAccess {
  sessions: boolean
  memos: boolean
  billing: boolean
  audit: boolean
  staff: boolean
}

export function clientDetailAccess(
  activeRole: string | null,
  hasPermission: (code: string) => boolean,
): ClientDetailAccess {
  const isTherapist = activeRole === 'therapist'
  return {
    sessions: isTherapist,
    memos: isTherapist,
    billing: hasPermission('billing.view'),
    audit: activeRole === 'owner',
    staff: hasPermission('staff.manage'),
  }
}
