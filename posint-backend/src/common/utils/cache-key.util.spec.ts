import { cacheKey } from './cache-key.util'

describe('cacheKey', () => {
  it('produces same key regardless of property order', () => {
    const key1 = cacheKey('test', { a: 1, b: 2, c: 3 })
    const key2 = cacheKey('test', { c: 3, a: 1, b: 2 })
    expect(key1).toBe(key2)
  })

  it('produces different keys for different values', () => {
    const key1 = cacheKey('test', { page: 1 })
    const key2 = cacheKey('test', { page: 2 })
    expect(key1).not.toBe(key2)
  })

  it('ignores null and undefined values', () => {
    const key1 = cacheKey('test', { page: 1, filter: null })
    const key2 = cacheKey('test', { page: 1 })
    expect(key1).toBe(key2)
  })

  it('includes prefix in key', () => {
    const key = cacheKey('politicians:list', { page: 1 })
    expect(key).toMatch(/^politicians:list:/)
  })
})
