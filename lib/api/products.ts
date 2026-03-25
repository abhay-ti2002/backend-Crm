import { Sector } from "@/lib/mockData";
import { useProductStore } from "@/stores/productStore";

// ─── Request / Response shapes ────────────────────────────────────────────────
// These match the expected REST contract. Keep in sync with your backend schema.

export interface CreateProductPayload {
  name: string;
  category: string;
  sector: Sector;
  stock: number;
  unit: "units" | "licenses";
}

export interface CreateProductResult {
  id: string;
  name: string;
  category: string;
  sector: Sector;
  stock: number;
  unit: string;
  ticketCount: number;
}

// ─── Service function ─────────────────────────────────────────────────────────

/**
 * Creates a new product.
 *
 * BACKEND INTEGRATION: replace the entire function body with:
 *
 *   const res = await fetch("/api/products", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(payload),
 *   });
 *   if (!res.ok) {
 *     const msg = await res.text().catch(() => "Unknown error");
 *     throw new Error(msg);
 *   }
 *   return res.json() as Promise<CreateProductResult>;
 */
export async function createProduct(
  payload: CreateProductPayload
): Promise<CreateProductResult> {
  const { addProduct } = useProductStore.getState();
  addProduct(payload);
  // Retrieve the record that was just inserted (matched by name + sector)
  const created = useProductStore
    .getState()
    .products.find((p) => p.name === payload.name && p.sector === payload.sector)!;
  return {
    id: created.id,
    name: created.name,
    category: created.category,
    sector: created.sector,
    stock: created.stock,
    unit: created.unit,
    ticketCount: created.ticketCount,
  };
}
