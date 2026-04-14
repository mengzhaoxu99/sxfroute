"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { useRuntimeConfig } from "@/providers/runtime-config";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { defaultTheme } = useRuntimeConfig();

  return (
    <NextThemesProvider
      defaultTheme={defaultTheme}
      enableSystem={false}
      {...props}
    >
      {children}

      <Toaster position="top-center" richColors />
    </NextThemesProvider>
  );
}
