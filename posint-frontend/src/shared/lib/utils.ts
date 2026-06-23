import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNaira(kobo: number | bigint): string {
  const naira = Number(kobo) / 100
  if (naira >= 1_000_000_000_000) return `₦${(naira / 1_000_000_000_000).toFixed(1)}tn`
  if (naira >= 1_000_000_000) return `₦${(naira / 1_000_000_000).toFixed(1)}bn`
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}m`
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(1)}k`
  return `₦${naira.toLocaleString("en-NG")}`
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
