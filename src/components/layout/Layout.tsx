
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const initialize = useAppStore((state) => state.initialize);
  
  // Initialize app data on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
