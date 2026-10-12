import { describe, expect, it } from 'vitest'
import pkg from '../../package.json'

// D10：FullCalendar 的 resource / timeline / scheduler 系列是付費（Premium）授權，本專案沒有購買
const PREMIUM_FULLCALENDAR = ['resource', 'resource-timegrid', 'resource-timeline', 'resource-daygrid', 'timeline', 'scheduler', 'adaptive']

describe('相依套件', () => {
  it('不使用付費授權的 FullCalendar 套件', () => {
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
    const premium = deps.filter((d) => PREMIUM_FULLCALENDAR.some((p) => d === `@fullcalendar/${p}`))

    expect(premium).toEqual([])
  })
})
