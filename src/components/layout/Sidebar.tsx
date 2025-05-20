
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import {
  Database,
  Activity,
  ListChecks,
  Settings,
  BarChart4,
  Gauge,
  Laptop,
  Home
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="h-screen w-64 border-r bg-sidebar p-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 py-3">
        <Laptop size={24} className="text-agent" />
        <h1 className="font-bold text-xl">IngestMate</h1>
      </div>
      {/* Nav links */}
      <nav className="space-y-1 mt-8">
        <NavItem
          icon={<Home size={18} />}
          label="Dashboard"
          href="/"
          active={currentPath === "/"}
        />
        <NavItem
          icon={<Database size={18} />}
          label="Pipelines"
          href="/pipelines"
          active={currentPath.startsWith("/pipelines")}
        />
        <NavItem
          icon={<Activity size={18} />}
          label="Agents"
          href="/agents"
          active={currentPath.startsWith("/agents")}
        />
        <NavItem
          icon={<ListChecks size={18} />}
          label="Interventions"
          href="/interventions"
          active={currentPath.startsWith("/interventions")}
        />
        <NavItem
          icon={<BarChart4 size={18} />}
          label="Analytics"
          href="/analytics"
          active={currentPath.startsWith("/analytics")}
        />
        <NavItem
          icon={<Settings size={18} />}
          label="Settings"
          href="/settings"
          active={currentPath.startsWith("/settings")}
        />
      </nav>

      {/* Agent mode toggle switch at bottom */}
      <div className="mt-auto border-t pt-4">
        <AgentModeSwitch />
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function NavItem({ icon, label, href, active }: NavItemProps) {
  return (
    <Link to={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        <span className="text-muted-foreground">{icon}</span>
        <span>{label}</span>
      </div>
    </Link>
  );
}

function AgentModeSwitch() {
  const agentMode = useAppStore((state) => state.agentMode);
  const setAgentMode = useAppStore((state) => state.setAgentMode);

  // true = autonomous, false = supervised
  const onChange = (v: boolean) => setAgentMode(v ? "autonomous" : "supervised");

  return (
    <div className="flex flex-col w-full gap-2 px-2">
      <span className="text-sm font-medium mb-1">Agent Mode</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-muted px-3 py-1 rounded-lg gap-3 w-full justify-between">
          <span className="text-xs text-muted-foreground whitespace-nowrap pr-2">Supervised</span>
          <Switch
            checked={agentMode === "autonomous"}
            onCheckedChange={onChange}
            aria-label="Toggle autonomous agent mode"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap pl-2">Autonomous</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {agentMode === "supervised"
          ? "Agents suggest actions for approval"
          : "Agents auto-apply remediations"}
      </p>
    </div>
  );
}
