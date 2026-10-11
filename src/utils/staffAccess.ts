// 對應後端 B2：擁有者角色與擁有者帳號只能由「以 owner 身份操作」的人處理，
// 其他人送出會被後端以 403 拒絕，因此 UI 不提供這些操作。
const OWNER = 'owner'

export function assignableRoles(roleNames: string[], activeRole: string | null): string[] {
  return activeRole === OWNER ? roleNames : roleNames.filter((name) => name !== OWNER)
}

export function canManageUser(user: { roles: string[] }, activeRole: string | null): boolean {
  return activeRole === OWNER || !user.roles.includes(OWNER)
}
