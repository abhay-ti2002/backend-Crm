"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TicketCheck, Eye, EyeOff } from "lucide-react";
import { useAgentSessionStore } from "@/stores/agentSessionStore";
import { useAgentStore } from "@/stores/agentStore";
import { useAdminSessionStore } from "@/stores/adminSessionStore";
import { useUserSessionStore } from "@/stores/userSessionStore";
import { adminCredentials, users } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log(`[LoginPage] Attempting login for ${email}`);
      await login({
        email: email.trim().toLowerCase(),
        password,
      });
      console.log(`[LoginPage] Login call finished`);
    } catch (err: any) {
      console.error(`[LoginPage] Login error:`, err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <TicketCheck className="w-6 h-6 text-indigo-500" />
          <span className="font-heading font-bold text-slate-900 dark:text-white text-2xl tracking-tight">
            TICKR
          </span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Sign in
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@crm.io"
                autoComplete="email"
                required
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800",
                  "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                  "transition-colors duration-150",
                  error
                    ? "border-red-400 dark:border-red-500"
                    : "border-slate-200 dark:border-slate-700",
                )}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 pr-10 text-sm bg-white dark:bg-slate-800",
                    "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                    "transition-colors duration-150",
                    error
                      ? "border-red-400 dark:border-red-500"
                      : "border-slate-200 dark:border-slate-700",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
