"use client";

import { Package, Ticket, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { products, Sector } from "@/lib/mockData";
import { useState } from "react";

const SECTORS: (Sector | "All")[] = ["All", "IT", "Healthcare", "Education", "Finance"];

const sectorClass: Record<string, string> = {
  IT:         "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30",
  Healthcare: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  Education:  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  Finance:    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30",
};

const sectorIconStyle: Record<string, { bg: string; icon: string }> = {
  IT:         { bg: "bg-indigo-50 dark:bg-indigo-500/10",   icon: "text-indigo-500 dark:text-indigo-400"  },
  Healthcare: { bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: "text-emerald-500 dark:text-emerald-400" },
  Education:  { bg: "bg-amber-50 dark:bg-amber-500/10",    icon: "text-amber-500 dark:text-amber-400"    },
  Finance:    { bg: "bg-sky-50 dark:bg-sky-500/10",        icon: "text-sky-500 dark:text-sky-400"        },
};

type StockInfo = {
  label: string;
  dot: string;
  badgeClass: string;
  barColor: string;
  barWidth: number;
  warning: boolean;
};

function stockStatus(stock: number, unit: string): StockInfo {
  if (unit === "licenses") {
    if (stock === 0) return { label: "No Licenses",  dot: "bg-red-500",   badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",   barColor: "bg-red-400",   barWidth: 0,   warning: true  };
    if (stock < 20)  return { label: "Low Licenses",  dot: "bg-amber-500", badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20", barColor: "bg-amber-400", barWidth: 25,  warning: true  };
    return              { label: "Available",        dot: "bg-green-500", badgeClass: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20", barColor: "bg-green-400", barWidth: 100, warning: false };
  }
  if (stock === 0)   return { label: "Out of Stock",  dot: "bg-red-500",   badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",   barColor: "bg-red-400",   barWidth: 0,   warning: true  };
  if (stock <= 4)    return { label: "Low Stock",     dot: "bg-amber-500", badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20", barColor: "bg-amber-400", barWidth: 20,  warning: true  };
  return               { label: "In Stock",          dot: "bg-green-500", badgeClass: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20", barColor: "bg-green-400", barWidth: 100, warning: false };
}

const COLS = "grid-cols-[1fr_8rem_7rem_9rem_8.5rem_6rem]";
const TH = "py-3 px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500";

export default function ProductsPage() {
  const [sector, setSector] = useState<Sector | "All">("All");

  const filtered = sector === "All" ? products : products.filter((p) => p.sector === sector);

  const warnings = filtered.filter((p) => {
    const { warning } = stockStatus(p.stock, p.unit);
    return warning;
  }).length;

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div>
          <h2 className="font-heading text-base font-semibold text-slate-800 dark:text-slate-100">
            Products &amp; Stock
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {products.length} products across all sectors
          </p>
        </div>
        {warnings > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-2.5 py-1.5 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
            {warnings} item{warnings !== 1 ? "s" : ""} need restocking
          </div>
        )}
      </div>

      {/* Sector filter */}
      <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 gap-1 w-fit shrink-0">
        {SECTORS.map((s) => (
          <button
            key={s}
            onClick={() => setSector(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 ${
              sector === s
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Product list */}
      <Card className="flex-1 min-h-0 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No products in this sector</p>
            </div>
          ) : (
            <>
              {/* Sticky header */}
              <div className={`grid ${COLS} border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 shrink-0`}>
                <div className={`${TH} px-5`}>Product</div>
                <div className={TH}>Category</div>
                <div className={TH}>Sector</div>
                <div className={TH}>Stock</div>
                <div className={TH}>Status</div>
                <div className={`${TH} text-right`}>Tickets</div>
              </div>

              {/* Scrollable rows */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:var(--color-slate-300)_transparent] dark:[scrollbar-color:var(--color-slate-700)_transparent]">
                {filtered.map((p) => {
                  const { label, dot, badgeClass, barColor, barWidth } = stockStatus(p.stock, p.unit);
                  const iconStyle = sectorIconStyle[p.sector] ?? sectorIconStyle.IT;
                  return (
                    <div
                      key={p.id}
                      className={`grid ${COLS} border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-100`}
                    >
                      {/* Product */}
                      <div className="py-3 px-5 flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconStyle.bg}`}>
                          <Package className={`w-4 h-4 ${iconStyle.icon}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{p.id}</p>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="py-3 px-4 flex items-center">
                        <Badge variant="outline" className="text-xs text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                          {p.category}
                        </Badge>
                      </div>

                      {/* Sector */}
                      <div className="py-3 px-4 flex items-center">
                        <Badge variant="outline" className={`text-xs font-medium ${sectorClass[p.sector] ?? "text-slate-600 border-slate-200"}`}>
                          {p.sector}
                        </Badge>
                      </div>

                      {/* Stock with mini bar */}
                      <div className="py-3 px-4 flex flex-col justify-center gap-1.5">
                        <div className="flex items-baseline gap-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                            {p.stock.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{p.unit}</span>
                        </div>
                        <div className="w-20 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${barWidth}%` }} />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="py-3 px-4 flex items-center">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border ${badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                          {label}
                        </span>
                      </div>

                      {/* Tickets */}
                      <div className="py-3 px-4 flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Ticket className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                          {p.ticketCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
