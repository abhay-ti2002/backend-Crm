"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAgentStore } from "@/stores/agentStore";
import { Sector } from "@/lib/mockData";
import { createAgent } from "@/lib/api/agents";
import { getAgentConfig, AgentLevel as BackendLevel } from "@/lib/api/meta";

// 📝 Zod Schema for Validation
const agentSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  sector: z.string().min(1, "Sector is required"),
  levelId: z.string().min(1, "Level is required"),
});

type AgentFormData = z.infer<typeof agentSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddAgentModal({ open, onClose }: Props) {
  const { setSelectedSector, setViewMode, addAgent } = useAgentStore();

  // Configuration from backend
  const [sectors, setSectors] = useState<string[]>([]);
  const [levels, setLevels] = useState<BackendLevel[]>([]);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      sector: "",
      levelId: "",
    },
  });

  const selectedSector = watch("sector");
  const selectedLevelId = watch("levelId");

  // Fetch configuration on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const config = await getAgentConfig();
        setSectors(config.sectors);
        setLevels(config.levels);
      } catch (err) {
        console.error("Failed to load metadata:", err);
        setApiError("Failed to load server configuration.");
      } finally {
        setIsConfigLoading(false);
      }
    }
    if (open) fetchConfig();
  }, [open]);

  const onSubmit = async (data: AgentFormData) => {
    setApiError("");
    try {
      const selectedLevel = levels.find((l) => l.id === data.levelId);
      if (!selectedLevel) throw new Error("Invalid level selection");

      const res = await createAgent({
        name: data.name,
        email: data.email,
        password: data.password,
        sector: data.sector,
        supportLevel: selectedLevel.value,
      });

      // 🔄 Update local store
      addAgent({
        name: res.user.name || data.name,
        email: res.user.email,
        sector: res.user.sector as Sector,
        level: data.levelId as any,
      });

      setSelectedSector(data.sector as Sector);
      setViewMode("columns");
      handleClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const handleClose = () => {
    reset();
    setApiError("");
    onClose();
  };

  const currentLevel = levels.find((l) => l.id === selectedLevelId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-slate-100 font-heading">Add New Agent</DialogTitle>
        </DialogHeader>

        {isConfigLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm text-slate-500">Syncing with server...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="agent-name" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Full Name
              </Label>
              <Input
                id="agent-name"
                placeholder="e.g. Riya Sharma"
                {...register("name")}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
              {errors.name && <p className="text-[11px] text-red-500 font-medium">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="agent-email" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Email Address
              </Label>
              <Input
                id="agent-email"
                type="email"
                placeholder="riya@crm.io"
                {...register("email")}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
              {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="agent-password" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Temporary Password
              </Label>
              <Input
                id="agent-password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
              {errors.password && <p className="text-[11px] text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            {/* Sector + Level side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sector</Label>
                <Select value={selectedSector ?? ""} onValueChange={(v) => setValue("sector", v || "")}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs dark:text-slate-100">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sector && <p className="text-[11px] text-red-500 font-medium">{errors.sector.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Support Level</Label>
                <Select value={selectedLevelId ?? ""} onValueChange={(v) => setValue("levelId", v || "")}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    {levels.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="text-xs dark:text-slate-100">
                        {l.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.levelId && <p className="text-[11px] text-red-500 font-medium">{errors.levelId.message}</p>}
              </div>
            </div>

            {/* Level hint */}
            {currentLevel && (
              <div className="rounded-lg bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 px-3 py-2.5 text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-400">
                <div dangerouslySetInnerHTML={{ __html: currentLevel.description }} />
              </div>
            )}

            {/* API error */}
            {apiError && (
              <p className="text-[11px] text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md px-3 py-2">
                {apiError}
              </p>
            )}

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}
                className="text-xs dark:border-slate-700 dark:text-slate-300">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700">
                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                {isSubmitting ? "Processing..." : "Register Agent"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
