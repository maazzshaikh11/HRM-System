import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

// Placeholder TooltipProvider (will be replaced by shadcn/ui tooltip if installed)
const TooltipProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

// Placeholder SidebarProvider (will be replaced by shadcn/ui sidebar if installed)
const SidebarProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="hrms-theme">
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
