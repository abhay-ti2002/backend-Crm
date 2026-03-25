"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAgentStore } from "@/stores/agentStore";
import { AgentLevel, Sector } from "@/lib/mockData";
import { createAgent } from "@/lib/api/agents";

const SECTORS: Sector[] = ["IT", "Healthcare", "Education", "Finance"];
const LEVELS: AgentLevel[] = ["L1", "L2", "L3"];

const levelLabel: Record<AgentLevel, string> = {
  L1: "L1 — Junior (Email)",
  L2: "L2 — Mid (Phone Call)",
  L3: "L3 — Senior (Physical Visit)",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddAgentModal({ open, onClose }: Props) {
  const { setSelectedSector, setViewMode } = useAgentStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState<Sector | "">("");
  const [level, setLevel] = useState<AgentLevel | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!sector) e.sector = "Sector is required";
    if (!level) e.level = "Level is required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    setApiError("");
    try {
      await createAgent({
        name: name.trim(),
        email: email.trim(),
        sector: sector as Sector,
        level: level as AgentLevel,
      });
      // Switch view to the new agent's sector
      setSelectedSector(sector as Sector);
      setViewMode("columns");
      handleClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    if (isLoading) return;
    setName(""); setEmail(""); setSector(""); setLevel(""); setErrors({}); setApiError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-slate-100">Add New Agent</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="agent-name" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Full Name
            </Label>
            <Input
              id="agent-name"
              placeholder="e.g. Riya Sharma"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="agent-email" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Email
            </Label>
            <Input
              id="agent-email"
              type="email"
              placeholder="e.g. riya@crm.io"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Sector + Level side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sector</Label>
              <Select value={sector} onValueChange={(v) => { setSector(v as Sector); setErrors((p) => ({ ...p, sector: "" })); }}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s} className="dark:text-slate-100 dark:focus:bg-slate-700">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sector && <p className="text-xs text-red-500">{errors.sector}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Level</Label>
              <Select value={level} onValueChange={(v) => { setLevel(v as AgentLevel); setErrors((p) => ({ ...p, level: "" })); }}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l} className="dark:text-slate-100 dark:focus:bg-slate-700">
                      {levelLabel[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && <p className="text-xs text-red-500">{errors.level}</p>}
            </div>
          </div>

          {/* Level hint */}
          {level && (
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
              {level === "L1" && "L1 agents handle tickets via <strong>email</strong>. They can resolve or escalate to L2."}
              {level === "L2" && "L2 agents handle escalated tickets via <strong>phone call</strong>. They can resolve or escalate to L3."}
              {level === "L3" && "L3 agents handle the most complex tickets via <strong>physical visit</strong>. Final escalation level."}
            </div>
          )}

          {/* API error */}
          {apiError && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md px-3 py-2">
              {apiError}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}
              className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-1.5">
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isLoading ? "Adding…" : "Add Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
