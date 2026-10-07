"use client";

import { useCartStore } from "@/lib/cart-store";

export function CartDrawer() {
  const { items, isOpen, close, removeItem } = useCartStore();
  if (!isOpen) return null;
  return <aside className="fixed inset-y-0 right-0 z-20 w-full max-w-md bg-white p-6 shadow-2xl" aria-label="Shopping cart"><div className="flex items-center justify-between"><h2 className="text-3xl">Your cart</h2><button onClick={close} aria-label="Close cart">Close</button></div><div className="mt-8 space-y-4">{items.length === 0 ? <p>Your cart is empty.</p> : items.map((item) => <div className="flex justify-between border-b pb-4" key={item.variantId}><div><p>{item.title}</p><p className="text-sm text-stone-500">{item.size} / {item.color} x {item.quantity}</p></div><button onClick={() => removeItem(item.variantId)} className="text-[#b85037]">Remove</button></div>)}</div></aside>;
}
