"use client"

import { createContext, useContext, ReactNode } from "react"
import type { RuntimeConfig } from "@/lib/runtime-config"

const RuntimeConfigContext = createContext<RuntimeConfig>({
  amapKey: "",
  amapSecurityCode: "",
  defaultTheme: "light",
})

export function RuntimeConfigProvider({
  initial,
  children,
}: {
  initial: RuntimeConfig
  children: ReactNode
}) {
  return (
    <RuntimeConfigContext.Provider value={initial}>
      {children}
    </RuntimeConfigContext.Provider>
  )
}

export function useRuntimeConfig(): RuntimeConfig {
  return useContext(RuntimeConfigContext)
}
