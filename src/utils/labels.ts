// 後端以英文代碼儲存的值，顯示時一律轉中文；遇到未知代碼照原樣顯示，不讓畫面空白

export const genderOptions = [
  { label: '女', value: 'female' },
  { label: '男', value: 'male' },
  { label: '其他', value: 'other' },
]

/** 性別：早期資料是自由輸入的文字，對不到代碼時照原樣顯示 */
export function genderLabel(value: string | null | undefined): string {
  if (!value) return ''
  return genderOptions.find((o) => o.value === value)?.label ?? value
}

const roleLabels: Record<string, string> = {
  owner: '機構負責人',
  admin: '行政人員',
  therapist: '心理師',
  client: '個案',
}

export function roleLabel(role: string): string {
  return roleLabels[role] ?? role
}

export function rolesLabel(roles: readonly string[]): string {
  return roles.map(roleLabel).join('、')
}

const auditActionLabels: Record<string, string> = {
  create: '建立', update: '更新', delete: '刪除', view: '檢視', search: '搜尋', export: '匯出',
  login: '登入', login_failed: '登入失敗', change_password: '變更密碼', reset_password: '重設密碼',
  toggle_active: '啟用／停用', register: '開設機構', update_permissions: '調整權限',
  assign: '指派', remove: '移除', assign_therapist: '指派心理師', remove_therapist: '移除心理師',
  transfer_therapist: '移轉心理師', change_status: '變更狀態',
  cancel: '取消', complete: '完成', no_show: '未到', reschedule: '改期',
  renew: '續約', end: '結束', expand: '展班', block: '封鎖', unblock: '解除封鎖',
  lock: '鎖定', unlock: '解鎖', sign: '簽署', void: '作廢', submit: '提交', clone: '複製',
  confirm: '收款', refund: '退費', waive: '免收', purchase: '購買', package_deduct: '套餐扣次', expire: '到期',
  set_visibility: '設定可見性', visibility_open: '開放檢視', visibility_close: '收回檢視',
  resolve: '處理', dismiss: '駁回',
}

export const auditActionOptions = Object.entries(auditActionLabels).map(([value, label]) => ({ value, label }))

export function auditActionLabel(action: string): string {
  return auditActionLabels[action] ?? action
}

const auditResourceLabels: Record<string, string> = {
  organization: '機構',
  user: '使用者',
  role: '角色',
  client_profile: '個案',
  client_memo: '個案備忘',
  client_discount: '個案折扣',
  client_package: '個案套餐',
  appointment: '預約',
  appointment_series: '常態預約',
  schedule_template: '排班範本',
  schedule_slot: '排班時段',
  room: '診間',
  session_note: '晤談紀錄',
  consent_template: '同意書範本',
  consent_record: '同意書簽署',
  form_template: '表單範本',
  form_submission: '表單填答',
  fee_schedule: '費率',
  package: '套餐',
  discount: '折扣',
  payment_record: '付款紀錄',
  performance_review: '考核',
  violation_record: '違規紀錄',
  audit_log: '稽核紀錄',
}

export const auditResourceOptions = Object.entries(auditResourceLabels).map(([value, label]) => ({ value, label }))

export function auditResourceLabel(resource: string): string {
  return auditResourceLabels[resource] ?? resource
}
