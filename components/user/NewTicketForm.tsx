"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Paperclip, X, Send } from "lucide-react";
import { useTicketStore } from "@/stores/ticketStore";
import { useAgentStore } from "@/stores/agentStore";
import { useUserSessionStore } from "@/stores/userSessionStore";
import { users, products } from "@/lib/mockData";
import { Sector } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface FormValues {
  sector: Sector | "";
  productName: string;
  nature: string;
  description: string;
}

interface NewTicketFormProps {
  onSuccess: (ticketId: string) => void;
  onCancel: () => void;
}

const sectors: Sector[] = ["IT", "Healthcare", "Education", "Finance"];

const inputClass = cn(
  "w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800",
  "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
  "border-slate-200 dark:border-slate-700 transition-colors duration-150"
);

const labelClass = "text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider";

export function NewTicketForm({ onSuccess, onCancel }: NewTicketFormProps) {
  const { currentUserId } = useUserSessionStore();
  const { createTicket } = useTicketStore();
  const { autoAssign } = useAgentStore();

  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { sector: "", productName: "", nature: "", description: "" },
  });

  const selectedSector = watch("sector") as Sector | "";

  const filteredProducts = selectedSector
    ? products.filter((p) => p.sector === selectedSector)
    : products;

  const currentUser = users.find((u) => u.id === currentUserId);

  const onSubmit = (values: FormValues) => {
    if (!currentUser || !values.sector) return;
    setSubmitting(true);

    const { tickets } = useTicketStore.getState();
    // Mirror the ID logic in ticketStore.createTicket so we know the new ticket's ID
    const newId = `TKT-${String(tickets.length + 1).padStart(3, "0")}`;

    const assignedAgent = autoAssign(values.sector as Sector);
    const chosenProduct = products.find((p) => p.name === values.productName);

    createTicket(
      {
        userId:      currentUser.id,
        userName:    currentUser.name,
        userEmail:   currentUser.email,
        itemId:      chosenProduct?.id ?? "ITM-000",
        productName: values.productName,
        nature:      values.nature,
        description: values.description,
        attachment:  attachmentName,
        sector:      values.sector as Sector,
        priority:    "Medium",
      },
      assignedAgent
    );

    reset();
    setAttachmentName(null);
    setSubmitting(false);
    onSuccess(newId);
  };

  return (
    <div className="h-full overflow-y-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto px-6 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">New Ticket</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Describe your issue and we'll route it to the right team.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* Sector */}
        <div className="space-y-1.5">
          <label className={labelClass}>Sector <span className="text-red-500">*</span></label>
          <select
            {...register("sector", { required: true })}
            className={cn(inputClass, errors.sector && "border-red-400 dark:border-red-500")}
          >
            <option value="">Select sector…</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.sector && (
            <p className="text-xs text-red-500">Please select a sector.</p>
          )}
        </div>

        {/* Product Name */}
        <div className="space-y-1.5">
          <label className={labelClass}>Product <span className="text-red-500">*</span></label>
          <select
            {...register("productName", { required: true })}
            className={cn(inputClass, errors.productName && "border-red-400 dark:border-red-500")}
          >
            <option value="">Select product…</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
          {errors.productName && (
            <p className="text-xs text-red-500">Please select a product.</p>
          )}
        </div>

        {/* Problem (nature) */}
        <div className="space-y-1.5">
          <label className={labelClass}>Problem <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Device won't turn on"
            {...register("nature", { required: true, minLength: 5 })}
            className={cn(inputClass, errors.nature && "border-red-400 dark:border-red-500")}
          />
          {errors.nature && (
            <p className="text-xs text-red-500">Please describe the problem (at least 5 characters).</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className={labelClass}>Problem Description <span className="text-red-500">*</span></label>
          <textarea
            placeholder="Provide as much detail as possible — what happened, when, and any steps you've already tried."
            rows={4}
            {...register("description", { required: true, minLength: 10 })}
            className={cn(
              inputClass,
              "resize-none min-h-30",
              errors.description && "border-red-400 dark:border-red-500"
            )}
          />
          {errors.description && (
            <p className="text-xs text-red-500">Please add a description (at least 10 characters).</p>
          )}
        </div>

        {/* Attachment (optional) */}
        <div className="space-y-1.5">
          <label className={labelClass}>Attachment <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span></label>
          {attachmentName ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10">
              <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-xs text-indigo-700 dark:text-indigo-400 flex-1 truncate">{attachmentName}</span>
              <button
                type="button"
                onClick={() => setAttachmentName(null)}
                className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed cursor-pointer",
              "border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500",
              "hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 dark:hover:text-indigo-400",
              "transition-colors duration-150"
            )}>
              <Paperclip className="w-4 h-4 shrink-0" />
              <span className="text-xs">Click to attach a file</span>
              <input
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAttachmentName(file.name);
                }}
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="pt-1 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold",
              "bg-indigo-600 hover:bg-indigo-700 text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-[background-color,transform] duration-150 active:scale-[0.98]"
            )}
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "h-10 px-4 rounded-lg text-sm font-medium",
              "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
              "hover:bg-slate-100 dark:hover:bg-slate-800",
              "transition-colors duration-150"
            )}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
