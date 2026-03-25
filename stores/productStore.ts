import { create } from "zustand";
import { products as mockProducts, Product, Sector } from "@/lib/mockData";

type NewProduct = Pick<Product, "name" | "category" | "stock" | "unit" | "sector">;

interface ProductStore {
  products: Product[];
  addProduct: (data: NewProduct) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: mockProducts,

  addProduct: (data) => {
    const newProduct: Product = {
      id: `ITM-${Date.now()}`,
      name: data.name,
      category: data.category,
      stock: data.stock,
      unit: data.unit,
      sector: data.sector,
      ticketCount: 0,
    };
    set({ products: [...get().products, newProduct] });
  },
}));
