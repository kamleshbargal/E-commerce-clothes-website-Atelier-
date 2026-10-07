import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = { variantId: string; title: string; size: string; color: string; price: number; quantity: number };
type CartState = { items: CartItem[]; isOpen: boolean; addItem: (item: CartItem) => void; removeItem: (variantId: string) => void; open: () => void; close: () => void };

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [], isOpen: false,
  addItem: (item) => set((state) => ({ items: [...state.items.filter((current) => current.variantId !== item.variantId), item], isOpen: true })),
  removeItem: (variantId) => set((state) => ({ items: state.items.filter((item) => item.variantId !== variantId) })),
  open: () => set({ isOpen: true }), close: () => set({ isOpen: false }),
}), { name: "stylehub-cart" }));
