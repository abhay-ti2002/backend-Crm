"use client";

import { Bell, Search, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

const breadcrumbMap: Record<string, string> = {
  "/admin":          "Dashboard",
  "/admin/tickets":  "Tickets",
  "/admin/agents":   "Agents",
  "/admin/products": "Products",
  "/admin/logs":     "Resolution Logs",
  "/admin/users":    "Users",
};

export function Topbar() {
  const pathname = usePathname();
  const base = "/" + pathname.split("/").slice(1, 3).join("/");
  const title = breadcrumbMap[base] ?? "Admin";
  const { theme, toggle } = useTheme();

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 flex items-center px-6 gap-4 shrink-0">
      {/* <h1 className="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h1> */}

      <div className="flex-1" />

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        <Input
          placeholder="Search tickets…"
          className="pl-8 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        {theme === "dark"
          ? <Sun className="w-4 h-4" />
          : <Moon className="w-4 h-4" />}
      </Button>

      <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-400">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </Button>

      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-indigo-200 dark:ring-indigo-500/40 ring-offset-1">
        AD
      </div>
    </header>
  );
}
