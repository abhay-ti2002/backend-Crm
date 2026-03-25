"use client";

import { useEffect, useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Agent, AgentLevel, Sector } from "@/lib/mockData";

const levelAvatarColor: Record<AgentLevel, string> = {
  L1: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
  L2: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  L3: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};

/** Watches the <html> class list for the `dark` class — reacts to theme toggles instantly */
function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    setDark(el.classList.contains("dark"));
    const obs = new MutationObserver(() => setDark(el.classList.contains("dark")));
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function OrgNode({ agent }: { agent: Agent }) {
  return (
    <div className="inline-flex flex-col items-center">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm min-w-36 text-center transition-colors duration-200">
        <Avatar className="w-8 h-8 mx-auto mb-1">
          <AvatarFallback className={`text-xs font-semibold ${levelAvatarColor[agent.level]}`}>
            {agent.avatar}
          </AvatarFallback>
        </Avatar>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{agent.name.split(" ")[0]}</p>
        <RoleBadge level={agent.level} showMethod={false} />
        <div className="flex justify-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
          <span>{agent.activeTickets} active</span>
          <span>{agent.resolvedTickets} done</span>
        </div>
      </div>
    </div>
  );
}

function buildChildren(agents: Agent[], supervisorId: string | null): Agent[] {
  return agents.filter((a) => a.supervisorId === supervisorId);
}

function OrgTreeNode({ agent, agents }: { agent: Agent; agents: Agent[] }) {
  const children = buildChildren(agents, agent.id);
  if (children.length === 0) {
    return <TreeNode label={<OrgNode agent={agent} />} />;
  }
  return (
    <TreeNode label={<OrgNode agent={agent} />}>
      {children.map((child) => (
        <OrgTreeNode key={child.id} agent={child} agents={agents} />
      ))}
    </TreeNode>
  );
}

export function AgentOrgChart({ sector, agents }: { sector: Sector; agents: Agent[] }) {
  const dark = useDark();
  const sectorAgents = agents.filter((a) => a.sector === sector);
  const roots = buildChildren(sectorAgents, null);

  if (roots.length === 0) {
    return <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">No agents in this sector</p>;
  }

  // Dot color adapts to theme
  const dotColor = dark ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.18)";
  const lineColor = dark ? "#4f46e5" : "#c7d2fe";

  return (
    <div
      className="overflow-x-auto py-8 px-4 rounded-xl"
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: "22px 22px",
      }}
    >
      <Tree
        lineWidth="2px"
        lineColor={lineColor}
        lineBorderRadius="6px"
        label={
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md shadow-indigo-500/30">
            {sector} Sector
          </div>
        }
      >
        {roots.map((root) => (
          <OrgTreeNode key={root.id} agent={root} agents={sectorAgents} />
        ))}
      </Tree>
    </div>
  );
}
