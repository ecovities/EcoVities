import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center min-h-screen bg-[#e0e0e0]">
      <div className="w-full max-w-md bg-surface shadow-2xl h-[100dvh] relative overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
