import { describe, it, expect } from "vitest"
import { cn, formatNaira, formatCompactNumber, slugify, getInitials, formatDate } from "@/shared/lib/utils"

describe("cn (class name merger)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("deduplicates tailwind classes", () => {
    expect(cn("p-4", "p-2")).toBe("p-2")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })
})

describe("formatNaira", () => {
  it("formats kobo to naira for small amounts", () => {
    expect(formatNaira(50000)).toBe("₦500")
  })

  it("formats thousands with k suffix", () => {
    expect(formatNaira(1_000_00)).toBe("₦1.0k")
  })

  it("formats millions with m suffix", () => {
    expect(formatNaira(100_000_000)).toBe("₦1.0m")
  })

  it("formats billions with bn suffix", () => {
    expect(formatNaira(100_000_000_000)).toBe("₦1.0bn")
  })

  it("formats trillions with tn suffix", () => {
    expect(formatNaira(1_000_000_000_000_00)).toBe("₦1.0tn")
  })

  it("handles bigint input", () => {
    expect(formatNaira(BigInt(50000))).toBe("₦500")
  })
})

describe("formatCompactNumber", () => {
  it("formats plain numbers under 1000", () => {
    const result = formatCompactNumber(42)
    expect(result).toBe("42")
  })

  it("formats thousands with K suffix", () => {
    expect(formatCompactNumber(5000)).toBe("5.0K")
  })

  it("formats millions with M suffix", () => {
    expect(formatCompactNumber(2_500_000)).toBe("2.5M")
  })

  it("formats billions with B suffix", () => {
    expect(formatCompactNumber(1_000_000_000)).toBe("1.0B")
  })
})

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Bola Tinubu")).toBe("bola-tinubu")
  })

  it("removes special characters", () => {
    expect(slugify("Atiku Abubakar (PDP)")).toBe("atiku-abubakar-pdp")
  })

  it("collapses multiple hyphens", () => {
    expect(slugify("hello   world")).toBe("hello-world")
  })
})

describe("getInitials", () => {
  it("returns first two initials", () => {
    expect(getInitials("Bola Ahmed Tinubu")).toBe("BA")
  })

  it("handles single name", () => {
    expect(getInitials("Atiku")).toBe("A")
  })

  it("uppercases initials", () => {
    expect(getInitials("peter obi")).toBe("PO")
  })
})

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2023-02-25")
    expect(result).toMatch(/Feb|25|2023/)
  })

  it("returns a non-empty string", () => {
    const result = formatDate("2020-01-01")
    expect(result.length).toBeGreaterThan(0)
  })
})
