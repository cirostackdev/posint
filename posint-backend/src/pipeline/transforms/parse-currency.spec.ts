import { parseNairaToBigInt } from './parse-currency'

// Jest cannot serialize BigInt natively — compare as strings
const s = (n: bigint) => n.toString()

describe('parseNairaToBigInt', () => {
  it('should parse billions', () => {
    expect(s(parseNairaToBigInt('₦2.5bn'))).toBe(s(BigInt(250_000_000_000)))
    expect(s(parseNairaToBigInt('N7.2b'))).toBe(s(BigInt(720_000_000_000)))
    expect(s(parseNairaToBigInt('2.5 billion naira'))).toBe(s(BigInt(250_000_000_000)))
  })

  it('should parse millions', () => {
    expect(s(parseNairaToBigInt('₦500m'))).toBe(s(BigInt(50_000_000_000)))
    expect(s(parseNairaToBigInt('NGN 100,000,000'))).toBe(s(BigInt(10_000_000_000)))
  })

  it('should parse thousands', () => {
    expect(s(parseNairaToBigInt('₦50k'))).toBe(s(BigInt(5_000_000)))
  })

  it('should parse plain numbers', () => {
    expect(s(parseNairaToBigInt('1000'))).toBe(s(BigInt(100_000)))
  })

  it('should handle empty input', () => {
    expect(s(parseNairaToBigInt(''))).toBe('0')
  })

  it('should handle null/undefined', () => {
    expect(s(parseNairaToBigInt(null as any))).toBe('0')
    expect(s(parseNairaToBigInt(undefined as any))).toBe('0')
  })

  it('should parse trillions', () => {
    expect(s(parseNairaToBigInt('1.5 trillion naira'))).toBe(s(BigInt(150_000_000_000_000)))
    expect(s(parseNairaToBigInt('2t'))).toBe(s(BigInt(200_000_000_000_000)))
  })
})
