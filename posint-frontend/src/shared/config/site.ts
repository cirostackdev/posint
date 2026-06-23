export const SITE = {
  name: "POSINT",
  fullName: "Nigerian Political Intelligence",
  description: "Open-source intelligence on Nigerian politicians, elections, legislation, and anti-corruption efforts.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
} as const
