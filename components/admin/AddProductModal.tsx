"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sector } from "@/lib/mockData";
import { createProduct } from "@/lib/api/products";

const SECTORS: Sector[] = ["IT", "Healthcare", "Education", "Finance"];
const UNITS: Array<"units" | "licenses"> = ["units", "licenses"];
const CATEGORIES = ["Laptop", "Networking", "Printer", "Security", "Accessories", "Medical Device", "Software", "Other"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddProductModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sector, setSector] = useState<Sector | "">("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState<"units" | "licenses" | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!category) e.category = "Category is required";
    if (!sector) e.sector = "Sector is required";
    if (!stock.trim()) e.stock = "Stock is required";
    else if (isNaN(Number(stock)) || Number(stock) < 0) e.stock = "Must be a non-negative number";
    if (!unit) e.unit = "Unit is required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    setApiError("");
    try {
      await createProduct({
        name: name.trim(),
        category,
        sector: sector as Sector,
        stock: Number(stock),
        unit: unit as "units" | "licenses",
      });
      handleClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    if (isLoading) return;
    setName(""); setCategory(""); setSector(""); setStock(""); setUnit(""); setErrors({}); setApiError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-slate-100">Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="product-name" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Product Name
            </Label>
            <Input
              id="product-name"
              placeholder="e.g. Dell Laptop XPS 15"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Category + Sector */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v || ""); setErrors((p) => ({ ...p, category: "" })); }}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="dark:text-slate-100 dark:focus:bg-slate-700">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sector</Label>
              <Select value={sector} onValueChange={(v) => { setSector(v as Sector); setErrors((p) => ({ ...p, sector: "" })); }}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s} className="dark:text-slate-100 dark:focus:bg-slate-700">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sector && <p className="text-xs text-red-500">{errors.sector}</p>}
            </div>
          </div>

          {/* Stock + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-stock" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Initial Stock
              </Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={stock}
                onChange={(e) => { setStock(e.target.value); setErrors((p) => ({ ...p, stock: "" })); }}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Unit</Label>
              <Select value={unit} onValueChange={(v) => { setUnit(v as "units" | "licenses"); setErrors((p) => ({ ...p, unit: "" })); }}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u} className="dark:text-slate-100 dark:focus:bg-slate-700 capitalize">{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-xs text-red-500">{errors.unit}</p>}
            </div>
          </div>

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
              {isLoading ? "Adding…" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
