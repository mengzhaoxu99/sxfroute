/**
 * Runtime config — let the server inject environment variables at request time,
 * so a single Docker image works across environments without rebuilding.
 *
 * Server components / API routes: import and call getRuntimeConfig() directly.
 * Client components: use the <RuntimeConfigProvider> + useRuntimeConfig() hook.
 */

/** Only the variables that client-side code actually needs */
export interface RuntimeConfig {
  amapKey: string
  amapSecurityCode: string
  defaultTheme: string
}

/** Server-side helper — reads process.env at call time (not build time) */
export function getRuntimeConfig(): RuntimeConfig {
  return {
    amapKey: process.env.NEXT_PUBLIC_AMAP_KEY ?? "",
    amapSecurityCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE ?? "",
    defaultTheme: process.env.NEXT_PUBLIC_DEFAULT_THEME || "light",
  }
}
